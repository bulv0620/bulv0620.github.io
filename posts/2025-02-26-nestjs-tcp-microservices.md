---
date: 2025-02-26
title: NestJS TCP 微服务：创建与调用完整指南
tags:
- Typescript
- NestJS
- 微服务
- tcp
description: NestJS TCP 微服务：创建与调用完整指南
---

# NestJS TCP 微服务：创建与调用完整指南

## 接收端

### 启动微服务

接收端第一步需要连接到微服务，可以用两种方式：

1. 直接创建微服务app
2. 将常规app实例连接到微服务，转换为混合模式

一般我们采用第二种模式，示例如下

```typescript
// apps/base/src/main.ts
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { BaseModule } from './base.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { TransformInterceptor } from '@app/common'
import { HttpExceptionFilter } from '@app/common'
import { ConfigService } from '@nestjs/config'
import { Transport } from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.create(BaseModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.setGlobalPrefix('api')

  // 连接微服务核心部分
  app.connectMicroservice({
    transport: Transport.TCP, // tcp模式
    options: {
      host: '127.0.0.1', // 微服务host一般即为本地
      port: 3005, // 微服务端口
    },
  })
  await app.startAllMicroservices() // 启动微服务

  await app.listen(3000)
}
bootstrap()
```

### 提供微服务接口

在需要添加服务的controller文件中添加函数，并注解`@MessagePattern('name')`

> 示例在user模块下创建一个getHello

```typescript
// apps/base/src/modules/user/user.controller.ts
import {
  Controller,
} from '@nestjs/common'
import { UserService } from './user.service'
import { MessagePattern } from '@nestjs/microservices'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('getHello') // 此处为提供的接口名称
  getHello(name: string): string { // 可通过函数参数传参
    return 'hello ' + name
  }
}
```



完成以上步骤后，我们就将base应用连接到了本地3005端口微服务，并提供了一个`getHello`微服务接口



## 发送端

### 注册微服务

在发送的module中我们需要注册需要连接的服务

> 示例中将在server应用的simulation模块下注册`BASE_SERVICE`的服务，连接到刚刚创建的本地3005端口base微服务·

```typescript
// apps/server/src/modules/simulation/simulation.module.ts
import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'BASE_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 3005,
        },
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class ServerModule {}
```



### 请求接口

当我们需要在某个模块中请求微服务接口，我们只需要注入注册的微服务客户端实例，调用`send()`方法即可

```
ClientProxy<Record<never, Function>, string>.send<string, any>(pattern: any, data: any): Observable<string>
```

> 为了简单演示，示例将在server应用的simulation模块的controller中直接调用并返回微服务返回的结果

```typescript
// apps/server/src/modules/simulation/simulation.controller.ts
import { Controller, Get, Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'

@Controller('simulation')
export class SimulationController {
  constructor(@Inject('BASE_SERVICE') private readonly client: ClientProxy) {}

  @Get('hello')
  hello() {
    return firstValueFrom(this.client.send<string>('getHello', 'bulv'))
  }
}
```

此时调用接口将得到返回值：`hello bulv`
