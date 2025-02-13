# Nonce的作用

## Nonce的作用

之前已经了解了区块结构Header中的Nonce，也提到了交易中的Nonce，它们两个是不一样的。区块Header中的Nonce主要用于PoW共识情况下的挖矿，交易中的Nonce指的是我们在调用以太坊的交易RPC接口进行转发操作时所要传带的参数，它代表了`交易的系列号`。

交易中的Nonce是相对于from发送者地址而言的，它代表当前发送者的账户在节点网络中总的交易序号，每个发送者地址都有一个Nonce。from的格式就是前面讲到的地址格式，例如0x24602722816b6cad0e143ce9fabf31f6012ec622。

进一步举例说明：

在以太坊主网（也就是在公链）的环境下，例如账户A，第一次进行交易，此时它的Nonce为0。交易成功后，它要进行第二笔交易，此时发起交易的时候Nonce为1。成功后，下一次Nonce为3，一直以此类推下去。这里只考虑了每一笔都是成功的情况，事实上还有一种等待状态，此时的Nonce有其他的选择。另外，在不同的链和不同的节点网络中，Nonce也不一样。

Noce的特点是，在顺序不断递增的交易订单中，每一次传输必须要满足比上一次成功交易的Noce值要大。注意这里的一个条件，比上一次成功的交易大，其一般采取加1累增的方式。例如，上面的例子，在第二次发起交易的时候，Noce不能再为0，否则，以太坊会返回错误，导致交易失败。可以取3吗？可以，但是如果取3，必须等Noce为1和2的交易被节点处理完成后才能轮到Nonce为3的交易。

因此，在每一笔成功的交易中都有一个特定的Noce与之对应，这样可以有效地分辨出哪些是被重复发起的交易，以方便进行处理。

综上所述，交易中Nonce的作用主要有两点：

1. 作为交易接口的参数。
2. 代表每次交易的序列号，方便节点程序处理被重复发起的交易。

下面是Nonce的取值规则：

1. 如果Nonce比最近一次成功交易的Nonce要小，转账出错。
2. 如果Nonce比最近一次成功交易的Nonce大了不止1，那么这次发起的交易就会长久处于队列中，此时就是等待(Pending，或称为挂起)状态！在补齐了此Nonce到最近成功的那个Nonce值之间的Nonce值后，此交易依旧可以被执行。
3. 还处于队列中的交易，在其他节点的缓存尚未收到并留存这次交易的广播信息的情况下，如果此时这个发起交易的节点`挂`了（就是宕机了或者脱网了），那么还没被处理的这次交易将会丢失，因为此时的交易存放于内存中尚未广播出去。
4. 处于等待(Pending)状态的交易，如果其Nonce相同，就会引发节点程序对交易的进一步判断，通常会选出燃料费最高的，替换掉燃料费低的。
