# 网络资源

## 网络资源Token化

### 带宽和日志存储

用户发送一笔交易信息后，区块生产者需要将交易打包生成区块，然后将区块通过网络同步给其他生产者，这个过程需要消耗一定网络带宽资源。而带宽资源由交易信息在区块中所占的字节数决定。带宽资源的计费方式类似手机流量，用户每发送一笔交易信息就消耗一点带宽资源，如果带宽资源消耗为0，则无法继续发送交易信息。

获取带宽资源的方式有两种：

1. 如果用户账户持有Token，那么可以直接将Token抵押给EOS系统账户，系统会根据抵押Token所占全网Token的比例，分配给用户对应的带宽资源。

   比如，用户持有1%的Token，那么该用户就拥有全网1%的带宽资源。同时，用户可以取消抵押，将带宽资源转换为等量的Token。这种带宽获取方式本身不会消耗Token。但是，已经抵押的Token不能够继续抵押或者出售，抵押锁定期至少为3天。

2. 如果用户账户没有Token，可以从其他用户手中租赁带宽资源。

### 计算和计算积压(CPU)

当用户调用智能合约时，区块生产者需要根据智能合约地址查找合约代码，然后将代码加载到内存中执行，这个过程需要消耗一定的CPU算力。

CPU计算资源由运行智能合约（交易也属于智能合约的一种）所消耗的时间决定，用户每次调用智能合约都会消耗一点计算资源，如果消耗为 0 则无法继续执行合约。计算资源也是通过抵押Token或者向其他用户购买获得。解除抵押之后，Token也需要至少锁定3天。

### 状态存储器(RAM)

RAM是指运行时的内存，在EOS系统中，用于存储账户等状态信息，是DApp运行的基础资源。根据账户所抵押的EOS数量的不同，账户能够调用的资源也是有所不同的。跟Steem一样，EOS使用了速率限制的算法来计算账户可以动用的资源。

RAM的买卖，实质上是抵押EOS Token到系统账户，就是说将EOS Token转账到eosio这个系统账户之中作为抵押，而不是买方和卖方直接的交易。购买RAM，是抵押EOS得到了RAM的使用权限；而出售RAM,则是释放了自己所占用的RAM，从系统账户之中取回所抵押的EOS。

和网络带宽资源不同的是，RAM涉及的抵押或者解除抵押需要收取0.5%的手续费，并且获得RAM不能出租给其他人，只能给自己使用，抵押或取回RAM是立即进行的，不像CPU和带宽资源一样，有3天的延迟期。RAM的价格采用bancor算法，其核心思想就是根据市场的供求关系决定RAM价格，买的人越多，价格越高。

RAM的总量由超级节点共同投票决定，一旦确定之后，短时间内不会再发生大幅扩容情况。而RAM的需求端由DApp市场需求决定，当DApp上线运行后，会一直锁定内存，不会释放。目前市场的RAM价格昂贵，所以，RAM会成为一种稀缺资源。相比之下，带宽资源和CPU计算资源会随着时间推移，由超级节点源源不断地提供，所以不具备明显的稀缺性。
