---
date: 2025-08-25
title: Electron项目IPC通信最佳实践
tags:
- Nodejs
- Typescript
- Electron
- electron-vite
- IPC
- 最佳实践
description: 这篇博客介绍了一种为 Electron 应用设计的、追求极致类型安全和高度自动化的 IPC 通信封装方案，通过动态生成 API 和精巧的类型体操，让进程间调用像本地函数一样安全直观。
---

# Electron项目IPC通信最佳实践

## 一、背景简介

在 Electron 应用开发中，**渲染进程与主进程的通信**是核心问题之一。很多时候，我们需要在前端页面里调用底层能力，比如文件系统操作、系统 API 或应用内部逻辑，如果把 Node.js API 直接暴露给渲染进程，就等于给了所有前端脚本读写文件、执行命令的权限；一旦页面中存在 XSS 漏洞，后果会非常严重。所以这类调用通常通过 IPC（Inter-Process Communication）完成。

在我最近的项目中，我尝试对 IPC 通信做了一层封装，目标是：

- 渲染进程只能通过受控的接口调用主进程功能
- 易于维护和修改
- 类型安全

------



## 二、ipc通信方式简介

Electron 从一开始就提供了 `ipcRenderer` 与 `ipcMain` 事件机制，支持进程之间通过事件消息来交互。但在实际开发中，事件监听与手动回调管理可能比较繁琐，因此自 **Electron v7** 起，官方新增了一对更简洁的 API：`ipcRenderer.invoke` 与 `ipcMain.handle`。

它们的核心思路很直观：

- 在 **主进程** 中使用 `ipcMain.handle(channel, handler)` 注册一个处理函数。
- 在 **渲染进程** 中使用 `ipcRenderer.invoke(channel, ...args)` 发送请求，并等待返回结果。

这种模式和「远程函数调用」很像 —— 渲染进程就像在调用一个异步函数，而主进程负责实际执行逻辑并返回结果。

以下是使用示例：

**主进程（main.js）**

```javascript
import { app, BrowserWindow, ipcMain } from 'electron'

app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: './preload.js' // 推荐通过 preload 暴露 API
    }
  })

  win.loadFile('index.html')

  // 注册一个 IPC 处理器
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })
})
```

**渲染进程（renderer.js）**

```javascript
import { ipcRenderer } from 'electron'

async function showVersion() {
  const version = await ipcRenderer.invoke('get-app-version')
  console.log('App Version:', version)
}

showVersion()
```

这样，渲染进程就可以像调用一个普通异步函数一样，获取主进程返回的结果。

> 当然不要直接在渲染进程中用 `ipcRenderer.invoke`，最好通过 `preload` + `contextBridge` 暴露受控 API，这将在后续的封装中介绍

------



## 三、为什么要封装？

虽然 `ipcRenderer.invoke` / `ipcMain.handle` 已经比传统事件机制好用很多，但在真实项目里，直接裸用还是会遇到一些问题：

- **字符串易出错**：调用和处理函数都依赖 channel 字符串，拼写错误不容易被发现，维护成本高。
- **类型不安全**：调用参数和返回值缺乏约束，容易在调用端和处理端产生不一致。
- **缺少抽象层**：渲染进程到处散落着 `ipcRenderer.invoke('xxx')`，不利于管理和复用。
- **安全风险**：如果随意开放 IPC channel，渲染进程就可能绕过限制访问敏感 API。

基于这些痛点，我在项目里设计了一套更接近「远程函数调用」的封装方式：

下面，我会逐步展示这一套封装的具体实现思路。

------



## 四、IPC 封装方式

我将采用**electron-vite**快速创建一个electron+vite+vue3的项目，并在其中进行封装介绍。

### 1、创建项目

```
npm create @quick-start/electron@latest
```

按照提示进行创建即可

```
Need to install the following packages:
@quick-start/create-electron@1.0.28
Ok to proceed? (y) y


> npx
> create-electron

√ Project name: ... electron-app
√ Select a framework: » vue
√ Add TypeScript? ... No / Yes
√ Add Electron updater plugin? ... No / Yes
√ Enable Electron download mirror proxy? ... No / Yes

Scaffolding project in C:\Users\jtfengjt\Desktop\electron-app...

Done. Now run:

  cd electron-app
  npm install
  npm run dev
```

### 2、项目结构

electron-vite默认的项目结构如下

```
├──src
│  ├──main
│  │  ├──index.ts
│  ├──preload
│  │  ├──index.ts
│  │  └──index.d.ts
│  └──renderer
│     ├──src
│     ├──index.html
├──electron.vite.config.ts
├──package.json
└──...
```

IPC封装思路如下：

- 在main中创建一个events目录用于组织处理事件
- `main/index.ts`中注册handle
- `preload/index.ts`中生成api
- `preload/index.d.ts`中维护api的类型
- renderer的页面中通过`window.ipc.module.function`调用

### 3、事件注册

在main中创建events目录，在events目录下创建一个`eventLoader.ts`文件暴露一个注册所有事件方法

同时在events下创建一个`hello/index.ts`用于测试

测试案例结构如下：

```
├──src
│  ├──main
│  │  ├──events
│  │  │  ├──hello
│  │  │  │  ├──index.ts
│  │  │  ├──eventLoader.ts
│  │  ├──index.ts
```

代码如下：

```typescript
// main/events/hello/index.ts
import { IpcMainInvokeEvent } from 'electron'

export function helloworld(_: IpcMainInvokeEvent, name: string): string {
  return `hello ${name}`
}
```

```typescript
// main/events/eventLoader.ts
import { ipcMain } from 'electron'
import * as helloEvents from './hello'

// 事件映射
export const eventsMap = {
  hello: helloEvents,
}

export const handlerKeys: string[] = []

export function registerAllEvents() {
  Object.entries(eventsMap).forEach(([namespace, handlers]) => {
    Object.entries(handlers).forEach(([eventName, fn]) => {
      const key = `${namespace}:${eventName}`
      handlerKeys.push(key)

      ipcMain.handle(key, (_event, ...params) => (fn as Function)(_event, ...params))
    })
  })

  // 暴露一个 handler，让 preload 获取事件名
  ipcMain.handle('get-events-map', () => {
    const map: Record<string, string[]> = {}
    Object.entries(eventsMap).forEach(([namespace, handlers]) => {
      map[namespace] = Object.keys(handlers)
    })
    return map
  })
}

export type EventsMapType = typeof eventsMap
```

然后在`main/index.ts`中调用`registerAllEvents`即可：

```typescript
// main/index.ts
app.whenReady().then(() => {
  registerAllEvents()
})
```

后续如果在events目录中增加其他模块，只需要在eventsLoader中`import * `然后再加入到eventsMap中即可。



### 4、preload生成API

刚刚在**eventLoader**中暴露了一个特殊的handler：`get-events-map`

在preload/index.ts中利用这个事件获取到一个事件map然后生成api即可

代码如下：

```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {}

async function generateApi() {
  const api: Record<string, Record<string, (...args: any[]) => Promise<any>>> = {}
  const eventsMap: Record<string, string[]> = await ipcRenderer.invoke('get-events-map')

  for (const [namespace, events] of Object.entries(eventsMap)) {
    api[namespace] = {}
    for (const eventName of events) {
      const key = `${namespace}:${eventName}`
      api[namespace][eventName] = (...args: any[]) => ipcRenderer.invoke(key, ...args)
    }
  }

  return api
}

generateApi().then((ipc) => {
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld('electron', electronAPI)
      contextBridge.exposeInMainWorld('api', api)
      contextBridge.exposeInMainWorld('ipc', ipc)
    } catch (error) {
      console.error(error)
    }
  } else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
    // @ts-ignore (define in dts)
    window.ipc = ipc
  }
})
```

通过generateApi函数获取到事件map然后生成一个个的`ipcRenderer.invoke(key, ...args)`

通过**contextBridge**将操作全部挂到`window.ipc`上



### 5、TS类型

以上操作只是将事件注册并生成api，但是依然没有做到类型支持

需要在`preload/index.d.ts`中，根据**eventLoader**提供的`EventsMapType`生成相应的api类型

代码如下：

```typescript
// preload/index.d.ts
import { ElectronAPI } from '@electron-toolkit/preload'
import { EventsMapType } from '../main/events/eventLoader'

// 去掉 IpcMainInvokeEvent（第一个参数）
type StripFirstArg<F> = F extends (first: any, ...args: infer P) => infer R
  ? (...args: P) => Promise<R>
  : never

export type IpcApi = {
  [Namespace in keyof EventsMapType]: {
    [Handler in keyof EventsMapType[Namespace]]: StripFirstArg<EventsMapType[Namespace][Handler]>
  }
}


declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    ipc: IpcApi
  }
}
```

在renderer调用时并没有IpcMainInvokeEvent这个参数，所以在类型中去掉第一个参数即可



### 6、renderer调用

在上述内容完成后，在renderer中输入`window.ipc.hello`就可以看到如下代码提示（vscode为例）：

```
(property) hello: {
    helloworld: (name: string) => Promise<string>;
}
```

调用事件就通过`window.ipc.hello.helloworld(name)`调用。

------



## 五、总结

在实际实践中只需要在events目录中增加相应的处理模块目录，然后在**eventLoader**中导入并加入`eventsMap`，renderer中即可通过`window.ipc.module.function`调用对应处理函数，非常简便。

这套封装基本完成了目标需求：

- 渲染进程只能通过受控的接口调用主进程功能（强制通过 preload 暴露api）
- 易于维护和修改（高度自动化）
- 类型安全（完美的ts支持）

当然在错误处理上可以进行进一步封装，例如加入统一的消息返回格式和全局的错误处理机制。

🎉~

