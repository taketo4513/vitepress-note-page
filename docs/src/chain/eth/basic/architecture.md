# 以太坊架构

## 以太坊架构

整个以太坊的技术栈可分为应用层、网络层、合约层、共识层、激励层和数据层，共6层。

每一个层级对应不同的功能。

- 应用层：主要是基于以太坊公链衍生出的应用，例如各种DApp应用、Geth控制台、Web3.js接口库以及Remix合约编写软件和Mist钱包软件等
- 网络层：主要是以太坊的点对点通信和`RPC`接口服务。
- 合约层：某些公链不具备这一层，例如比特币就没有合约层，以太坊的合约层主要是基于智能合约虚拟机`EVM`的智能合约模块。
- 共识层：主要是节点使用的共识机制。
- 激励层：主要体现在节点的挖矿奖励。挖出胜出区块的节点或打包了叔块的区块所对应的节点，矿工会获得规则所设定的ETH奖励。
- 数据层：用于整体的数据管理，包含但不限于区块数据、交易数据、事件数据以及`levelDB`存储技术模块等。

以太坊的技术细分架构如下图所示，从上到下，越底部代表越底层。

![An image](/img/chain/eth/04.png)

应用通过Wb3.js或其他版本的以太坊接口访问代码，来访问以太坊的`RPC`接口获取对应的数据。接口分为与智能合约相关和与区块相关，共两个部分。

**Whisper**是P2P通信模块中的协议，节点间的点对点通信消息都经过它转发，所转发的消息都经过加密传输，如图下所示。

![An image](/img/chain/eth/05.png)

**Swarm**是以太坊实现的类似于PFS的分布式文件存储系统，在P2P模块中结合Whisper协议使用。

**HttpClient**是HTTP服务请求方法的实现模块。

**Crypto**是以太坊的加密模块，内部包含sha3、secp256k1等加密算法。

**RLP**是以太坊所使用的一种数据编码方式，包含数据的序列化与反序列化。关于数据编码方式，除我们常见的方式之外，还有base16、base32和base64等。

**Solidity**是以太坊智能合约的计算机编程语言，由它编写智能合约，使用时由EVM虚拟机载入字节码运行。

**LevelDB**是以太坊所使用的键值对数据库。区块与交易的数据都采用该数据库存储。此外，在以太坊中，作为键(Key)的一般是数据的`Hash`值，而值(Value)则是数据的`RLP`编码。

**Logger**是以太坊的日志模块，主要包含两类日志：一类是智能合约中的事件(Event)日志，该类日志被存储到区块链中，可以通过调用相关的`RPC`接口获取：另一类是代码级别的运行日志，这类日志会被保存为本地的日志文件。
