# Raft共识算法

## Raft共识算法

Raft 是一种基于 etcd 中 Raft 协议实现的崩溃容错（Crash Fault Tolerant，CFT）排序服务。Raft 遵循 “领导者跟随者” 模型，这个模型中，在每个通道上选举领导者节点，其决策被跟随者复制。Raft 排序服务会比基于 Kafka 的排序服务更容易设置和管理，它的设计允许不同的组织为分布式排序服务贡献节点。

对于将用于生产网络的排序服务，Fabric 实现了使用 “领导者跟随者” 模型的 Raft 协议，领导者是在一个通道的排序节点中动态选择的（这个集合的节点称为 “共识者集合（consenter set）”），领导者将信息复制到跟随者节点。Raft 被称为 “崩溃容错” 是因为系统可以承受节点的损失，包括领导者节点，前提是要剩余大量的排序节点（称为 “法定人数（quorum）”）。换句话说，如果一个通道中有三个节点，它可以承受一个节点的丢失（剩下两个节点）。如果一个通道中有五个节点，则可以丢失两个节点（剩下三个节点）。

Raft 是向开发拜占庭容错（BFT）排序服务迈出的第一步。正如我们将看到的，Fabric 开发中的一些决策是由这个驱动的。如果你对 BFT 感兴趣，学习如何使用 Raft 应该可以慢慢过渡。

### Raft 概念

虽然 Raft 提供了许多与 Kafka 相同的功能（尽管它是一个简单易用的软件包）但它与 Kafka 的功能却大不相同，它向 Fabric 引入了许多新的概念，或改变了现有的概念。

日志条目（Log entry）。 Raft 排序服务中的主要工作单元是一个 “日志条目”，该项的完整序列称为 “日志”。如果大多数成员（换句话说是一个法定人数）同意条目及其顺序，则我们认为条目是一致的，然后将日志复制到不同排序节点上。

共识者集合（Consenter set）。主动参与给定通道的共识机制并接收该通道的日志副本的排序节点。这可以是所有可用的节点（在单个集群中或在多个集群中为系统通道提供服务），也可以是这些节点的一个子集。

有限状态机（Finite-State Machine，FSM）。Raft 中的每个排序节点都有一个 FSM，它们共同用于确保各个排序节点中的日志序列是确定（以相同的顺序编写）。

法定人数（Quorum）。描述需要确认提案的最小同意人数。对于每个共识者集合，这是大多数节点。在具有五个节点的集群中，必须有三个节点可用，才能有一个法定人数。如果节点的法定人数因任何原因不可用，则排序服务集群对于通道上的读和写操作都不可用，并且不能提交任何新日志。

领导者（Leader）。这并不是一个新概念，正如我们所说，Kafka 也使用了领导者，但是在任何给定的时间，通道的共识者集合都选择一个节点作为领导者，这一点非常重要（我们稍后将在 Raft 中描述这是如何发生的）。领导者负责接收新的日志条目，将它们复制到跟随者的排序节点，并在认为提交了某个条目时进行管理。这不是一种特殊类型的排序节点。它只是排序节点在某些时候可能扮演的角色，而不是由客观环境决定的其他角色。

跟随者（Follower）。再次强调，这不是一个新概念，但是理解跟随者的关键是跟随者从领导者那里接收日志并复制它们，确保日志保持一致。我们将在关于领导者选举的部分中看到，跟随者也会收到来自领导者的 “心跳” 消息。如果领导者在一段可配置的时间内停止发送这些消息，跟随者将发起一次领导者选举，它们中的一个将当选为新的领导者。

### 交易流程中的 Raft

每个通道都在 Raft 协议的单独实例上运行，该协议允许每个实例选择不同的领导者。这种配置还允许在集群由不同组织控制的排序节点组成的用例中进一步分散服务。虽然所有 Raft 节点都必须是系统通道的一部分，但它们不一定必须是所有应用程序通道的一部分。通道创建者（和通道管理员）能够选择可用排序节点的子集，并根据需要添加或删除排序节点（只要一次只添加或删除一个节点）。

虽然这种配置以冗余心跳消息和线程的形式产生了更多的开销，但它为 BFT 奠定了必要的基础。

在 Raft 中，交易（以提案或配置更新的形式）由接收交易的排序节点自动路由到该通道的当前领导者。这意味着 Peer 节点和应用程序在任何特定时间都不需要知道谁是领导者节点。只有排序节点需要知道。

当排序节点检查完成后，将按照我们交易流程的第二阶段的描述，对交易进行排序、打包成区块、协商并分发。

### Raft 是如何选举领导者的

节点总是处于以下三种状态之一：跟随者、候选人或领导者。所有节点最初都是作为跟随者开始的。在这种状态下，他们可以接受来自领导者的日志条目（如果其中一个已经当选），或者为领导者投票。如果在一段时间内没有接收到日志条目或心跳（例如，5 秒），节点将自己提升到候选状态。在候选状态中，节点从其他节点请求选票。如果候选人获得法定人数的选票，那么他就被提升为领导者。领导者必须接受新的日志条目并将其复制到跟随者。

> 动画演示： [http://thesecretlivesofdata.com/raft/](https://www.oschina.net/action/GoToLink?url=http%3A%2F%2Fthesecretlivesofdata.com%2Fraft%2F)

### 快照

如果一个排序节点宕机，它如何在重新启动时获得它丢失的日志？

虽然可以无限期地保留所有日志，但是为了节省磁盘空间，Raft 使用了一个称为 “快照” 的过程，在这个过程中，用户可以定义日志中要保留多少字节的数据。这个数据量将决定区块的数量（这取决于区块中的数据量。注意，快照中只存储完整的区块）。

例如，假设滞后副本 R1 刚刚重新连接到网络。它最新的区块是 100。领导者 L 位于第 196 块，并被配置为快照 20 个区块。R1 因此将从 L 接收区块 180，然后为区块 101 到 180 区块 分发 请求。然后 180 到 196 的区块将通过正常 Raft 协议复制到 R1。