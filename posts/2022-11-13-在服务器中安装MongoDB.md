---
date: 2022-11-13
title: 在服务器中安装MongoDB
tags:
- mongodb
description: 在服务器中安装MongoDB
---

# 在服务器安装MongoDB

## 1、安装MongoDB

```shell
#!/bin/bash

# 下载目录
downloadsDir=/root/Downloads
# 安装目录
appDir=/usr/local/mongodb

# 判断备份目录是否存在，不存时新建目录 
[ ! -d $downloadsDir ] && mkdir -p $downloadsDir
cd $downloadsDir

# centos8安装mongo时, 报libcrypto.so.10错误 运行下方指令解决
# wget https://vault.centos.org/centos/8/AppStream/x86_64/os/Packages/compat-openssl10-1.0.2o-3.el8.x86_64.rpm
# rpm -ivh compat-openssl10-1.0.2o-3.el8.x86_64.rpm
# rm compat-openssl10-1.0.2o-3.el8.x86_64.rpm

# 下载mongodb 5.0.13版本
curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel70-5.0.13.tgz
# 解压mongodb
tar -zxvf mongodb-linux-x86_64-rhel70-5.0.13.tgz

rm -rf $appDir
mkdir -p $appDir

# 复制mongodb数据库文件到/usr/local/mongodb目录下
cp -r /root/Downloads/mongodb-linux-x86_64-rhel70-5.0.13/* $appDir

mkdir -p $appDir/data/db
mkdir -p $appDir/log
mkdir -p $appDir/conf
mkdir -p $appDir/bin
chmod -R 777 $appDir

cd $appDir/conf
echo "port=27017  #服务端口号" >> mongod.conf
echo "dbpath=data/db #数据库路径" >> mongod.conf
echo "logpath=log/mongod.log #日志文件" >> mongod.conf
echo "auth=true #启用验证" >>mongod.conf
echo "fork=true #守护进程" >> mongod.conf
echo "bind_ip=0.0.0.0 #允许所有设备访问" >> mongod.conf
cd ../

# 启动mongd服务
./bin/mongod -f conf/mongod.conf

# 开启端口防火墙 供远程访问
iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 27017 -j ACCEPT

# 连接数据库
./bin/mongo
```

​	创建一个`MongoDB.sh`文件，用记事本打开文件，将上方指令复制粘贴并保存，上传到服务器某个位置，执行`sudo sh MongoDB.sh`即可自动完成安装配置。

​	

## 2、添加管理员信息

​	shell脚本所生成的配置中是启用了身份验证的。我们在安装完mongodb后，此时库里面并没有管理员身份信息录入，所以可以不需要账号密码正常访问，当我们创建了一个管理员用户后，此时没有认证信息的话，是不能对数据库进行任何操作的。

​	配置管理员信息的流程如下：

1. 打开mongodb：在shell脚本运行完后，会自动打开mongodb的工作控制台。如果不小心退出了，可以在终端中执行`/usr/local/mongodb/bin/mongo`，即可打开工作台。

2. 切换到admin库：在工作台中输入`use admin`，切换到admin库

3. 创建用户：在工作台输入以下代码

   ```js
   db.createUser({
     user: 'root',  // 用户名
     pwd: 'root',  // 密码
     roles:[{
       role: 'root',  // 角色
       db: 'admin'  // 数据库
     }]
   })
   ```

​	在添加了管理员信息后，我们在库中使用`show users`就可以查看当前库下的用户（当然你可能需要验证身份：`db.auth('admin', '123456')`）。



## 3、连接使用

​	在nodejs项目中使用mongoose连接数据库：

1. 安装mongoose：

   ```shell
   npm install mongoose --save
   ```

2. 导入mongoose：

   ```js
   const mongoose = require('mongoose');
   ```

3. 建立连接：

   ```js
   mongoose.connect('mongodb://<数据库用户名>:<数据库密码>@<服务器地址>:27017'); // <>中的内容对应替换
   ```

4. 完整代码：

   ```js
   const mongoose = require('mongoose'); // mongoose ^6.7.2
   
   main().then(() => {
     console.log('connected')
   }).catch(err => console.log(err));
   
   async function main() {
     await mongoose.connect('mongodb://<数据库用户名>:<数据库密码>@<服务器地址>:27017');
   }
   ```
