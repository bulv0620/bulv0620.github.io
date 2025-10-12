---
date: 2025-10-12
title: 在Electron中实现跨进程数据双向同步
tags:
  - Electron
  - Vue3
  - Typescript
  - IPC
  - remoteRef
  - 双向数据流
description: 介绍一种在Electron中实现主进程与渲染进程数据双向同步的简洁方案，通过设计一个remoteRef函数实现跨进程共享状态。
---

# 在Electron中实现跨进程数据双向同步

## 1、背景与出发点

在 Electron 应用开发中，我们经常会遇到这样的场景：

- 渲染进程（Vue 前端）负责展示和编辑数据；
- 主进程负责管理底层逻辑、文件操作、网络通信等；
- 两边都需要维护一份 **相同的状态数据**，例如：
  - 当前共享文件列表；
  - 已连接设备列表；
  - 下载任务状态等。

---



## 2、问题：双份状态导致的同步噩梦

在 Electron 的安全模型下，**渲染进程不能直接访问 Node API**，而是必须通过 `preload` 暴露的安全接口进行通信。

于是，主渲染进程的数据同步通常这样写：

```typescript
// 渲染进程修改数据
ipcRenderer.send('update-list', list)

// 主进程收到后广播
ipcMain.on('update-list', (e, list) => {
  win.webContents.send('list-updated', list)
})
```

听起来简单，但问题很快就暴露出来：

- 每个状态都要写多对 `ipc` 通信；
- 每个方向都得考虑防止循环触发；
- 调试困难、代码重复、维护成本高。

**我只想要一个能自动同步的“远程响应值”！**

---



## 3、设计目标：一个能在主渲染间自动同步的“ref”

于是我设计了一个通用机制 —— **`remoteRef`**。

它的设计目标是：

1. 主进程维护一个响应式值；
2. 渲染进程通过 `useRemoteRef()` 获取并双向绑定；
3. 任意一端修改后，另一端自动更新；
4. 无需手写 `ipcMain`/`ipcRenderer`；
5. 可多窗口共享、可销毁、可复用。

最终效果：

```typescript
// 主进程
const sharedFiles = remoteRef('shared-files', [])

// 渲染进程
const list = useRemoteRef('shared-files', [])
list.value.push(newFile) // 会自动同步到主进程和其他窗口
```

是不是看起来很像 Vuex 的跨进程版本？😄

---



## 4、核心实现思路

整个实现由三部分组成：

1. **主进程模块（`utils/remoteRef.ts`）**：负责数据源、广播、接收更新。
2. **Preload 桥接模块（`preload/remoteRefBridge.ts`）**：安全中转层，通过 `contextBridge` 暴露到渲染端。
3. **Vue 封装（`useRemoteRef.ts`）**：在渲染进程中实现响应式双向绑定。

```
渲染进程                Preload                主进程
   │                       │                      │
   │ ── request-init ────> │                      │
   │                       │ ── request-init ───> │
   │                       │                      │
   │ <──── remote-ref:update ─────────────────────│  初始化同步
   │                                              │
修改state.value                                    │
   │                                              │
   │ ── remote-ref:change ───────────────────────>│
   │                                              │
   │ <──── remote-ref:update ─────────────────────│  广播给所有窗口
```

---

### 4.1、主进程：remoteRef 创建与广播

```typescript
export function remoteRef<T>(channel: string, initialValue: T): RemoteRefMain<T> {
  let value = structuredClone(initialValue)

  // 广播当前值给所有窗口
  const broadcast = (payload: { value: T; txnId?: string }) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send('remote-ref:update', channel, payload)
      }
    }
  }

  // 监听渲染进程发来的变更
  const changeListener = (_: any, ch: string, payload: { value: T; txnId?: string }) => {
    if (ch === channel) {
      value = payload.value
      broadcast(payload)
    }
  }

  ipcMain.on('remote-ref:change', changeListener)

  // 渲染端初始化时请求当前值
  ipcMain.on('remote-ref:request-init', (event, ch) => {
    if (ch === channel) {
      event.sender.send('remote-ref:update', ch, { value })
    }
  })

  return {
    get value() {
      return value
    },
    set value(v: T) {
      value = v
      broadcast({ value })
    },
    update(fn: (v: T) => void) {
      fn(value)
      broadcast({ value })
    },
    destroy() {
      ipcMain.removeListener('remote-ref:change', changeListener)
    },
  }
}
```

👉 简而言之：

- 主进程维护 `value`；
- 渲染进程可通过 `remote-ref:change` 请求修改；
- 主进程修改后通过 `remote-ref:update` 广播给所有窗口。

------

### 4.2、Preload 桥接层：remoteRefBridge

`preload` 层是安全通信桥，暴露受控 API：

```typescript
export const remoteRefBridge = {
  useRemoteRef<T>(channel: string, initialValue: T): RemoteRefRenderer<T> {
    const value = structuredClone(initialValue)
    const listeners = new Set<(payload: { value: T; txnId?: string }) => void>()

    const updateHandler = (_: any, ch: string, payload: any) => {
      if (ch === channel) listeners.forEach((fn) => fn(payload))
    }

    ipcRenderer.on('remote-ref:update', updateHandler)
    ipcRenderer.send('remote-ref:request-init', channel)

    return {
      get value() {
        return value
      },
      onUpdate(fn) {
        listeners.add(fn)
        return () => listeners.delete(fn)
      },
      destroy() {
        ipcRenderer.removeListener('remote-ref:update', updateHandler)
        listeners.clear()
      },
    }
  },

  updateRemoteRef<T>(channel: string, payload: { value: T; txnId?: string }) {
    ipcRenderer.send('remote-ref:change', channel, payload)
  },
}

contextBridge.exposeInMainWorld('remoteRef', remoteRefBridge)
```

------

### 4.3、渲染进程：Vue 响应式绑定

渲染端可以直接用 Vue3 的 `ref` 来包裹远程数据：

```typescript
export function useRemoteRef<T>(channel: string, initialValue: T): Ref<T> {
  const remote = window.remoteRef.useRemoteRef(channel, initialValue)
  const state = ref(remote.value) as Ref<T>
  const pending = new Set<string>()

  // 收到主进程更新
  remote.onUpdate((payload) => {
    if (payload.txnId && pending.has(payload.txnId)) {
      pending.delete(payload.txnId)
    } else {
      state.value = payload.value
    }
  })

  // 本地修改时发送更新
  watch(
    state,
    (val) => {
      const txnId = uuid()
      pending.add(txnId)
      window.remoteRef.updateRemoteRef(channel, {
        value: toRaw(val),
        txnId,
      })
    },
    { deep: true },
  )

  return state
}
```

这里的关键点是：

- 使用 `txnId` 防止**循环触发**；
- 使用 Vue 的 `watch` 实现**自动上行同步**；
- 任何一端修改，另一端都会立即更新。

---



## 5、 使用示例

### 5.1、主进程

```typescript
// main.ts
import { remoteRef } from './utils/remoteRef'

export const sharedFiles = remoteRef('shared-files', [])
```

### 5.2、渲染进程

```typescript
// useSharedFiles.ts
import { useRemoteRef } from '@/composables/useRemoteRef'

export const useSharedFiles = () => {
  const list = useRemoteRef('shared-files', [])
  return { list }
}
```

### 5.3、Vue 组件

```vue
<template>
  <div>
    <h3>共享文件</h3>
    <ul>
      <li v-for="file in list" :key="file.id">{{ file.name }}</li>
    </ul>
    <button @click="addFile">添加文件</button>
  </div>
</template>

<script setup lang="ts">
import { useSharedFiles } from '@/composables/useSharedFiles'

const { list } = useSharedFiles()

function addFile() {
  list.value.push({ id: Date.now(), name: '新文件.txt' })
}
</script>
```

> ✅ 现在，无论哪个窗口添加文件，主进程和所有渲染进程的列表都会自动同步！



## 6、总结

| 特性         | 说明                                 |
| ------------ | ------------------------------------ |
| 🧭 简洁       | 不需要手写繁琐的 IPC 通信            |
| 🔄 自动同步   | 任意端修改都会广播更新               |
| 🧠 防循环     | `txnId` 防止回环触发                 |
| 🪟 多窗口共享 | 所有窗口保持一致                     |
| 🧹 可销毁     | 关闭窗口时可清理监听                 |
| ⚙️ 可扩展     | 可以封装成 store 层或 reactive model |

`remoteRef` 让主进程与渲染进程之间的状态共享变得像操作本地变量一样自然。
 它本质上是一种**跨进程响应式同步机制**，在 Electron 的多进程架构中非常实用。

当然未来可以进一步扩展：

- ✅ 支持单向只读同步（如日志流）；
- ✅ 支持差量更新（Patch 而不是全量结构）；
- ✅ 与 `Pinia` 或 `Vuex` 自动集成；
- ✅ 结合 `BroadcastChannel` 实现跨设备同步。

------

💬 如果你也在开发 Electron 应用、苦于主渲染状态同步的麻烦，
 不妨试试这种模式——**让你的数据自然流动起来**。
