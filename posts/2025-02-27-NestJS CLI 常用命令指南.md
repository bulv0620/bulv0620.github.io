---
date: 2025-02-27
title: NestJS CLI 常用命令指南
tags:
- Typescript
- NestJS
- 后端
- 命令
description: NestJS CLI 常用命令指南
---

# NestJS CLI 常用命令指南

> 在构建大型应用程序时，合理的目录结构对于代码的可维护性和可扩展性至关重要。 NestJS 提供了强大的命令行工具（CLI），使得在指定目录下创建模块变得简单高效。 本文将详细介绍如何在 NestJS 项目中使用 CLI 创建模块，并将其放置在自定义目录结构下。

## 1. 安装 NestJS CLI

首先，确保全局安装了 NestJS CLI 工具：

```bash
npm install -g @nestjs/cli
```



## 2. 创建新项目

使用以下命令创建一个新的 NestJS 项目：

```bash
nest new 项目名称
```

在创建过程中，CLI 会提示您选择包管理器（如 npm 或 yarn）以及其他配置选项。



## 3. 在指定目录下创建模块

假设您希望将所有模块放置在 `modules` 目录下，并在其中创建一个名为 `user` 的模块。 您可以使用以下命令：

```bash
nest g module modules/user
```

该命令将在 `src/modules/user` 目录下创建 `user` 模块。



## 4. 生成模块及其相关文件

如果您希望同时生成模块、控制器和服务，可以使用 `resource` 命令：

```bash
nest g resource modules/user
```



执行该命令后，CLI 会提示您选择生成的类型，如 REST API、GraphQL 等，并询问是否需要生成 CRUD 操作。 根据您的需求进行选择，CLI 将在 `src/modules/user` 目录下生成相应的文件。



## 5. 禁用生成测试文件

如果您不需要生成测试文件，可以在命令中添加 `--no-spec` 选项：

```bash
nest g module modules/user --no-spec
```



这将在 `src/modules/user` 目录下创建 `user` 模块，并且不会生成测试文件。



## 6. 在多应用程序项目中创建模块

如果您的项目是一个多应用程序（monorepo）结构，您可以在特定的应用程序中创建模块。 首先，确保您的项目配置了 `nest-cli.json` 文件，并在其中定义了多个项目。 然后，使用以下命令在特定应用程序中创建模块：

```bash
nest g module 模块名称 -p 应用名称
```

例如，在名为 `admin` 的应用程序中创建 `user` 模块：

```bash
nest g module user -p admin
```

这将在 `admin` 应用程序的 `src` 目录下创建 `user` 模块。



## 7. 查看帮助信息

要查看 NestJS CLI 的帮助信息，可以使用：

```bash
nest --help
```

该命令会列出所有可用的命令及其简要说明。



## 总结

通过上述方法，您可以在 NestJS 项目中灵活地创建模块，并将其放置在指定的目录结构下。 这有助于保持项目的组织性和可维护性。 更多关于 NestJS CLI 的使用，请参考官方文档。
