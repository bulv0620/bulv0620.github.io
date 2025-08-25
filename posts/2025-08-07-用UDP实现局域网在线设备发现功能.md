---
date: 2025-08-07
title: 用UDP实现局域网在线设备发现功能
tags:
- Nodejs
- dgram
- UDP
- 局域网
description: 本文将介绍如何使用Nodejs的dgram库实现基于UDP的局域网设备发现
---

# 用 UDP 实现局域网在线设备发现

## 一、背景简介

当需要在应用中集成发现局域网下的设备，常规的方案有这些：

- **自定义 UDP 广播协议**（如 `udp-discovery`）适合定制服务
- **标准协议如 SSDP（UPnP）**适合兼容第三方设备
- **mDNS / DNS‑SD**用于零配置网络发现
- **Ping / ARP / TCP 扫描**适合发现在线主机但无法获取服务详情

在没有中心服务器的前提下，要实现本地工具发现同子网其他运行实例的场景，**UDP广播**发现的方式更灵活更适合。

本文将介绍如何使用Nodejs的dgram库实现基于UDP的局域网设备发现。



## 二、核心流程

1. **客户端** 定时向广播地址发送 `"DISCOVER"` 消息。
2. **设备端** 接到后返回包含自身状态的 JSON 结构。
3. **客户端** 保持收到消息缓存上线设备的 IP 及信息，并触发上线／更新事件。
4. **定时清理** 超时未回应的设备，触发下线事件。

每台节点都可以既广播又响应，形成“都像客户端，也像服务器”的对等结构。



## 三、实践示例

我们将使用 Node.js 内置的 `dgram` 模块，实现一个支持广播、监听、设备缓存、状态判断的 `DeviceDiscovery` 类。此类具备自动广播自身状态和监听其他设备状态的功能。

### 步骤一：引入模块

我们首先引入所需模块，并继承 `EventEmitter` 用于事件驱动设计：

```js
const dgram = require('dgram');
const EventEmitter = require('events');
const isEqual = require('./isEqual'); // 判断设备信息是否有变化
```

创建类并初始化基本配置项：

```js
class DeviceDiscovery extends EventEmitter {
  constructor(options = {}) {
    super();
    this.chanel = options.chanel || 'UDP_BROADCAST_CHANEL';
    this.port = options.port || 9520;
    this.broadcastAddress = options.broadcastAddress || '255.255.255.255';
    this.interval = options.interval || 2000;
    this.server = dgram.createSocket('udp4');

    this.info = options.info || {}; // 当前设备信息
    this.onlineDevices = {};        // 缓存在线设备列表
    this.broadcastTimer = null;
    this.cleanupTimer = null;

    this.init();
  }
```

----

### 步骤二：初始化广播监听器

我们在 `init()` 方法中设置监听逻辑与广播/清理定时器：

```js
  init() {
    this.server.on('message', (msg, rinfo) => {
      const ip = rinfo.address;
      let message;
      try {
        message = JSON.parse(msg.toString());
      } catch {
        console.error('收到异常消息');
        return;
      }

      // 设备首次上线
      if (!this.onlineDevices[ip]) {
        this.onlineDevices[ip] = {
          lastSeen: Date.now(),
          info: message.info
        };
        this.emit('deviceOnline', ip, message);
      } else {
        // 信息有更新则触发更新事件
        if (!isEqual(this.onlineDevices[ip].info, message.info)) {
          process.nextTick(() => {
            this.emit('deviceUpdate', ip, message);
          });
        }

        // 更新最后通信时间
        this.onlineDevices[ip].lastSeen = Date.now();
        this.onlineDevices[ip].info = message.info;
      }
    });

    this.broadcastTimer = setInterval(this.broadcastMessage.bind(this), this.interval);
    this.cleanupTimer = setInterval(this.cleanupOfflineDevices.bind(this), this.interval);

    this.server.bind(this.port, () => {
      this.server.setBroadcast(true);
      console.log(`UDP server listening on port ${this.port}`);
    });
  }
```

----

### 步骤三：发送广播消息

我们周期性地向广播地址发送包含设备信息的消息：

```js
  broadcastMessage() {
    const message = {
      info: this.info
    };

    const messageStr = JSON.stringify(message);

    this.server.send(
      messageStr,
      0,
      messageStr.length,
      this.port,
      this.broadcastAddress,
      (err) => {
        if (err) {
          console.error('广播失败:', err);
        }
      }
    );
  }
```

----

### 步骤四：清理离线设备

我们根据最后心跳时间判断设备是否已下线，并触发事件：

```js
  cleanupOfflineDevices() {
    const currentTime = Date.now();
    Object.keys(this.onlineDevices).forEach((ip) => {
      if (currentTime - this.onlineDevices[ip].lastSeen > this.interval * 2) {
        delete this.onlineDevices[ip];
        this.emit('deviceOffline', ip);
      }
    });
  }
```

----

### 步骤五：提供辅助方法

支持动态设置设备信息与获取当前在线设备列表：

```js
  setInfo(data) {
    this.info = data;
  }

  getOnlineDevices() {
    return Object.keys(this.onlineDevices).map((ip) => ({
      ip,
      ...this.onlineDevices[ip]
    }));
  }
}
```

----

### 步骤六：使用示例

我们可以像这样使用该类，在一个 Node.js 进程中开启广播监听：

```js
const discovery = new DeviceDiscovery({
  port: 3333,
  broadcastAddress: '255.255.255.255',
  interval: 2000,
  info: {
    name: 'Device A',
    port: 8080
  }
});

discovery.on('deviceOnline', (ip, message) => {
  console.log(`设备上线：${ip}`, message);
});

discovery.on('deviceOffline', (ip) => {
  console.log(`设备下线：${ip}`);
});

discovery.on('deviceUpdate', (ip, message) => {
  console.log(`设备信息更新：${ip}`, message);
});
```

这样，我们就实现了一个完整的、可复用的、事件驱动的局域网设备发现机制。



## 四、更进一步

当前实现已支持设备广播、监听、状态缓存和事件触发，能够满足基础的局域网设备发现需求。不过，在更复杂或更严谨的场景中，我们仍可从以下几个方面进行优化和增强：

### 1. 覆盖所有子网（遍历接口 Broadcast 地址）

使用 `255.255.255.255` 是简便做法，但在多网卡、多子网环境下可能不能广播到所有机器。建议增加对每个网络接口的 broadcast 地址发送，增加兼容性：

```js
const os = require('os');
for (const iface of Object.values(os.networkInterfaces())) {
  for (const addr of iface) {
    if (addr.family === 'IPv4' && !addr.internal && addr.broadcast) {
      socket.send(..., addr.broadcast, ...);
    }
  }
}
```

----

### 2. bind 监听地址与 reuseAddr

你当前 `server.bind(port)` 默认监听所有本地地址，建议显式开启 `reuseAddr: true`，兼容进程重启或多个实例监听同端口的场景：

```js
socket.bind({ port, exclusive: false });
```

Node.js 文档对此有说明 [Node.js](https://nodejs.org/api/dgram.html)。

----

### 3. 增加可靠性机制（可选）

UDP 本身不可靠，你可以加入简单重试、ack 机制，确保关键消息不会丢失。比如回应时带上一个请求 ID，避免重复处理，也参考一些可靠 UDP 实现思路 [Medium](https://dgviranmalaka.medium.com/make-udp-communication-more-reliable-in-nodejs-b554acd5c120)。

----

### 4. 错误处理和关闭逻辑

当前类未处理 `server.on('error')` 和退出时 cleanup socket，这会影响稳定性。建议捕获 error 事件并在必要时关闭 socket 并清理定时器。

----

### 5. 消息格式和身份校验

将发送的 `message.info` 包含一个 `nodeId` 或时间戳字段，有助于去重、版本管理，同时也方便防止伪造或并发冲突。
