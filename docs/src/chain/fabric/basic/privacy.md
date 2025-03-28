# 隐私保护

## 隐私保护

分布式账本可以帮助多个成员进行数据共享和协作，因此，隐私保护（如哪些数据可以被谁读写）就成了十分关键的问题。

目前，Fabric 通过多种技术手段在不同层级上分别进行隐私保护，包括如下几种机制：

- 通道机制，网络内同时存在多个通道，各个通道之间数据彼此隔离。
- 私密数据库，在同一通道内实现对私密交易内容的保护。
- 数据加密保护，在数据上链之前进行客户端加密，实现对链上数据的保护。

## 通道机制

通道机制是 Fabric 中最基础的数据保护方案。每个通道都拥有自己独有的账本、组织、Peer、Orderer、Gossip 域。不同通道内数据彼此隔离，实现隐私保护。

组织身份属于通道成员是该组织节点可以参与通道活动的前提。组织最新的根 CA 证书和根 TLS CA 证书都必须保存在通道配置内，以被其他组织认可。证书过期之前，需要进行证书的更新工作。

只有加入通道共识组的排序节点才可以参与通道内的共识过程，每个通道可以自行添加或删除合法的排序节点，这些排序节点构建内部的 Raft 集群来动态选举和分发数据。排序节点一旦从通道内删除后，会通过探测机制发现变更，该节点将不再主动参与通道内的活动。排序节点也会通过系统通道配置的变化来判断自己所负责的应用通道。

Peer 节点要加入通道中还必须拥有该通道的初始区块。Peer 节点会从中解析出维护该通道的排序服务地址（可通过选项覆盖），并从排序服务拉取完整的区块链结构，构建本地账本。构建完成后，Peer 会通过 Gossip 协议在通道范围内获取新的数据，并更新本地状态。通道目前无法单独移除特定 Peer 节点，但 Peer 节点自身可以选择不再处理某通道的业务。

需要注意的是，通道一旦创建后无法自动删除（可以通过删除所有组织证书和节点信息来禁用通道），会占据节点本地存储。同时，通道的共识过程会消耗排序节点计算资源，因此要避免同时存在过多通道。

## 私有数据

私密数据库是自 1.1 版本开始引入的特性，在通道的隔离性基础上提供了更细粒度的控制。该特性允许在同一个通道内的若干成员组织构成一个集合（Collection），合法 Peer 只在集合策略指定的成员之间分发 Gossip 私密数据，并且可以指定私密数据的存活时间。通道内交易中的私密数据读写集在公共账本上只包括摘要内容，排序节点无法获知私密数据。

在背书阶段，用户将包括私密数据（通过 transient 域）的交易提案发给特定 Peer 节点，然后该 Peer 节点将私密数据分发给合法的 N 个 Peer 节点`（requiredPeerCount ≤ N ≤ maxPeerCount）`，这些节点会将私密数据保存在本地的临时数据库。在提交阶段，Peer 节点会记录私密数据到本地的私密状态数据库中，并清理临时数据库中记录`（CORE_PEER_GOSSIP_PVTDATA_TRANSIENTSTOREMAXBLOCKRETENTION 中指定）`。这样，私密数据的原文只在规定组织内的 Peer 上存在，其他节点只能看到有交易被提交，但无法获知原文。

私密数据典型的应用场景为，在批准和提交链码定义时指定私密数据集合，之后在链码中将私密数据放到指定集合中，只有通过集合相关的 API 才能读写集合内的私密数据。示例代码如下：

```sh
$ peer chaincode instantiate \
    -o ${ORDERER_URL} \
    -C ${channel} \
    -n ${name} \
    -v ${version} \
    -c ${args} \
    -P "${policy}" \
    --collections-config "${collection_config_file}"
```

其中，在集合配置文件中可以指定哪些组织成员可以访问，还可以指定分发策略、存活时间、权限和背书策略等，示例代码如下：

```json
[
 {
    "name": "collection1",
    "policy": "OR('Org1MSP.member', 'Org2MSP.member')",
    "requiredPeerCount": 1,
    "maxPeerCount": 3,
    "blockToLive":99999,
    "memberOnlyRead": true,
    "memberOnlyWrite": true,
    "endorsementPolicy": { 
     "signaturePolicy": "OR('Org1MSP.member')" 
     // "channelConfigPolicy": "Channel/Application/Writers"
    }
 }
]
```

> 注意：集合配置可以通过链码升级操作进行更新，但注意无法删除已定义的集合，并且集合的 blockToLive 域不支持更新。

## 加密保护

用户可以在链码内通过加密机制来实现自定义的保护。由于 Fabric 支持图灵完备的链码，用户可以在链外将上链数据进行加密，读取数据后在链下进行解密。这种方式提供了较高的独立隐私性，因为只有线下用户可以看到数据原文。但要注意对加密密钥的保护。

如果用户希望链码可以自行完成加密和解密过程，则可在发送交易提案请求时使用 transient 域来提供键值明文和加密密钥，确保只有加密后的结果被记录到账本。
