# 模块调用栈

C/C++内建模块属于最底层的模块，它属于核心模块，主要提供API给JavaScript核心模块和第三方JavaScript文件模块调用。

**如果你不是非常了解要调用的C/C++内建模块，请尽量避免通过`process.binding()`方法直接调用，这是不推荐的。**

JavaScript核心模块主要扮演的职责有两类：

一类是作为C/C++内建模块的封装层和桥接层，供文件模块调用；

一类是纯粹的功能模块，它不需要跟底层打交道，但是又十分重要。

![An image](/img/nodejs/moudle/09.png)

文件模块通常由第三方编写，包括普通JavaScript模块和C/C++扩展模块，主要调用方向为普通JavaScript模块调用扩展模块。
