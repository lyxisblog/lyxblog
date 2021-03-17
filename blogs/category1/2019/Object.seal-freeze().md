---
title: JS基础篇-Object.seal()与Object.freeze()
date: 2019-09-21
tags:
 - JS
categories:
 - JS基础篇
---

::: tip 前言
在 JavaScript 中，对象的属性也可以用一些方法限制对其添加属性、修改属性等操作。<br>
我们就一起深入了解Object.freeze()和Object.seal()<br>
:::

## 一、 Object.freeze()
**[官方](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)MDN对Object.freeze()的说明，如下：**

> 注解：**Object.freeze()方法可以冻结一个对象。一个被冻结的对象再也不能被修改；冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。**

我们需要深入理解上面那几句话什么意思。

`Object.freeze()`做了哪些事情？

* 设置`Object.preventExtension()`，禁止添加新属性(绝对存在)
* 设置`writable`为false，禁止修改(绝对存在)
* 设置`configurable`为false，禁止配置(绝对存在)
* 禁止更改访问器属性(`getter`和`setter`)

**通俗来讲：**
* **此函数“冰冻”对象本身以及一切现有的属性值(value)以及属性的特性(property descriptor)。**
* **在函数Object.seal()中也许还可以修改属性值以及修改 属性的特性writable(true-->false)，但是在Object.freeze()中，这些都干不了。**

从上可知，`Object.freeze()`禁止了所有可设置的内容。

另外，可以使用`Object.isFrozen()`判断一个对象是否是冻结对象。

`Object.freeze()`只是浅冻结，如果你理解浅拷贝就能理解浅冻结。


## 二、 Object.seal()

**[官方](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/seal)MDN对Object.seal()的说明，如下：**

> 注解：**Object.seal()方法封闭一个对象，阻止添加新属性并将所有现有属性标记为不可配置。当前属性的值只要可写就可以改变。**

从概念上看，`Object.seal()`相比`Object.freeze()`就比较好理解了。

`Object.seal`()做了哪些事情？

* 设置`Object.preventExtension()`，禁止添加新属性(绝对存在)
* 设置`configurable`为false，禁止配置(绝对存在)
* 禁止更改访问器属性(`getter`和`setter`)

**通俗来讲：**
* **阻止添加新属性；**
* **现有属性变得non-configurable.**

第一点好理解；第二点需要搞清楚`non-configurable`是什么意思，`configurable`在这篇博文中有详细解释。<br>
这里再贴一遍：<br>
当`configurable`设为false时，

* **不可以通过delete去删除该属性从而重新定义属性；**

* **不可以转化为访问器属性；**

* **configurable和enumerable不可被修改；**

* **writable可单向修改为false，但不可以由false改为true；**

* **value是否可修改根据writable而定。**

理解了`configurable`的意思，也就能理解为啥会有这个句话了：被封的对象仍可能可以修改对象的属性值。

### **对比Object.freeze()和Object.seal():**
使用`Object.freeze()`冻结的对象中的现有属性是不可变的。用`Object.seal()`密封的对象可以改变其现有属性。

### **参考文档：**

（1）[https://www.cnblogs.com/tlz888/p/10389532.html](https://www.cnblogs.com/tlz888/p/10389532.html)

（2）[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal)

（3）[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)


## 拓展Object.preventExtensions()

**[官方](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)MDN对Object.preventExtensions()的说明，如下：**

> 注解：**Object.preventExtensions()方法让一个对象变的不可扩展，也就是永远不能再添加新的属性。**

另外，可以使用`Object.isExtensible()`判断一个对象是否可扩展。

```bash
//空对象是特殊情况，设置Object.preventExtensions()后，以下情况都将被禁止：
var empty = {};
Object.preventExtensions(empty);
Object.isFrozen(empty) === true
Object.isSealed(empty) === true
Object.isExtensible(empty) === false
```