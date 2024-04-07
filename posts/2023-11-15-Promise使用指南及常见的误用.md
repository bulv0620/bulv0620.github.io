---
date: 2023-11-15
title: Promise使用指南及常见的误用
tags:
- Javascript
- Promise
description: 本文介绍Promise使用指南及常见的误用
---

# Promise使用指南及常见的误用

## 1、认识异步

这是一个最传统的接口请求函数:

```js
      function reqGetJoke() {
        // （1）创建异步对象
        var ajaxObj = new XMLHttpRequest();

        // （2）设置请求的参数。包括：请求的方法、请求的url。
        ajaxObj.open('get', '/api/joke');

        // （3）发送请求
        ajaxObj.send();

        //（4）注册事件。 onreadystatechange事件，状态改变时就会调用。
        ajaxObj.onreadystatechange = function () {
          // 为了保证 数据 完整返回，我们一般会判断 两个值
          if (ajaxObj.readyState == 4 && ajaxObj.status == 200) {
            // 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的

            // 5.在注册的事件中 获取 返回的 内容 并修改页面的显示
            console.log('数据返回成功');

            // 数据是保存在 异步对象的 属性中
            console.log(ajaxObj.responseText);
          }
        }
      }
	 reqGetJoke()
```

创建了一个`XMLHttpRequest`对象，建立`get`请求并发送，在请求的`state`变为4的时候，请求就返回或者失败了，我们就可以在事件函数中对结果进行操作。

比如我们打印出了结果

```
{
    "error_code": 0,
    "reason": "Success",
    "result": {
        "data": [
            {
                "content": "很多人不喜欢朝九晚五的生活，然后开始创业。\r\n最终，他的生活变成了朝五晚九。",
                "hashId": "7b358c4b96cf4a8d82b85545ea8f9603",
                "unixtime": 1418814837,
                "updatetime": "2014-12-17 19:13:57"
            }
        ]
    }
}
```



这个过程是异步的，如果我们需要拿到返回值做一些操作，更好的方法是，声明回调函数，在后端返回后，将返回值作为回调函数的入参，调用回调函数。

那就会像这样：

```javascript
      function dosomething(result) {
        // do something with result
      }

      function reqGetJoke(callback) {
        var ajaxObj = new XMLHttpRequest();

        ajaxObj.open('get', '/api/joke');

        ajaxObj.send();

        ajaxObj.onreadystatechange = function () {
          if (ajaxObj.readyState == 4 && ajaxObj.status == 200) {
            // 回调
            callback(ajaxObj.responseText)
          }
        }
      }

	 reqGetJoke(dosomething)
```

我们定义了一个`dosomething`，在调用`reqGetJoke`时作为参数，在请求结束后，我们会将结果作为参数，回头调用`dosomething`

这就是前端常见的异步回调操作



## 2、认识Promise

不像同步函数一般，异步函数需要取到结果，必须用回调的方式，这样的传统回调方式会出现很可怕的结果，回调地狱

```javascript
function add(a, b) {
	return a + b
}

var result = add(1, 2)

function req() {
    // 异步请求
}
var result = req() // 这样显然是不行滴
```



假设一个场景，我需要在请求完A后，将A请求的结果，作为B请求的入参，然后再对B请求的结果进行操作，那就变成这样：

```javascript
      function requestA(data, callback) {
        var ajaxObj = new XMLHttpRequest();

        ajaxObj.open('get', `/api/a?data=${data}`);

        ajaxObj.send();

        ajaxObj.onreadystatechange = function () {
          if (ajaxObj.readyState == 4 && ajaxObj.status == 200) {
            // 回调
            callback(ajaxObj.responseText)
          }
        }
      }

      function requestB(data, callback) {
        var ajaxObj = new XMLHttpRequest();

        ajaxObj.open('get', `/api/b${data}`);

        ajaxObj.send();

        ajaxObj.onreadystatechange = function () {
          if (ajaxObj.readyState == 4 && ajaxObj.status == 200) {
            // 回调
            callback(ajaxObj.responseText)
          }
        }
      }
```

首先这是两个封装好的请求函数，用起来是这样的：

```javascript
      requestA('a', (resultA) => {
        requestB(resultA, (resultB) => {
          // deal with resultB
        })
      })
```

已经可以看到一个小小的坡度，那如果A请求完请求B，B请求完请求C，C请求完请求D....

```
      requestA('a', (resultA) => {
        requestB(resultA, (resultB) => {
          requestB(resultB, (resultC) => {
            requestB(resultC, (resultD) => {
              requestB(resultD, (resultE) => {
                requestB(resultE, (resultF) => {
				// ...
                })
              })
            })
          })
        })
      })
```

这还是不考虑错误处理，如果加上错误处理回调...

好在JS在2015年推出了官方的Promise规范

这是一个典型的返回Promise对象的函数：

```javascript
      function iWannaPromise() {
        return new Promsie((resolve, reject) => {
          
        })
      }
      console.log(iWannaPromise())
```

打印出来的结果是一个`Promise`对象，`Promise`有三个状态

- `pending`：初始化
- `fulfilled`：成功
- `rejected`：失败

状态只能改变一次，改变后就确定了这次的结果

- `pending -> fulfilled`
- `pending -> rejected`

我们可以调用`resolve()`将状态变为`fulfilled`，调用`reject()`将状态变为`rejected`

调用`resolve`和`reject`的传参，就是`promise.then`或`.catch`回调的传参

举例来讲：

```javascript
      function reqGetTest() {
        return new Promsie((resolve, reject) => {
          var ajaxObj = new XMLHttpRequest();

          ajaxObj.open('get', '/api/test');

          ajaxObj.send();

          ajaxObj.onreadystatechange = function () {
            if (ajaxObj.readyState == 4) {
              if(ajaxObj.status == 200) {
                resolve(ajaxObj.responseText)
              }
              else {
                reject('请求失败')
              }
            }
          }
        })
      }
```



## 3、应用Promise

我们将之前的request改造为Promise的形式，在请求成功后调用`resolve()`并将结果传入，失败后调用`reject()`

这时候使用这个接口函数就变成了这样：

```javascript
reqGetTest.then(result => {
	console.log(result) // 结果处理
}).catch(err => {
	console.error(err) // 错误处理
})
```

这样看好像没啥区别，还更麻烦了，为啥要在`.then`传回调，不是多此一举嘛，这就要讲到Promise如何解决回调地狱的问题了

```
      requestA('a', (resultA) => {
        requestB(resultA, (resultB) => {
          requestB(resultB, (resultC) => {
            requestB(resultC, (resultD) => {
              requestB(resultD, (resultE) => {
                requestB(resultE, (resultF) => {
				// ...
                })
              })
            })
          })
        })
      })
```

传统的回调方式不停的嵌套，高楼大厦平地起，人和代码有一个能跑就行...

而Promise带来的是链式调用，`then`函数本身返回也是一个`Promise`

也就是说我们可以这样：

```
reqGetTest.then(() => {

}).then(() => {

}).then(() => {

}).then(() => {

}).then(() => {

}).catch(() => {

})
```

并且`then`函数传入的回调如果返回的是一个`Promise`对象，那么then就会返回这个`Promise`对象

举个栗子，还是那个需求，请求A返回的结果作为请求B的入参：

这时候改造一下两个请求函数：

```javascript
      function requestA(data) {
        return new Promise((resolve, reject) => {
          const ajaxObj = new XMLHttpRequest();

          ajaxObj.open('get', `/api/a?data=${data}`);

          ajaxObj.send();

          ajaxObj.onreadystatechange = function () {
            if (ajaxObj.readyState == 4) {
              if(ajaxObj.status == 200) {
                resolve(ajaxObj.responseText)
              }
              else {
                reject('请求失败')
              }
            }
          }
        })
      }

      function requestB(data) {
        return new Promise((resolve, reject) => {
          const ajaxObj = new XMLHttpRequest();

          ajaxObj.open('get', `/api/b?data=${data}`);

          ajaxObj.send();

          ajaxObj.onreadystatechange = function () {
            if (ajaxObj.readyState == 4) {
              if(ajaxObj.status == 200) {
                resolve(ajaxObj.responseText)
              }
              else {
                reject('请求失败')
              }
            }
          }
        })
      }
```

或者我使用我们常用的`Axios`（`Axios`就是封装`ajax`的库，并且符合`Promise`规范）：

```javascript
function requestA(data) {
	return axios.get(`/api/a?data=${data}`)
}

function requestB(data) {
	return axios.get(`/api/b?data=${data}`)
}
```

其实这样对比一下，也就简单的了解了`ajax`的`Promise`封装方法了

虽然请求函数的封装变复杂了，但是使用起来变得扁平了：

```javascript
requestA('data').then((resultA) => {
	return requestB(resultA)
}).then((resultB) => {
	console.log(resultB)
}).catch(err => {
	// A和B任何时候出错都会被捕捉到这里
})
```

再多几层：

```javascript
requestA('data').then((resultA) => {
	return requestB(resultA)
}).then((resultB) => {
	return requestC(resultB)
}).then((resultC) => {
	return requestD(resultC)
}).then((resultD) => {
	return requestE(resultD))
}).then((resultE) => {
	return requestF(resultE))
}).then((resultF) => {
	console.log(resultF)
}).catch(err => {
	// A、B、C、D、E...任何时候出错都会被捕捉到这里
}).finally(() => {
    // do something
})
```

上一个`then`函数回调返回的请求函数在下一个`then`中处理

哪怕套一千层一万层，我只要知道这一层的`then`函数是哪个请求的回调（往前找），就可以轻松维护！并且所有错误处理都在末尾的`.catch()`函数中，然后在所有链结束后，会来到`finally`

这里要讲一个工作中我看到过非常多的Promise使用误区：

```javascript
requestA('data').then((resA) => {
	requestB(resA).then(resB => {
		console.log(resB)
	})
}).catch((err) => {
	console.log(err)
}).finally(() => {
    // do something
})
```

这样的情况非常多，这是错误的用法，这还是没有利用Promise解决回调地狱的问题，并且外部的`catch`和`finally`是跟内部的`request`分离的，也就是里面还要再写一遍`catch`和`finally`（如果需要的话）



## 4、async await

前面已经介绍了Promise的链式调用：

```javascript
requestA('data').then((resultA) => {
	return requestB(resultA)
}).then((resultB) => {
	return requestC(resultB)
}).then((resultC) => {
	return requestD(resultC)
}).then((resultD) => {
	return requestE(resultD))
}).then((resultE) => {
	return requestF(resultE))
}).then((resultF) => {
	console.log(resultF)
}).catch(err => {
	// A、B、C、D、E...任何时候出错都会被捕捉到这里
}).finally(() => {
    // do something
})
```

已经解决了回调地狱问题，但是还是很复杂，二级请求我要在`then`中`return`出来，然后外部加一个`then`节点再去传入请求回调，解决了回调地狱问题，但是还不够好用。

回到开始讲到的同步函数和异步函数的区别：

```javascript
function add(a, b) {
	return a + b
}

var result = add(1, 2)

// 异步请求
function req() {
    return axios.get('/xxx')
}
var result = req() // 这样显然是不行滴
```

如果异步调用返回能像同步一样，岂不美哉，而`async await`关键字就很好的实现了这个需求

还是很多个请求

```javascript
function requestA(data) {
	return axios.get(`/api/a?data=${data}`)
}

function requestB(data) {
	return axios.get(`/api/b?data=${data}`)
}

function requestC(data) {
	return axios.get(`/api/c?data=${data}`)
}
```

用法：

```javascript
async function doRequest() {
	const resultA = await requestA('data')
    const resultB = await requestB(resultA)
    const resultC = await requestC(resultB)
    console.log(resultC)
}
doRequest()
```

当然`catch`和`finally`也是同步操作捕获异常的方式：

```javascript
async function doRequest() {
    try {
        const resultA = await requestA('data')
   		const resultB = await requestB(resultA)
    	const resultC = await requestC(resultB)
    	console.log(resultC)
    } catch(err) {
        console.error(err)
    } finally {
        // do something
    }
}
doRequest()
```

当然`async`的副作用，就是让这个`doRequest`也变成了返回`Promise`对象的函数，`await`必须在`async`修饰的函数下使用。

```javascript
function test1() {
	return new Promise((resolve, reject) => {
        resolve('test res 1')
    })
}

async function test2() {
    return 'test res 2' 
}

const r1 = test1()
console.log(r1) // Promise {<fulfilled>: 'test res 1'}

const r2 = test2()
console.log(r2) // Promise {<fulfilled>: 'test res 2'}

r1().then(res1 => {
    console.log(res1) // test res 1
})

r2().then(res2 => {
    console.log(res2) // test res 2
})

(async () => {
    const res1 = await r1()
    console.log(res1) // test res 1
    const res2 = await r2()
    console.log(res2) // test res 2
})()
```

这样对比完其实`Promise`语法和`async await`语法糖之间的联系，很明了了



## 5、实践

可能看完`async await`的示例后，发现也就这样，代码稍微清晰点，也没啥实质性的效果，习惯了`Promise.then()`，改回同步的写法思路，反而陌生，没必要。

那显然是一种误解，这个语法糖最重要的是，完全用同步的方式去设计代码，能在`if`分支和`for`循环中符合直觉的使用。

这是一段实际的需求：

1. 前提：表格行某个按钮点击会派发一个`vuex`的事件，派发的入参data为当前行数据
2. 第一步 -> 确认操作：使用`element ui`的`MessageBox.confirm`，该函数返回Promise对象
3. 第二步 -> 判断data的时间字段，是否在今天以前，满足则进入第三步，否则退出
4. 第三步 -> 请求接口，入参为data

新需求需要加的逻辑：

- 在第二步中，
  - 如果满足条件，则需要额外输入一段文本，然后作为额外的入参请求接口
  - 如果不满足，则直接请求接口

一开始的代码是这样的（没有加上新需求）：

```JavaScript
  close ({ dispatch, state }, data) {
    return new Promise((resolve, reject) => {
      MessageBox.confirm(this._vm.$langFilter('请确认是否关闭', 'order'), this._vm.$langFilter('确认关闭', 'order'), {
        confirmButtonText: this._vm.$langFilter('确定', 'order'),
        cancelButtonText: this._vm.$langFilter('取消', 'order'),
        type: 'warning'
      }).then(() => {
        state.obj = { id: data.id }
        const jsonStr = {
          mesOrder: {
            id: null
          }
        }
        jsonStr.mesOrder.id = data.id

        const dayDiff = dayjs().diff(data.dEtime, 'day')

        if(dayDiff > 0) {
          closeSave(jsonStr)
            .then(data => {
              Message.success({ message: data.message })
                dispatch('queryList')
                // resolve(data)
              })
              .catch(error => {
                reject(error)
              }).finally(() => {
                state.obj = {}
              })
          })
        }
      }).catch(() => {
        reject(error)
      })
    })
  },
```

显然首先没用Promise的特性，并且需要`if`分支后，变得异常难维护...

```javascript
  close ({ dispatch, state }, data) {
    return new Promise((resolve, reject) => {
      MessageBox.confirm(this._vm.$langFilter('请确认是否关闭', 'order'), this._vm.$langFilter('确认关闭', 'order'), {
        confirmButtonText: this._vm.$langFilter('确定', 'order'),
        cancelButtonText: this._vm.$langFilter('取消', 'order'),
        type: 'warning'
      }).then(() => {
        state.obj = { id: data.id }
        const jsonStr = {
          mesOrder: {
            id: null
          }
        }
        jsonStr.mesOrder.id = data.id

        const dayDiff = dayjs().diff(data.dEtime, 'day')

        if(dayDiff > 0) {
          MessageBox.prompt('超时关单原因', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^.+$/,
            inputErrorMessage: '请输入超时关单原因'
          }).then(({ value }) => {
            jsonStr.mesOrder.cRemark = value
            closeSave(jsonStr)
              .then(data => {
                Message.success({ message: data.message })
                dispatch('queryList')
                // resolve(data)
              })
              .catch(error => {
                reject(error)
              }).finally(() => {
                state.obj = {}
              })
          })
  
        } else {
          closeSave(jsonStr)
            .then(data => {
              Message.success({ message: data.message })
              dispatch('queryList')
              // resolve(data)
            })
            .catch(error => {
              reject(error)
            }).finally(() => {
              state.obj = {}
            })
        }

      }).catch(() => {
        reject(error)
      })
    })
  },
```

那么我先把他写的符合Promise使用方法，并加上新的逻辑：

```javascript
  close ({ dispatch, state }, data) {
    return new Promise((resolve, reject) => {
      MessageBox.confirm(this._vm.$langFilter('请确认是否关闭', 'order'), this._vm.$langFilter('确认关闭', 'order'), {
        confirmButtonText: this._vm.$langFilter('确定', 'order'),
        cancelButtonText: this._vm.$langFilter('取消', 'order'),
        type: 'warning'
      }).then(() => {
        state.obj = { id: data.id }
        const jsonStr = {
          mesOrder: {
            id: null
          }
        }
        jsonStr.mesOrder.id = data.id

        const dayDiff = dayjs().diff(data.dEtime, 'day')
        if(dayDiff > 0) {
          return MessageBox.prompt('超时关单原因', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^.+$/,
            inputErrorMessage: '请输入超时关单原因'
          })
        } else {
          return Promise.resolve()
        }
      }).then((res) => {
        if(res?.value) {
          jsonStr.mesOrder.cRemark = value
        }
        return closeSave(jsonStr)
      }).then(data => {
        Message.success({ message: data.message })
        dispatch('queryList')
        // resolve(data)
      }).catch(() => {
        reject(error)
      }).finally(() => {
        state.obj = {}
      })
    })
  },
```

然后，这是使用了`async await`改造后：

```javascript
  async close ({ dispatch, state }, data) {
    try {
      await MessageBox.confirm(this._vm.$langFilter('请确认是否关闭', 'order'), this._vm.$langFilter('确认关闭', 'order'), {
        confirmButtonText: this._vm.$langFilter('确定', 'order'),
        cancelButtonText: this._vm.$langFilter('取消', 'order'),
        type: 'warning'
      })

      const dayDiff = dayjs().diff(data.dEtime, 'day')

      state.obj = { id: data.id }
      const jsonStr = {
        mesOrder: {
          id: data.id,
        },
      }

      if(dayDiff > 0) {
        const { value } = await MessageBox.prompt('超时关单原因', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^.+$/,
          inputErrorMessage: '请输入超时关单原因'
        })  

        jsonStr.mesOrder.cRemark = value
      }

      const res = await closeSave(jsonStr)
      Message.success({ message: res.message })
      dispatch('queryList')

    } catch(error) {
      return Promise.reject(error)
    } finally {
      state.obj = {}
    }
  },
```

当然有一些错误的`await`用法，例如：

```javascript
await request().then(res => {

})
```

这显然是一种离谱的写法...

`then`函数返回的是一个`Promise`对象，当传入的回调函数没有主动返回一个`Promise`对象时，`then`函数返回的是`Promise.resolve(上一次的结果)`，也就是这里的`await`等待的是`then`中返回的这个`Promise`，确实这样依然可以做到阻塞后续的同步代码，实现等待当前请求结束执行后续代码的目的，但显然是畸形的使用方式，因为`await`并没有如你所愿等待`request`，等待的是`then`返回的`Promise`对象。

既然都用`await`了，异步返回结果，直接这样获得异步返回值使用即可：

```javascript
const res = await request()
```



## 6、参考文档

[5 Common Mistakes when Using Promises | by Ravidu Perera | Bits and Pieces (bitsrc.io)](https://blog.bitsrc.io/5-common-mistakes-in-using-promises-bfcc4d62657f)