# 核心概念与组件

## 核心概念与组件

要理解超级账本 Fabric 的设计，首先要掌握其最基本的核心概念与组件，如节点、交易、排序、共识、通道等。

弄清楚这些核心组件的功能，就可以准确把握 Fabric 的底层运行原理，深入理解其在架构上的设计初衷。知其然，进而可以知其所以然。

总体来看，超级账本 Fabric 面向不同角色的用户提供不同模块功能，这些模块自下而上可以分为三层。

- 网络层模块：面向系统管理人员。实现 P2P 网络，提供底层构建区块链网络的基本能力，包括代表不同角色的节点和服务。

- 共识机制和权限管理模块：面向联盟和组织的管理人员。基于网络层的连通，实现共识机制和权限管理，提供分布式账本的基础。

- 业务层模块：面向业务应用开发人员。基于分布式账本，支持链码、交易等与业务相关的功能模块，提供更高一层的应用开发支持。

![An image](/img/chain/fabric/03.webp)

------

### 网络层相关组件

网络层通过软、硬件设备，实现了对分布式账本结构的连通支持，包括 Peer 节点、排序节点、客户端等参与角色，还包括成员身份管理、Gossip 协议等支持组件。

#### Peer 节点

节点的概念最早来自 P2P 分布式网络，意味着在网络中担任一定职能的服务或软件。节点功能可能是对等一致的，也可能是分工合作的。

Peer 节点是 Fabric 网络的基本单元，在网络中负责对交易提案进行背书，并接受排序后的交易来维护账本的一致性。这些实例可能运行在裸机、虚拟机甚至容器中。节点之间通过 gRPC 消息进行通信。

目前按照功能角色，Peer 可以分为两种类型：

- Endorser（背书节点），负责对来自客户端的交易提案进行检查和背书。只有部署了链码的 Peer 可以对交易进行背书。

- Committer（记账节点），负责检查交易请求，执行交易并维护区块链和账本结构。所有 Peer 都是记账节点。

这些角色是逻辑功能上的划分，彼此并不相互排斥。一般情况下，网络中所有节点都具备 Committer 功能；部分节点具备 Endorser 功能。

------

#### 排序节点

排序节点负责在网络中对所收到的交易进行全局排序。

排序节点主要提供了 Broadcast 和 Deliver 两个接口。前者代表客户端将数据（交易）发给排序节点，后者代表从排序节点获取到排序后构造的区块结构。

排序节点可以支持多通道。不同通道之间彼此隔离，通道内与交易相关的信息将仅发往加入通道内的排序节点和 Peer 节点，从而提高隐私性和安全性。

从功能上看，排序节点的目的是对网络中的交易分配全局唯一的序号，实际上并不需要与交易相关的具体数据内容。因此为了进一步提高隐私性，发往排序节点的可以不是完整的交易数据，而是部分信息，比如交易加密处理后的结果，或者仅仅是交易的 Hash 值、ID 信息等。这些私密数据机制（参考 FAB-1151）会提高网络的隐私性保护。

------

#### 客户端

客户端是用户和应用与区块链网络打交道的桥梁。客户端主要包括两大职能：

- 操作 Fabric 网络，包括更新网络配置、启停节点等。

- 操作运行在网络中的链码，包括部署链码、发起交易调用链码等。这些操作需要与 Peer 节点和排序节点打交道。特别是链码实例化、交易等涉及共识的操作，都需要发送交易到排序节点。

网络中的 Peer 和排序节点对应提供了 gRPC 远程服务访问接口，供客户端进行调用。

目前，除了基于命令行的客户端之外，超级账本 Fabric 已经拥有了多种语言的 SDK。这些 SDK 封装了对底层 gRPC 接口的调用，可以提供更完善的客户端和开发支持，包括 Node.js、Python、Java、Go 等多种实现。

------

#### 成员身份管理

CA 节点（Fabric-CA）负责对 Fabric 网络中的成员身份进行管理。Fabric 网络目前采用数字证书机制来实现对身份的鉴别和权限控制，CA 节点则实现了 PKI 服务，主要负责对身份证书进行管理，包括生成、撤销等。

需要注意的是，CA 节点可以提前签发身份证书，发送给对应的成员实体，这些实体在部署证书后即可访问网络中的各项资源。后续访问过程中，实体无须再向 CA 节点进行请求。因此，CA 节点与网络中交易的处理过程是完全解耦的，不会造成性能瓶颈。

------

#### Gossip 协议

Fabric 网络中的节点之间通过 Gossip 协议来进行状态同步和数据分发。

Gossip 协议是 P2P 领域的常见协议，用于进行网络内多个节点之间的数据分发或信息交换。由于其设计简单，容易实现，同时容错性比较高，而被广泛应用到许多分布式系统，例如，Cassandra 采用 Gossip 协议来实现集群失败检测和负载均衡。

Gossip 协议的基本思想十分简单，数据发送方从网络中随机选取若干节点，将数据发送过去；接收方重复这一过程（往往只选择发送方之外节点进行传播）。这一过程持续下去，网络中所有节点最终（时间复杂度为节点总个数的对数）都会达到一致。数据传输的方向可以是发送方发送或获取方拉取。

在 Fabric 网络中，节点会定期地利用 Gossip 协议发送它看到的账本的最新的数据，并对发送消息进行签名认证。通过使用该协议，主要实现如下功能：

- 通道内成员的探测。新加入通道的节点可以获知其他节点的信息，并发送 Alive 信息宣布在线；离线节点经过一段时间后可以被其他节点感知。

- 节点之间同步数据。多个节点之间彼此同步数据，保持一致性。另外，Leader 节点从排序节点拉取区块数据后，也可以通过 Gossip 传播给通道内其他节点。

------

### 共识机制相关组件

共识（consensus）概念来自分布式系统领域。在 Fabric 中，共识过程意味着区块链网络成员对于某一批交易的发生顺序、合法性以及它们对账本状态的更新结果，达成一致的观点。满足共识则意味着多个节点可以始终保证相同的状态，对于以同样顺序到达的交易可以进行一致的处理。具体来看，Fabric 中的共识包括背书、排序和验证三个环节的保障。

------

#### 背书过程

背书（endorsement）是指背书节点对收到的来自客户端的请求（交易提案）按照自身的逻辑进行检查，以决策是否予以支持的过程。

通常情况下，背书过程意味着背书节点对请求提案和造成的状态变更（读写集）添加数字签名。

对于调用某个链码的交易来讲，它需要获得一定条件的背书才被认为合法。例如，必须是来自某些特定身份成员的一致同意；或者某个组织中超过一定数目的成员的支持；或者指定的某个成员个体的支持。这些规则由链码的背书策略来指定。背书策略内容是比较灵活的，可以使用多种规则进行自由组合，并在链码进行实例化（instantiate）的时候指定。

------

#### 排序过程

排序（ordering）意味着对一段时间内的一批交易达成一个网络内全局一致的顺序，通常是由排序节点组成的集群来提供。

目前，排序服务采用了可拔插的架构，2.0 版本中使用 etcdRaft 类型的非拜占庭容错共识机制。另外，也有第三方实现了拜占庭容错共识。

排序服务除了负责达成一致顺序外，并不执行其他操作，这就避免其成为整个网络的处理瓶颈。同时，每个通道可以选择排序节点组，使得整个网络很容易进行横向扩展，提高整体的吞吐率。

------

#### 验证过程

验证（validation）是对排序后的一批交易进行提交到账本之前最终检查的过程。

验证过程包括：检查交易结构自身完整性，检查交易所带背书签名是否满足预设的背书策略，检查交易的读写集是否满足多版本并发控制（Multi-VersionConcurrency Control，MVCC）的相关要求等。

交易在验证环节如果包括状态写操作，则对应读集合中所有状态的当前版本必须与执行背书时一致。否则该交易会被标记为不合法（invalid），对应交易不会被执行，也不会影响到世界状态。

确认前的验证过程是十分有必要的，可以避免交易并发时的状态更新冲突，确保交易发生后所有节点看到的结果都是一致的。

------

### 权限管理相关组件

权限管理是超级账本 Fabric 项目对区块链领域的一大贡献。Fabric 中提出了成员服务提供者（Membership Service Provider，MSP）的概念，抽象代表了一个身份验证的实体。基于 MSP 可以实现对不同资源进行基于身份证书的权限验证。

#### 成员身份服务

身份是实现权限管理的基础。Fabric 中在访问任何资源实体（成员、节点、组织等）时都会通过签名进行身份验证，确保系统的安全性。身份基于成员服务提供者实现。一个资源实体（用户、组织、Peer、Orderer 等）的 MSP 结构中往往包括签名和验证算法，以及一组符合 X.509 格式的证书（信任相同的根证书）。典型 MSP 结构包括：

- 一组信任的根证书，是整个组织证书信任的基础，根证书可以签发中间层证书。

- MSP 的管理员身份证书，管理员可以对 MSP 中证书进行管理。

- 一组信任的中间证书（可选），中间证书由根证书签发。

- 一组信任的 TLS 根证书和中间层证书（可选），启用 TLS 时候作为其验证基础。

- 证书撤销列表（可选），被吊销的证书名单。

> 注意：MSP 中各实体资源的证书必须被证书信任树上的叶子节点签名。中间层签名的证书会被认为是非法实体证书。

------

#### 组织

组织（organization）代表一组拥有共同根证书（可以为根 CA 证书或中间 CA 证书）的成员，可以对应到业务逻辑中的同一个企业、部门或团队。

这些成员由于共享同样的信任根，彼此之间信任度很高，可以相互交换比较敏感的内容。同一个组织的成员节点在网络中可以认为是同一个组织身份，代表组织进行签名。组织中成员可以分为普通成员角色或者管理员角色，后者拥有更高的权限，可以对组织配置进行修改。

组织在网络中一般包括名称、ID、MSP 信息、管理策略、认证采用的密码库类型、锚点节点位置等信息。不同组织之间为了进行业务沟通和数据共享，可以加入同一个应用通道。

![An image](/img/chain/fabric/04.webp)

------

#### 联盟

联盟（consortium）是由若干组织构成的集合，是联盟链场景所独有的结构形式。联盟一般用于多个组织相互合作的场景，例如，某联盟中指定需要所有参与方同时对交易背书，才允许在网络中进行交易。

联盟中的组织成员使用同一个系统通道，并且遵循相同的通道创建策略（channelcreationpolicy）。通道在创建时也必须指定所绑定的联盟信息。例如，某个联盟内可能定义必须所有成员都同意才能创建新的通道；或者任何成员都可以自行创建新的通道。

在设置联盟时候，每个组织都需要指定自己的 ID 信息，该信息必须与该组织所关联的 MSP ID 一致。此外，通道之间是独立的，应用通道创建之后，可以邀请联盟外的成员加入通道。

------

#### 证书机制

证书（certif icate）是 Fabric 中权限管理的基础。目前采用了基于 ECDSA 算法的非对称加密算法来生成公钥和私钥，证书格式则采用了 X.509 的标准规范。Fabric 中采用单独的 Fabric CA 项目来管理证书的生成。每一个实体、组织都可以拥有自己的身份证书，并且证书也遵循了组织结构，方便基于组织实现灵活的权限管理。

------

### 业务层相关组件

对于应用开发人员来说，很多时候无须了解底层网络的实现细节，但十分有必要学习和掌握业务层的相关概念。交易、区块、链码、通道、链结构、账本等概念，体现了基于区块链技术的分布式账本平台的特点，支撑了上层的分布式应用。

#### 交易

交易（transaction）是超级账本 Fabric 项目中的一个基础概念。交易意味着通过调用链码对账本状态进行一次改变。客户端可以通过发送交易请求来让分布式账本记录信息。

通常来说，要构造一次交易，首先要创建交易提案（transaction proposal）。当一个交易提案获得足够的背书支持时，可以构造出合法的交易请求，进而可以发给排序节点进行排序。

交易消息经过排序节点的排序后，会广播到网络中的各个节点进行确认。如果节点对交易进行本地验证通过，则对应接受该交易指定的状态变更，最终更新本地账本。

------

#### 区块

区块（Block）意味着一组进行排序后的交易的集合。区块链以区块为单位对多个交易组进行共识，并将其历史进行链接。通过调整区块大小可以取得吞吐量和延迟之间的平衡。

区块包括区块头（Header）、数据（Data）、元数据（Metadata）三部分.

其中，Header 用于构建链式结构，包括 Number、PreviousHash、DataHash 三个域，共 72 字节。

- Number：记录了区块的序号，8 字节。初始区块的编号为 0。

- PreviousHash：记录前一个区块头结构（Header）的 SHA256 Hash 值，32 字节。初始区块中设为空值（nil）。

- DataHash：区块 Data 域的 Hash 值，32 字节。

注意区块头结构的 Hash 值为 SHA256 (Number+PreviousHash+DataHash)，可以唯一确定区块内容（包括头结构和数据，但不包括元数据）。

Data 结构中以 Envelope 结构记录区块内的多个交易信息。这些交易可以采用默尔克树结构进行组织。在目前的实现中，Fabric 采用了单层（宽度为 math.MaxUint32）的默尔克树结构，实际上已退化为线性数组结构。

Metadata 结构中记录了一些辅助信息。

- BlockMetadataIndex_SIGNATURES=0：签名信息。目前对最新配置块索引和共识元数据（BlockMetadata，包括 OSN 和 Raft Id 之间的映射列表、下一个加入集群的节点的 Raft ID、当前区块的 Raft 索引）进行签名。被排序节点添加。

- BlockMetadataIndex_LAST_CONFIG=1：通道最新配置区块的序号。被排序节点添加，在 Raft 共识中弃用。

- BlockMetadataIndex_TRANSACTIONS_FILTER=2：交易状态标记。包括合法状态和一系列错误状态，在 protos/peer/transaction.pb.go 中定义。被 Peer 节点本地提交时添加。

- BlockMetadataIndex_ORDERER=3：通道的排序服务信息，被排序节点添加。Kakfa 模式下包括已处理的最后一条 Kafka 消息的 offset 等信息；Raft 共识中记录节点的 Raft ID 和下一个加入共识的序号。

- BlockMetadataIndex_COMMIT_HASH=4：2.0 版本中引入，包括对提交区块（txValidation Code 长度、txValidationCode 列表、所有写操作的排序字节组、上个区块的提交 Hash 值）的 SHA256 Hash 值。在 Peer 节点提交时候添加。

![An image](/img/chain/fabric/05.webp)

------

#### 链码

链码即链上代码，是 Fabric 中十分关键的一个概念。链码源自智能合约的思想，并进行了进一步扩展，支持多种高级编程语言。

目前 Fabric 中支持两种类型的链码：用户链码和系统链码。前者运行在单独的容器中或由外部运行，提供对上层应用的支持，后者则嵌入在系统内，支持对系统进行配置和管理。

一般所说的链码为用户链码，通过提供可编程能力提供了对上层应用的支持。用户通过链码相关的 API 编写用户链码，即可对账本中状态进行更新操作。

链码经过部署操作后，即可被调用。在安装时，需要指定具体安装到哪个 Peer 节点（Endorser），安装包最终存放到 $CORE_PEER_FILESYSTEMPATH/chaincodes/ 路径下；启用链码时还需要指定通道名称。链码之间还可以通过互相调用来创建更灵活的应用逻辑。

Fabric 目前主要支持基于 Go、Java 和 Node.JS 语言的链码。

> 注意：在跨通道调用情况下，被调用链码暂时仅支持读操作。

------

#### 通道

通道是网络中彼此隔离的数据共享渠道。每个通道拥有独立的账本，不同的 Peer 节点和排序节点可以加入不同的通道内。

通道与绑定到该通道上的配置和数据（包括交易、账本、链码实例、成员身份等），一起构成了一条完整的区块链。这些数据只会被加入通道内的组织成员所感知和访问，通道外的成员无法访问通道内数据。由于通道与账本（链结构 + 状态数据）是一一对应的，有时候两者概念可以混用。

目前，通道包括应用通道（application channel）和系统通道（systemchannel）两种类型。前者供用户应用使用，负责承载各种交易，同一个网络可以有多条应用通道，各条应用通道彼此完全独立；后者由排序节点维护，负责对网络层面的配置和应用通道进行管理。

通道在创建时，会指定所关联的访问策略、初始所包括的组织身份（证书范围等，通过 MSP 检验）、锚节点、排序节点信息等。通道创建后会构成一条区块链结构，初始区块中包含初始配置相关的信息。通道的配置信息可以由更新配置区块（reconf iguration block）进行更新。

加入应用通道内的节点需要指定或选举出代表节点（leading peer），负责代表组织从排序节点处拉取排序后的区块信息，然后通过 Gossip 协议传播给组织（准确地说，同一个 MSP）内其他节点。同时，每个组织可以指定锚节点（anchorpeer），负责代表组织与其他组织的成员进行数据交换。Raft 共识机制下，应用通道可以指定进行排序的排序节点集合（共识组），每个共识组在该通道上会动态选举出 Raft Leader。

特别地，所有排序节点都会加入系统通道内。该通道负责网络层面的配置管理（如联盟成员、排序参数）和应用通道的创建，并且是 Fabric 网络中启动时所创建的首个通道.

![An image](/img/chain/fabric/06.webp)

------

当用户需要创建新的应用通道时，需要向这个系统通道发送配置交易（configuration transaction）。配置交易中的应用子树整合系统通道的排序配置子树和通道配置子树，构成新建应用通道的初始区块。

> 注意：通道与消息队列（message queue）中主题（topic）的概念十分类似，只有加入后的成员才能访问和使用其中的消息。

------

#### 链结构

链结构与通道一一对应，主要负责维护节点本地的交易历史数据。

理解了通道，理解链结构就比较简单了。一条链结构将包括如下内容：

- 所绑定的通道内的所有交易信息，这些交易以读写集合形式进行存放。

- 通道内与链码生命周期管理相关的交易信息。

- 对链进行操作的权限管理，以及参与到链上的组织成员。

![An image](/img/chain/fabric/07.webp)

------

#### 账本

账本也是 Fabric 中十分关键的一个结构，基于区块链结构进行了进一步的延伸。

正如它的名字所暗示的，账本主要负责记录发生在网络中的交易信息。应用开发人员通过编写和执行链码发起交易，实际上是对账本中记录的状态进行变更。

![An image](/img/chain/fabric/08.webp)

从结构上看，账本包括区块链结构，以及如下多个数据库结构。

- State Database，状态数据库，由区块链结构中交易执行推演而成，记录最新的世界状态。

- Private Database，私密状态数据库，存放私密交易的状态信息，仅限指定的 Peer 之间同步。

- History Database，历史数据库，存放各个状态的历史变更记录。

- Index Database，索引数据库，存放索引信息，例如从 Hash、编号索引到区块，从 ID 索引到交易等。

区块链结构一般通过文件系统进行存储；状态数据库支持 LevelDB、CouchDB 两种实现；历史数据库和索引数据库则主要支持 LevelDB 实现。

从数据库的角度看，区块链结构记录的是状态变更的历史，状态数据库记录的是变更的最终结果。每一次对账本状态的变更都是通过交易导致的读写集合来表达。因此，发生交易实际上就是对一个读写集合进行接受的过程。由于通道隔离了交易，因此，每个通道都拥有对应的隔离的账本结构。
