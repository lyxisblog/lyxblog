---
title: JS基础篇-call()、apply()与bind()的妙用（2）
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

## **妙用：**

Js apply方法详解
我在一开始看到javascript的函数`apply`和`call`时,非常的模糊,看也看不懂,最近在网上看到一些文章对`apply`方法和`call`的一些示例,总算是看的有点眉目了,在这里我做如下笔记,希望和大家分享..  如有什么不对的或者说法不明确的地方希望读者多多提一些意见,以便共同提高..

主要我是要解决一下几个问题:

* `apply`和`call`的区别在哪里

* 什么情况下用`apply`,什么情况下用`call`

* `apply`的其他巧妙用法（一般在什么情况下可以使用`apply`）

我首先从网上查到关于`apply`和`call`的定义,然后用示例来解释这两个方法的意思和如何去用.

1:方法能劫持另外一个对象的方法，继承另外一个对象的属性.

 `Function.apply(obj,args)`方法能接收两个参数
`obj`：这个对象将代替`Function`类里`this`对象
`args`：这个是数组，它将作为参数传给`Function（args-->arguments）`
`call`:和`apply`的意思一样,只不过是参数列表不一样.

`Function.call(obj,[param1[,param2[,…[,paramN]]]])`
`obj`：这个对象将代替Function类里this对象
`params`：这个是一个参数列表

**一、apply示例:**

```bash
/*定义一个人类*/  
function Person(name,age)  
{  
    this.name=name;  
    this.age=age;  
}  
/*定义一个学生类*/  
functionStudent(name,age,grade)  
{  
    Person.apply(this,arguments);  
    this.grade=grade;  
}  
//创建一个学生类  
var student=new Student("zhangsan",21,"一年级");  
//测试  
alert("name:"+student.name+"\n"+"age:"+student.age+"\n"+"grade:"+student.grade);  
//大家可以看到测试结果name:zhangsan age:21  grade:一年级  
//学生类里面我没有给name和age属性赋值啊,为什么又存在这两个属性的值呢,这个就是apply的神奇之处.  
```

分析: `Person.apply(this,arguments)`;

`this`:在创建对象在这个时候代表的是`student`

`arguments`:是一个数组,也就是`[“zhangsan”,”21”,”一年级”]`;

也就是通俗一点讲就是:用`student`去执行`Person`这个类里面的内容,在`Person`这个类里面存在`this.name`等之类的语句,这样就将属性创建到了`student`对象里面

 

**二、call示例**

在Studen函数里面可以将`apply`中修改成如下:

`Person.call(this,name,age)`;

这样就ok了

**三、什么情况下用apply,什么情况下用call**

在给对象参数的情况下,如果参数的形式是数组的时候,比如`apply`示例里面传递了参数`arguments`,这个参数是数组类型,并且在调用Person的时候参数的列表是对应一致的(也就是Person和Student的参数列表前两位是一致的) 就可以采用 `apply` , 如果我的Person的参数列表是这样的(age,name),而Student的参数列表是(name,age,grade),这样就可以用`call`来实现了,也就是直接指定参数列表对应值的位置(`Person.call(this,age,name,grade)`);

**4`apply`的一些其他巧妙用法**

细心的人可能已经察觉到,在我调用apply方法的时候,第一个参数是对象(this), 第二个参数是一个数组集合, 在调用Person的时候,他需要的不是一个数组,但是为什么他给我一个数组我仍然可以将数组解析为一个一个的参数,这个就是`apply`的一个巧妙的用处,可以将一个数组默认的转换为一个参数列表([param1,param2,param3] 转换为 param1,param2,param3) 这个如果让我们用程序来实现将数组的每一个项,来装换为参数的列表,可能都得费一会功夫,借助`apply`的这点特性,所以就有了以下高效率的方法:

a) Math.max 可以实现得到数组中最大的一项

因为Math.max 参数里面不支持Math.max([param1,param2]) 也就是数组

但是它支持Math.max(param1,param2,param3…),所以可以根据刚才`apply`的那个特点来解决 var max=Math.max.apply(null,array),这样轻易的可以得到一个数组中最大的一项(`apply`会将一个数组装换为一个参数接一个参数的传递给方法)

这块在调用的时候第一个参数给了一个null,这个是因为没有对象去调用这个方法,我只需要用这个方法帮我运算,得到返回的结果就行,.所以直接传递了一个null过去

b) Math.min  可以实现得到数组中最小的一项

同样和 max是一个思想 var min=Math.min.apply(null,array);

c) Array.prototype.push 可以实现两个数组合并

同样push方法没有提供push一个数组,但是它提供了push(param1,param,…paramN) 所以同样也可以通过`apply`来装换一下这个数组,即:

```bash
vararr1=new Array("1","2","3");  
  
vararr2=new Array("4","5","6");  
  
Array.prototype.push.apply(arr1,arr2); 
```

也可以这样理解,arr1调用了push方法,参数是通过`apply`将数组装换为参数列表的集合.

通常在什么情况下,可以使用`apply`类似Math.min等之类的特殊用法:

一般在目标函数只需要n个参数列表,而不接收一个数组的形式（[param1[,param2[,…[,paramN]]]]）,可以通过`apply`的方式巧妙地解决这个问题!

## 总结:

一开始我对`apply/call/bind` 非常的不懂,最后多看了几遍,自己多敲了几遍代码,才明白了中间的道理,所以,不管做什么事情,只要自己肯动脑子,肯动手敲代码,这样一个技术就会掌握…   

还有比如第四部分得内容,巧妙的解决了实实在在存在的问题,这个肯定不是一个初学者能想到的解决方案(这个也不是我自己想的),没有对编程有一定认识的不会想到这个的,还是一句话,多积累,多学习,提升自己的能力和对编程思想的理解能力才是最关键!