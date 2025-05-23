# 智能合约

## 智能合约

### 简介与作用

我们生活中所认识的合约又称合同，是基于文字制定的条款，例如劳工合同。

在以太坊中，智能合约也可以看作是一份合同，它的表现方式是：使用规定的计算机语言编程，然后编写一份代表合同的代码文件，再经过编译，变成可被执行的计算机字节码。

可见，以太坊的智能合约也可以理解为一份代码文件，例如用C+语言编写的是.cpp文件，用Java编写的是java文件。

目前以太坊智能合约的编程语言是Solidity，采用Solidity语言就可以编写出各种各样的智能合约，然后将其部署到以太坊上，部署的详细流程是：

1. 编写好智能合约代码文件。
2. 经过Solidity编译器，将代码文件编译成十六进制码。
3. 将编译好的十六进制码，以以太坊交易的形式发送到以太坊网络上。
4. 以太坊识别出是部署合约的交易，校验后，存储起来。
5. 待合约被链下请求调用的时候，以太坊智能合约虚拟机(EVM)将编写好的智能合约代码文件编译成二进制码，并加载运行。

从部署到被运用的整个流程，产生了所谓的基于智能合约的DApp应用。

请看下面智能合约的例子：

```solidity
pragma solidity ^0.4.17;
contract MathUtil {
    function add(uint a,uint b) pure public returns (uint){
        return (a+b);
    }
}
```

很明显，这是一个简单的加法操作，但这也是一份智能合约，只不过是一份简单的智能合约。

注意，每一份被部署到以太坊上的智能合约都有一个唯一标识的哈希地址值，这个哈希地址值既代表用户的以太坊账户地址，又唯一标识了一份智能合约。

我们知道，代码在编译成可执行的字节码之后是可以被调用执行的，同样地，所有被编译布署到以太坊中的智能合约也可以被调用，也就是上面的加法智能合约是可以被调用的。注意，这里的调用指的是合约里所编写的函数可以被以各种方式调用。可以定义私有函数，供智能合约调用：也可以添加Owner权限（只能是Owner），由合约发布者调用或公共调用。

对于能够被公共调用的智能合约函数，其所面向的最为广大的调用者就是所有人，你可以调用，他、我也可以调用。怎样调用呢？可以通过以太坊提供的RPC接口。当然，以太坊也提供了传统的RESTful API的调用方式，也就是我们可以将调用智能合约的函数理解为调用服务端接口。

下面我们来理清一些关系：

- 智能合约 -> 被布署到以太坊节点上 -> 调用时被以太坊虚拟机编译并加载。
- 以太坊节点 -> 被布署在不同的服务器上 -> 节点们共同维护以太坊公链。
- 调用者 -> 调用以太坊节点的接口 -> 访问某个智能合约→获得结果。

我们知道，节点网络分为公链节点网络和私链节点网络，在不同类型的节点网络中部署的智能合约，其访问域是不同的，私有节点网络部署的智能合约只能在访问私有节点网络时才能访问到这个合约，而公有节点部署的智能合约，所有人都可以调用。

![An image](/img/chain/eth/40.png)

部署在以太坊网络上的智能合约就像部署了一个服务端程序，我们通过调用在智能合约中编写的函数可以实现各种应用，这正是以太坊智能合约的作用。

例如，ERC20代币的标准智能合约代码中就有一个转账函数，而所有的ERC20标准的代币合约，它们的转账就是通过调用这个函数实现的。也就是说，ERC20代币转账就是基于智能合约的，ERC20的代币有很多种，每一种代币对应一份智能合约。我们发布ERC20代币到链上，其本质就是发布一份智能合约。
