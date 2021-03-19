---
title: JS基础篇-call()、apply()与bind()的区别及实现原理解析及妙用（1）
date: 2019-09-21
tags:
 - JS
categories:
 - JS基础篇
---

::: tip 前言
我在一开始看到javascript的函数apply和call时,非常的模糊,看也看不懂,最近在网上看到一些文章对apply方法和call的一些示例。<br>
总算是看的有点眉目了,在这里我做如下笔记,希望和大家分享..  如有什么不对的或者说法不明确的地方希望读者多多提一些意见,以便共同提高..<br>
:::

**主要我是要提出并解决一下几个问题:**

1. `apply`和`call`的区别在哪里 ？
2. 什么情况下用`apply,`,什么情况下用`call` ？
3. `apply`的其他巧妙用法（一般在什么情况下可以使用`apply`）？

### **介绍**
* 由于`call()`、`apply()`与`bind()`都是属于`Function.prototype`对象下的方法，所以每个`functio`n实例都拥有有`call`、`apply`与`bind`属性。
* 相同点：都是为改变`this`指向而存在的。
* 异同点：使用`call()`方法时，传递给函数的参数必须逐个列举出来，使用`apply()`方法时，传递给函数的是参数数组。`bind`()和`call`()很相似，第一个参数是`this`的指向，从第二个参数开始是接收的参数
* 列表。`bind()` 方法不会立即执行，而是返回一个改变了上下文 `this`后的函数，用于稍后调用。 `call()`、`apply()`则是立即调用。

### **原理解析：**

## 一、 call()实现原理

```bash
Function.prototype.mycall = function (context) {
    // 当context为null时，其值则为window
    context = context || window;
    // this为调用mycall的函数。将this赋值给context的fn属性
    context.fn = this;
    // 将arguments转为数组，并从下标1位置开如截取
    let arg = [...arguments].slice(1);
    // 将arg数组的元素作为fn方法的参数执行，结果赋值给result
    let result = context.fn(...arg);
    // 删除fn属性
    delete context.fn;
    // 返回结果
    return result;
}
```

**测试：**

```bash
function add(c, d){
    return this.a + this.b + c + d;
}
var obj = {a:1, b:2};
console.log(add.mycall(obj, 3, 4)); // 10
```

## 二、 apply()实现原理

```bash
Function.prototype.myapply = function (context) {
    // 当context为null时，其值则为window
    context = context || window
    // this为调用myapply的函数。将this赋值给context的fn属性
    context.fn = this;
    // 如果未传值，则为一空数组
    let arg = arguments[1] || [];
    // 将arg数组的元素作为fn方法的参数执行，结果赋值给result
    let result = context.fn(...arg);
    // 删除fn属性
    delete context.fn
    // 返回结果
    return result
}
```

**测试：**

```bash
function add(c, d){
    return this.a + this.b + c + d;
}
var obj = {a:1, b:2};
console.log(add.myapply(obj, [5, 6])); // 14
```

## 三、 bind()实现原理

```bash
Function.prototype.mybind = function (context) {
    // this为调用mybind的函数。将this赋值给变量_this
    let _this = this;
    // 将arguments转为数组，并从下标1位置开如截取
    let arg = [...arguments].slice(1);
    // 返回函数fn
    return function fn(){
        // 通过apply方法调用函数并返回结果。
        return _this.apply(context, arg.concat(...arguments));
    }
}
```

**测试：**

```bash
var obj = {
    siteName: "zhangpeiyue.com"
}
function printSiteName() {
    console.log(this.siteName);
}
var site = printSiteName.mybind(obj);
// 返回的是一个函数
console.log(site) // function () { … }
// 通过mybind使其this发生了变化
site();// zhangpeiyue.com
```

以上是`apply()`、`call()`和`bind()`原理讲解，如果你还觉得不够，那么可以[JS基础篇-call()、apply()与bind()的区别及实现原理解析及妙用（2）](/blogs/category1/2019/call与apply()与bind()的妙用(2).html)如果在项目中巧妙的使用它们！