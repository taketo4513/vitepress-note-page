# 以太坊交易

## 以太坊交易

关于以太坊交易，我们一般会将其理解为转账代币，但是其本质上实际是一种广义的交易，交易的内容不仅仅限于转账代币，也可以是转账对象，这个对象就是在使用Solidity代码实现智能合约的时候所定义的对象实体。例如，在以太猫应用中，转账的是猫，而不是代币。可以这样理解：

交易包含了转账，转账仅是其中的一个可能。交易双方通过地址关联，这个地址就是以太坊的十六进制地址。

### 交易的发起者、类型及发起交易的函数

交易的发起者就是以太坊的使用者，使用者主要有两类：

1. 节点服务：例如geth控制台的使用者。
2. 调用节点服务：指geth提供RPC接口的客户端，例如钱包等。

交易的类型分下面两种：

1. 以太坊ETH转账交易。
2. 其他交易：这类交易包含但不限于ERC20代币的转账交易。

通常，我们把调用了以太坊节点程序中的`eth_sendTransaction`或`eth_sendRawTransaction`接口所触发的动作或行为称为以太坊交易。目前以太坊RPC接口提供了两种标准的交易发起函数，对应上面的交易类型，分为以下两种：

1. eth_sendTransaction：该函数仅用于以太坊ETH转账，参数最终的签名不需要调用者手动进行，它会在当前节点中使用已解锁的发起者to的以太坊地址的私钥进行签名，因此每次使用这个函数进行以太坊ETH转账时，需要先解锁from地址。
2. eth_sendRawTransaction：需要调用者使用from私钥进行签名参数数据的交易函数，目前ERC20代币转账交易都是使用这个函数。以太坊ETH转账交易一样可以使用`eth sendRawTransaction`来进行，但转账ETH主要由参数控制。

### 交易和智能合约的关系

ERC20代币的转账交易事实上调用的就是智能合约的transfer函数，那么智能合约层面的transfer函数是如何与节点RPC接口层的sendRawTransaction联系在一起的呢？

我们知道，ERC20代币转账交易的第一步是调用RPC接口，即调用sendRawTransaction接口，在把需要转账的数据传给节点后，节点会提取出每个数据字段，其中就包含sendRawTransaction的data参数，data是一个十六进制字符串，它所组成的内容中有部分被称为methodId，该ID对应的就是transfer函数的名称转化值，即transfer单词通过一定运算后产生的转化值。有了这个methodId，等到转账交易被矿工打包处理时就会根据合约地址参数先找到对应的智能合约，合约地址参数由sendRawTransaction的to参数表示，最后会基于找出的合约去执行数据data字段中methodId所指示的函数，以及读取这个函数对应的参数数据，例如转账给谁、转多少。

![An image](/img/chain/eth/43.png)

也就是说，在应用程序中进行交易并非直接调用智能合约函数，而是先调用以太坊的接口间接调用智能合约的函数。

此外，无论是sendTransaction还是sendRawTransaction，在调用成功后，以太坊都会直接返回一个交易哈希值（全称是`Transaction Hash`，简称txHash）。注意是直接返回，无须异步等待，但此时还不能确定交易是否成功。

### 交易参数的说明

除了data和to两个参数之外，在以太坊的交易接口文档中，RPC接口sendTransaction和sendRawTransaction的参数还有很多，但其参数的个数是一样的，在这些参数中，地址值类型的参数都是以太坊的合法地址。

from：代表从哪个地址发起交易，即当前的这笔交易由准发出。要注意的是，如果交易的to是智能合约的地址，那么合约代码中的`msg.sender`变量代表的就是这个from地址。

to：代表当前交易的接收地址。注意，这个接收地址不能理解为收款者地址，因为to的取值存在下面3种情况：

1. 智能合约的地址。
2. 普通以太坊用户的钱包地址。
3. 取空值的时候，代表当前的交易是创建智能合约的交易。

当to是第一种情况的时候，当前所发送的交易将会交给对应的智能合约处理，原理和之前谈到的ERC20代币转账相同。所以，在进行ERC20代币转账时，to应该是智能合约的地址。

当to是第二种情况的时候，就是ETH转账，代表把ETH以太坊转给哪个地址。

第三种to为空的情况，代表当前的交易是部署智能合约到链上的交易。

value：转账的数值。请注意，这个值在使用sendRawTransaction进行ERC20代币转账时应该是0。在ERC20代币转账时，所要转账的值的多少是定义在data参数中的。在使用sendTransaction进行ETH转账时，value必须有值，且value还是乘上了10的18次方形式的大数值。

当使用sendRawTransaction进行以太坊ETH转账交易时，要做到下面3点：

1. to应该对应收款钱包的以太坊地址。
2. value对应的是ETH数值，不是0。
3. data参数为空字符串。

只有满足这3个条件，sendRawTransaction进行的交易操作就是以太坊ETH转账。

gas：这个gas参数就是gasLimit，但是请不要忘记，在最终交易成功时真实使用的是GasUsed。交易成功时多出的燃料费会返回，所谓多出的然料费就是`(GasLimit - GasUsed) X GasPrice`部分。

gasPrice：该参数标明每一笔gas价值是多少wei，ETH与wei的换算关系前文己有讲述。所以最终消耗的燃料费应该满足`gas X gasPrice ≥ gasUsed X gasPrice`，单位是wei。

nonce：就是交易序列号。

data：这是一个很重要的参数，既用于交易接口，又用在`eth_call`中。下面以ERC20代币转账为例讲解该参数的含义及使用。

十六进制格式，例如：

```tex
0x70a08231000000000000000000000000021af430a036887cb0cfb7083b220f64bb3f8ed8
```

前10个字符，包含0x，是methodId，它的生成方式比较复杂，是由对应的合约函数的名称经过签名后，再通过Keccak256加密取特定数量的字节，然后转为十六进制得出。以下是以太坊版本标准生成methodId的代码：

```go
func (method Method) Id()[]byte {
    return crypto.Keccak256 ([]byte(method.Sig()))[:4]
}
```

对于常见的函数其对应的methodId，有下面的两种：

1. 查询余额的balanceOf是0x70a08231。
2. 转账transfer的是0xa9059cbb

前10个之后的字符，满足下面的条件：

1. 代表的是智能合约中函数的参数。
2. 排序方式按照合约函数参数的顺序排列。
3. 十六进制的形式。
4. 不允许有0x，即先转成十六进制形式再去掉0x字符。
5. 去掉0x后，每个参数字符个数是64。

下面举例说明第3点：

假设一份智能合约的transfer函数的入参是两个整型，其原形是`transfer(uint a，uint b)`，那么此时如果要调用这份合约的transfer函数，那么data的格式应该是：

```tex
methodId + X + Y
```

其中，X和Y分别对应参数a和b去掉了0x前置字符的十六进制形式，由于transfer的methodId是0xa9059cbb，当a=1、b=2的时候，data就是下面的形式：

```tex
0xa9059cbb0000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000002
```

共包括以下3部分：

1. 0xa9059cbb
2. 00000000000000000000000000000000000000000000000000000001
3. 00000000000000000000000000000000000000000000000000000002

以上就是以太坊交易函数接口参数的详细说明。请注意，在实际使用时，由于第三方库的封装等原因，可能在使用这些库的时候不需要传这么多参数，但是无论传哪个参数，其含义是不会变的。

下面是以太坊geth程序在ETH转账时的控制台命令，注意最少要输入3个参数：

```sh
eth.sendTransaction({from:"0x...", to:'0x...", value:3})
```

### 交易方法的真实含义

在上面一节中，我们已经充分认识了sendTransaction和sendRawTransaction这两个以太坊发起交易接口的作用和入参。我们要认清的一个事实是，上面的两个交易接口所指的`交易`代表的不仅仅是代币的转移，还代表以交易的形式访问智能合约的一个公有函数，被访问函数所产生的变化会被记录到区块数据内，而控制访问函数的方式是通过入参data来实现的。

这是什么意思呢？意思就是，在调用sendRawTransaction发起以太坊交易时，如果所传参数中的data是methodId，而不是transfer，将不会实现代币转移，即无法达到代币转账的目的，而其达成的效果最终由智能合约函数所定义的代码来决定。

为什么是sendRawTransaction而不是sendTransaction？因为sendTransaction已经被以太坊源码封装好了，它只能用来转账以太坊ETH，本质上和sendRawTransaction是一样的，被封装好了的sendTransaction，此时它的data被设置成了发起交易的附属信息，类似于备注。

下面再通过一个例子来阐述上述内容。假设智能合约A中定义了一个函数，其名称是setName，这个函数的功能是设置名称，假设此时setName的methodId是0xabc，入参是一个字符串。那么当我们使用sendRawTransaction调用智能合约A中的setName函数时，data参数就要设置为与setName相关的数据，待发起交易时，这笔交易被矿工成功打包进区块中之后，名称便成功地被设置了，且结果也会被记录到这笔交易所打包进了的区块中一被持久化到节点中的`键值对`<k，v>数据库中。此时，这笔交易只是调用了合约中的setName函数，仅达到了一个设置名称的目的，并没有发生任何的代币转账，但我们也把这一次调用看作是一次交易。

下面是我们在实际开发中使用sendRawTransaction进行交易时经常用到的调用方法的名称：

- 转账：此时data中转化后的methodld原型对应的是transfer。
- 授权：此时data中转化后的methodId原型对应的是approve。

### 交易的状态

当我们使用sendTransaction或sendRawTransaction将一笔交易提交到以太坊，并得到了以太坊返回的哈希值后，这时我们并不能判断这笔交易的最终结果是成功还是失败。请记住，获取了哈希值只能代表以太坊成功地接收了这笔交易的请求，不能代表交易最终是否成功。

![An image](/img/chain/eth/44.png)

图中的txHash就是交易的哈希值，可以看出，一次交易在成功提交到以太坊后共有4种状态，分别是：

1. Unknown（未知状态）：

   还没被放入到txPool以太坊交易池中，这个时候如果用区块链浏览器查询这个txHash，就会发现无任何信息。

2. Pending(等待或挂起状态)

   这个状态是最常见的，是交易成功的必经状态，此时我们用区块链浏览器查询，能查询出部分交易信息。注意是部分交易信息，例如下图所示的查询结果并没有显示区块号信息，即`block height`(区块高度)。

3. Success（成功状态）

   代表交易成功

4. Failed(失败状态)

   在交易失败时，也能够查询出该交易的相关信息，例如区块高度等。

因为以太坊交易池的大小是有限制的，所以常常会造成一些交易订单只是处于被放置到交易池，尚未被交易的状态，该状态称为`Unknown(未知状态)`。造成这种情况的原因是，矿工在交易池中的交易订单的排序算法受GasPrice的影响，也就是说，如果交易订单A此刻排在第三，刚好有新的订单B进来了，且B的GasPrice很高，那么订单A就有可能被排后。根据这个特点，如果长时间地出现这种排队的情况，就有可能导致某个低GasPrice的订单一直处于Pending(等待或挂起)状态，迟迟不被矿工打包，从而会出现有些等待状态的交易订单被`挂起`几天甚至更久时间的情况。

Fail的失败情况一般发生在和智能合约交互的相关交易中，交易的错误由合约的代码抛出，比如参数错误等原因。

### 交易被打包

下图便是以太坊订单池中的交易订单被添加到池中之后，再被打包到区块中直至被从订单池移除的一个大致的生命流程图。

![An image](/img/chain/eth/45.png)

其中对于矿工打包交易时`再次校验交易`的步骤，内部拥有一次交易燃料费的计算步骤，这是在前面`燃料费`一节中，EVM(虚拟机)计算燃料费的流程。