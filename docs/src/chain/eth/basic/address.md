# 以太坊地址

### 以太坊地址（钱包地址）

在Header结构体中有一个Coinbase变量，其本质上是一个字符长度为42的十六进制地址值。

在以太坊中，每一个账户包括智能合约都有一个唯一标识自己的地址值，通过这个地址值可以使用以太坊的RPC接口查询到相关的信息。这个地址值有如下规则：

- 0x开头。
- 除0x这两个字符外，剩下的部分必须是由字母(f)和数字(09)组成的40个字符。其中，字母不区分大小写。
- 整体是一个十六进制字符串。

例如，0x24602722816b6cad0e143ce9fabf31f6012ec622就是一个以太坊的合法地址，而
0x24602722816b6cad0e143ce9fabf31f6026ec6xy就不是一个合法的地址，因为它最后的两位字符是xy，不是十六进制字符。

通常，又称上面的以太坊地址为一个钱包地址，因为转账交易就是通过这个地址来转给别人的。在这一点上，类似银行卡的卡号，即银行需要银行卡的卡号才能给对方转账。

### 地址的作用

地址的作用主要有下面几点：

- 唯一标识一个账户或智能合约。
- 作为标识，可用于查询该账户的相关信息，例如代币余额、交易记录等。
- 进行以太坊交易时，充当交易双方的唯一标识。

地址分为两类：非智能合约地址与智能合约地址（又称为外部账户和合约账户）。

那么如何判断一个地址是不是合约地址呢？判断方法可以使用以太坊源码提供的`eth_getCode`接口。

### 地址的生成

地址分为合约地址和非合约地址。在以太坊的账户体系中，不同种类的地址生成方式是不同的。比如，在生成钱包地址（非合约地址）的时候，首先要根据非对称加密算法(Asymmetric Cryptographic Algorithm)中的椭圆曲线算法生成私钥和公钥，再从公钥的哈希结果中提取后20个字节作为非合约地址。

以太坊非合约地址（外部账户地址）的生成流程总结如下：

1. 随机产生一个私钥，32个字节。
2. 计算得到私钥在ECDSA-secp256k1椭圆曲线上对应的公钥。
3. 对公钥做SHA3计算，得到一个哈希值，取这个哈希值的后20个字节来作为外部账户的地址。

智能合约地址的生成流程如下：

1. 使用`rlp`算法将（合约创建者地址+当前创建合约交易的序列号Nonce）进行序列化。
2. 使用Keccak256将步骤1的序列化数据进行哈希运算，得出一个哈希值。
3. 取第(2)步的哈希值的前12字节之后的所有字节生成地址，即后20个字节。

非合约地址和合约地址生成方式的区别是：合约地址和椭圆曲线加密无关，因为合约地址是基于用户地址和交易序列号的，所以也不会生成雷同的地址。

大家可能还会问，为什么非合约地址要搞这么复杂还这么难读，像银行卡的卡号一样不行吗？

非合约地址之所以遵守上述的生成规则，主要原因是私钥几乎为0概率的重复性。私钥是通过伪随机算法(PRNG)产生的，所生成的私钥以二进制的形式表示，一共有256位（即32个字节），即256个0和1组成，它的可能性有2的256次方个，此数非常庞大，比宇宙中的原子数量还要多出几十个数量级。在这种情况下，可以100%保证账户不重复。此外，十六进制形式的地址也便于程序读写。