---
date: 2023-04-15
title: docker中的mongodb备份数据
tags:
- Docker
- MongoDB
description: 在Docker中导入导出MongoDB实例的数据
---

# Docker中的MongoDB导出数据

当我们进行数据库迁移的时候，自然而然就会用到数据库的导入和导出，本文将介绍MongoDB数据导出导入的方式，以及如何在Docker中导入导出MongoDB实例的数据。

## 1、数据导出：mongoexport

Mongdb中的mongoexport 工具可以将collection 导出成JSON格式或者CSV格式的文件。可以通过参数指定导出的数据项，也可以根据指定的条件导出数据。

### 1.1、语法

```mongoexport -h [host] --port [port] -u [username] -p [password] -d [dbname] -c [collectionname] -o [fiepath] --type [json/csv] -f [field]```

- `-h`: 主机ip
- `--port`: mongodb端口
- `-u`: 数据库访问用户名
- `-p`: 数据库访问密码
- `-d`: 数据库名
- `-c`: collection名
- `-o`: 输出文件路径
- `--type`: 输出的格式。默认为json
- `-f`: 输出的字段，如果type为CSV，则需要加上 -f "字段名"

### 1.2、示例

```bash
mongoexport -h 127.0.0.1 --port 27017 -u username -p password -d testdb -c testc -o /home/mongodb --type json
```



## 2、数据导入：mongoimport

mongoimport工具用于导入格式为JSON或CSV的数据。

### 2.1、语法

`mongoimport -h [host] --port [port] -u [username] -p [password] -d [dbname] -c [collectionname] --file [fiepath] --type [json/csv] -f [field] `

- `-h`: 主机ip
- `--port`: mongodb端口
- `-u`: 数据库访问用户名
- `-p`: 数据库访问密码
- `-d`: 数据库名
- `-c`: collection名
- `--file`: 导入文件路径
- `--type`: 输出的格式。默认为json
- `-f`: 输出的字段，如果type为CSV，则需要加上 -f "字段名"

### 1.2、示例

```bash
mongoexport -h 127.0.0.1 --port 27017 -u username -p password -d testdb -c testc --file /home/mongodb/export.json --type json
```



## 3、导出所有数据：mongodump

mongodump工具可以导出数据库所有数据。

### 3.1、语法

`mongodump -h [host] --port [port] -u [username] -p [password] -d [dbname] -o [filepath] `

- `-h`: 主机ip
- `--port`: mongodb端口
- `-u`: 数据库访问用户名
- `-p`: 数据库访问密码
- `-d`: 数据库名
- `-o`: 输出文件位置

### 3.2、示例

```bash
mongodump -h 127.0.0.1 --port 27017 -u username -p password -d testdb -o /home/mongodb/testdb
```



## 4、数据恢复：mongorestore

### 3.1、语法

`mongorestore -h [host] --port [port] -u [username] -p [password] -d [dbname] --dir [filepath] `

- `-h`: 主机ip
- `--port`: mongodb端口
- `-u`: 数据库访问用户名
- `-p`: 数据库访问密码
- `-d`: 数据库名
- `--dir`: 备份文件位置

### 3.2、示例

```bash
mongorestore -h 127.0.0.1 --port 27017 -u username -p password -d testdb --dir /home/mongodb/testdb
```



## 5、Docker中备份及恢复mongodb

### 5.1、打开mongodb bash

```bash
docker exec -it mongodb bash
```

### 5.2、导出数据库

```bash
mongodump -h 127.0.0.1 --port 27017 -d test -u root -p [password] -o home/mongodb/ --authenticationDatabase admin
```

执行后，数据将会备份到容器的`/home/mongodb`文件夹中

### 5.3、导入数据库

```bash
mongorestore -h 127.0.0.1 --port 27017 -u root -p [password] -d testdb --dir /home/mongodb/ --authenticationDatabase admin
```

### 5.4、取出docker中的备份数据

```bash
docker cp [name]:[path] [outpath]
```

- name: 实例名称
- path: 实例中的文件位置
- outpath: 外部位置

```bash
docker cp mongodb:/home/mongodb /home/db
```



