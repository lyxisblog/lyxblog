---
title: git无法clone/push/pull等情况
date: 2017-09-21
tags:
 - Git
categories: 
 - Git
---

## 关于 `git` 无法clone/push/pull等情况错误；

当在`push`/`clone`/`pull`等,出现：
* (1) fatal: unable to access 'https://github.com/xxxxxxxxxxxxxx': Failed connect to github.com:8087; No error.
* (2) fatal: unable to access 'https://github.com/xxxxxxxxxxxxxx': OpenSSL SSL_read: Connection was reset, errno 10054.
* (3) fatal: unable to access 'https://github.com/xxxxxxxxxxxxxx': Failed to connect to xxxxxxxxxxxxx.
* (4) fatal: unable to access 'https://github.com/xxxxxxxxxxxxxx': XXXXXX failed: A TLS packet with unexpected length was received.
* ...情况。

### **解决办法**

## 一、解决办法1：重置本机git

```bash
$git config --global credential.helper store
```
> tip: `(1)``(2)`(3)(4) clone超时，可能会因为使用代理导致出现超时，推荐使用该方法来解决超时。当然也可以解决`push`/`clone`/`pull`等情况。
> [可参考](https://tieba.baidu.com/p/5297009010)

## 二、 解决办法2：查看是否使用了代理，移除代理。

```bash
$git config --global http.proxy     //查询到当前设置的代理
$git config --global --unset http.proxy          //取消代理设置
// 也可以到 C盘 用户目录下找到gitConfig文件打开删除`proxy`代理即可。
```
> tip: `(1)``(2)`(3)(4) clone超时，可能会因为使用代理导致出现超时，推荐使用该方法来解决超时。当然也可以解决`push`/`clone`/`pull`等情况。
> [可参考](https://www.zhihu.com/question/26954892)

## 三、 解决办法3[终极解决办法]：把URL 模式从HTTPS改为SSH即可。

```bash
$git remote -v         //查看当前使用的远程存储库URL
> origin  git@github.com:USERNAME/REPOSITORY.git (fetch)    
> origin  git@github.com:USERNAME/REPOSITORY.git (push)

$git remote set-url origin https://github.com/USERNAME/REPOSITORY.git           //使用git remote set-url origin xxx 修改远程存储库URL

```

> tip: `(1)``(2)``(3)``(4)` push/pull可能会出现该问题，推荐使用该方法来解决，当然也可以解决`push`/`clone`/`pull`等情况。<br>
> [可参考](https://docs.github.com/en/github/using-git/changing-a-remotes-url)
<!-- https://www.zhihu.com/question/26954892 -->