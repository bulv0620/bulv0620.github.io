---
date: 2024-02-07
title: Typescript装饰器基础
tags:
- Typescript
- 装饰器
description: Typescript中装饰器基础使用介绍
---

# Typescript装饰器基础

> 本文将介绍Typescript语言中装饰器的概念以及基本使用方法

## 1、简介

熟悉Nestjs、Angular或者后端Spring框架的应该对装饰器不陌生，装饰器通常在类、方法、访问器、属性、参数上注解，改变类的行为或者添加元数据，可以在不修改类中代码的情况下，增强功能或修改行为。

装饰器本质上就是一个函数，不同的装饰器接收不同参数，并返回不同的结果。在 TypeScript 中，装饰器可以通过 `@` 符号应用于类、方法、属性等各种声明上。



## 2、自定义装饰器

我们有两种方式编写自定义装饰器：

### 2.1、函数方式

```typescript
// 定义装饰器函数
function log(target: any, key: string, descriptor: PropertyDescriptor) {
    // 保存原始方法
    const originalMethod = descriptor.value;

    // 重新定义方法
    descriptor.value = function(...args: any[]) {
        console.log(`Method called: ${key}, Arguments: ${args}`);
        return originalMethod.apply(this, args);
    };

    return descriptor;
}

// 使用装饰器
class MyClass {
    @log
    myMethod(arg: string) {
        console.log(`Executing myMethod with argument: ${arg}`);
    }
}

// 创建实例并调用方法
const instance = new MyClass();
instance.myMethod("hello");
```

### 2.2、装饰器工厂方式

```typescript
// 定义装饰器工厂
function logFactory(prefix: string) {
    // 返回装饰器函数
    return function(target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function(...args: any[]) {
            console.log(`${prefix} Method called: ${key}, Arguments: ${args}`);
            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

// 使用装饰器工厂
class MyClass {
    @logFactory("Custom Log:")
    myMethod(arg: string) {
        console.log(`Executing myMethod with argument: ${arg}`);
    }
}

// 创建实例并调用方法
const instance = new MyClass();
instance.myMethod("hello");
```



## 3、装饰器的类型

Typescript的装饰器有五种类型，针对不同类型的装饰器有不同的参数和返回值：

### 3.1、类装饰器

类装饰器接收一个参数，即被装饰的**类的构造函数**。装饰器可以返回一个**新的构造函数**，或者修改传入的构造函数，或者仅仅在类的声明上添加一些元数据信息。

- 参数
  - 类的构造函数
- 返回值
  - 新的构造函数
  - 空

```typescript
function classDecorator(constructor: Function) {
    console.log("Class decorator called.");
}

@classDecorator
class MyClass {
    // class implementation
}
```

### 3.2、方法装饰器

方法装饰器接收三个参数：被装饰的类的**原型对象**、**方法名**、方法的**属性描述符**。装饰器可以返回一个**新的属性描述符**，或者直接修改属性描述符。

- 参数
  - 类的原型对象
  - 方法名
  - 方法的属性描述符
- 返回值
  - 新的属性描述符
  - 无

```typescript
function methodDecorator(target: any, key: string, descriptor: PropertyDescriptor) {
    console.log("Method decorator called.");
}

class MyClass {
    @methodDecorator
    myMethod() {
        // method implementation
    }
}
```

> 属性描述符`PropertyDescriptor`包含以下键：
>
> 1. `value`: 属性的值（对于方法来说，即方法本身）。
> 2. `writable`: 表示属性的值是否可写（即是否可以修改），默认为 true。
> 3. `enumerable`: 表示属性是否可以枚举（即是否可以在 for...in 循环中被枚举），默认为 true。
> 4. `configurable`: 表示属性是否可以被修改或删除，以及是否可以修改属性的特性（writable、enumerable、configurable），默认为 true。

### 3.3、访问器装饰器

访问器装饰器接收三个参数：被装饰的类的**原型对象**、**访问器的名字**（`get` 或 `set`）、**属性描述符**。装饰器可以返回一个**新的属性描述符**，或者直接修改属性描述符。

- 参数
  - 类的原型对象
  - 访问器的名字（`get`或`set`）
  - 属性描述符
- 返回值
  - 新的属性描述符
  - 无

```typescript
function accessorDecorator(target: any, key: string, descriptor: PropertyDescriptor) {
    console.log("Accessor decorator called.");
}

class MyClass {
    private _myProperty: string = "";

    @accessorDecorator
    get myProperty(): string {
        return this._myProperty;
    }

    set myProperty(value: string) {
        this._myProperty = value;
    }
}
```

### 3.4、属性装饰器

属性装饰器接收两个参数：被装饰的类的**原型对象**和**属性名**。装饰器**不能直接返回值**，通常用于添加一些元数据信息。

- 参数
  - 类的原型对象
  - 属性名
- 返回值
  - 无

```typescript
function propertyDecorator(target: any, key: string) {
    console.log("Property decorator called.");
}

class MyClass {
    @propertyDecorator
    myProperty: string = "";
}

```

### 3.5、参数装饰器

参数装饰器接收三个参数：被装饰的类的**原型对象**、**方法名或访问器名**、参数在函数参数列表中的**索引**。装饰器**不能直接返回值**，通常用于修改函数参数或添加一些元数据信息。

- 参数
  - 类的原型对象
  - 方法名或访问器名
  - 参数在函数参数列表中的索引
- 返回值
  - 无

```typescript
function parameterDecorator(target: any, methodName: string, parameterIndex: number) {
    console.log("Parameter decorator called.");
}

class MyClass {
    myMethod(@parameterDecorator arg1: string, @parameterDecorator arg2: number) {
        // method implementation
    }
}
```



## 4、装饰器的应用

装饰器典型的应用如下：

1. 添加日志记录
2. 权限控制
3. 声明式数据验证
4. 依赖注入
5. 生成文档
6. 与框架集成（比如 Angular 中的 Component 装饰器）

*具体实践中将利用注解实现IOC(控制反转)、DI(依赖注入)*











