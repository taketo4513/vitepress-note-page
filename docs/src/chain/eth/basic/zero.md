# 以太坊零地址

## 以太坊零地址

在以太坊区块链中存在一个零地址，即它的十六进制值为零，原形是：

```tex
0x0000000000000000000000000000000000000000
```

这个地址拥有下面的特点：

- 与创世区块无关。
- 当启动以太坊挖矿程序，也即在节点代码中启动`矿工`挖矿时，如果没有设置挖矿的收益地址，就会默认使用零地址挖矿，挖矿所得的ETH将归零地址所有。
- 是一个合法的以太坊地址，能够接收代币的转账。
- 它的私钥可能仍然没被碰撞出。

在区块链浏览器中查询这个地址，观察它的以太坊ETH交易记录，可以发现，其所有的ETH交易记录都只有转入而没有转出的记录。据此可以猜测，它的私钥还没有被碰撞出，为什么这样说呢？

因为每个合法的以太坊地址都对应有一个私钥，只要满足地址格式，我们不需要知道它的私钥是什么就可以使用，可以向它交易转账、查询它的各种操作记录等。

零地址便是如此，因为它很容易被记住及写出，全部数值为0即可，不需要刻意地去进行运算得出，但它亦始终对应有一个私钥。在私钥生成公钥的算法中，我们知道如果要根据一个公钥来逆推出私钥，概率非常小，但不是不可能，只要概率不为0，就不能说不可能。

加上它所有的ETH交易记录都是只有被转入而没有转出的记录，最难以想象的情况就是零地址的私钥己经被碰撞出了，但是拥有者还不打算转出任何一个ETH。

综上所述，零地址的私钥可能还没被碰撞出。

![An image](/img/chain/eth/46.png)

### 零地址的意义

以下是零地址使用最多的两种场景：

1. 用于启动以太坊挖矿程序，如果没有设置挖矿的收益地址就默认使用零地址挖矿。
2. 在智能合约的代码编写中使用零地址，例如作为函数的参数。

在第一种场景中，零地址充当的是一个默认统一处理的方式。比如，挖矿过程中没有设置收益地址，这个时候应该怎么办呢？一种做法是强制不允许用户进行挖矿操作，要求必须设置收益地址。另一种做法是不强制，可以继续挖矿。此时就需要一个默认的收益地址，那么这个地址设置为谁合适？毫无疑问，选择零地址是最为合理的，就表现形式上来看，零代表的就是开始，也很容易被记住。

在第二种场景中，如果我们要给某个地址直接赠送`代币`资产或者是表现为生成`代币`资产，在操作完之后，必须触发转账事件`Transfer event`，这就需要一个`from`参数来表示从哪儿转账出去的。但是，基于从无到有再转移的过程，并不存在从某个确切的拥有资产的地址转账到另一个地址的过程，这个`from`选择为零地址最为合理。

```solidity
function mint (address _to, uint256 _amount) onlyOwner canMint public returns(bool){
    totalSupply_ = totalSupply_.add(amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(address(0), _to, _amount);
    return true;
}
```

该例就实现了往一个给指定的以太坊地址添加资产的目的，添加的形式是直接添加，不存在从一个地址转账给收款地址。这个时候触发转账事件`Transfer event`，`from`参数选择的就是零地址。

因此，我们可以将零地址看作是某些情况下的合理默认值，就好比我们在编程时，初始化一个`it`类型的变量，其默认值总是0一样。
