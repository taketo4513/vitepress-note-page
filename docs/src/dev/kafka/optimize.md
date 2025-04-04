# 性能优化

## 资源配置

### 操作系统

Kafka的网络客户端底层使用Java NIO的Selector方式，而Selector在Linux的实现是epoll，在Windows上实现机制为select。因此Kafka部署在Linux会有更高效的I/O性能。

数据在磁盘和网络之间进行传输时候，在Linux上可以享受到零拷贝机制带来的快捷和便利高效，而Windows在一定程度上会使用零拷贝操作。

所以建议Kafka部署在Linux操作系统上。

### 磁盘选择

Kafka 存储方式为顺序读写，机械硬盘的最大劣势在于随机读写慢。所以使用机械硬盘并不会造成性能低下。所以磁盘选用普通机械硬盘即可，Kafka自身已经有冗余机制，而且通过分区的设计，实现了负载均衡的功能。不做磁盘组raid阵列也是可以的。

磁盘空间需要多少，需要根据具体场景进行简单估算

设计场景：日志数据每天向kafka发送1亿条数据，每条数据有两个副本防止数据丢失，数据保存两周，每条消息平均大小为1KB。

1. 每天1亿条1KB消息，保存两份，则每天总大小为：

   `(100000000*1KB*2)/1024/1024≈200GB`

2. kafka除了消息数据还有其他类型的数据，故增加10%的冗余空间，则需要220GB

3. 两周时间则为 `220GB*14≈3TB`

4. 如果启用压缩，压缩比约在 `0.75` 左右，则总存储空间规划为`3TB*0.75=2.25TB`

### 网络带宽

如果网络为万兆带宽，基本不会出现网络瓶颈，如果数据量特别大，按照下文中的设计场景进行计算。如果网络为百兆或者千兆带宽，在处理较大数据量场景下会出现网络瓶颈，可按照下面的传统经验公式进行计算处理，也可按照下述场景按照自己生产实际情况进行设计。

```SH
# 经验公式：服务器台数 = 2 × (生产者峰值生产速率 × 副本数 ÷ 100) + 1
```

带宽情况最容易成为 kafka 的瓶颈。

设计场景：如果机房为千兆带宽，我们需要在一小时内处理`1TB`的数据，需要多少台kafka 服务器？

1. 由于带宽为千兆网，`1000Mbps=1Gbps`，则每秒钟每个服务器能收到的数据量为 `1Gb=1000Mb`
2. 假设 Kafka 占用整个服务器网络的70%（其他 30%为别的服务预留），则Kafka可以使用到700Mb 的带宽，但是如果从常规角度考虑，我们不能总让Kafka顶满带宽峰值，所以需要预留出2/3甚至3/4的资源，也就是说，Kafka单台服务器使用带宽实际应为 `700Mb/3=240Mb`
3. 1 小时需要处理1TB数据，`1TB=1024*1024*8Mb=8000000Mb`，则一秒钟处理数据量为：`8000000Mb/3600s=2330Mb` 数据。
4. 需要的服务器台数为：`2330Mb/240Mb≈10` 台。
5. 考虑到消息的副本数如果为 2，则需要20台服务器，副本如果为3，则需要30台服务器。

### 内存配置

Kafka运行过程中设计到的内存主要为JVM的堆内存和操作系统的页缓存，每个Broker节点的堆内存建议10-15G内存，而数据文件（默认为1G）的25%在内存就可以了。综合上述，Kafka在大数据场景下能够流畅稳定运行至少需要11G，建议安装Kafka的服务器节点的内存至少大于等于16G。

### CPU选择

观察所有的Kafka与线程相关的配置，一共有以下几个

| 参数名                              | 备注                                                   | 默认值 |
| ----------------------------------- | ------------------------------------------------------ | ------ |
| `num.network.threads`               | 服务器用于接收来自网络的请求并向网络发送响应的线程数量 | 3      |
| `num.io.threads`                    | 服务器用于处理请求的线程数，其可能包括磁盘I/O          | 8      |
| `num.replica.fetchers`              | 副本拉取线程数，调大该值可以增加副本节点拉取的并行度   | 1      |
| `num.recovery.threads.per.data.dir` | 每个数据目录在启动时用于日志回复和在关闭时刷新的线程数 | 1      |
| `log.cleaner.threads`               | 用于日志清理的后台线程数                               | 1      |
| `background.threads`                | 用于各种后台处理任务的线程数                           | 10     |

在生产环境中，建议CPU核数最少为16核，建议32核以上，方可保证大数据环境中的Kafka集群正常处理与运行。

## 集群容错

### 副本分配策略

Kafka采用分区机制对数据进行管理和存储，每个Topic可以有多个分区，每个分区可以有多个副本。应根据业务需求合理配置副本，一般建议设置至少2个副本以保证高可用性。

### 故障转移方案

当Kafka集群中的某个Broker节点发生故障时，其负责的分区副本将会被重新分配到其他存活的Broker节点上，并且会自动选择一个备份分区作为新的主分区来处理消息的读写请求。

### 数据备份与恢复

Kafka采用基于日志文件的存储方式，每个Broker节点上都有副本数据的本地备份。在数据备份方面，可以通过配置Kafka的数据保留策略和数据分区调整策略来保证数据的持久性和安全性；在数据恢复方面，可以通过查找备份数据并进行相应的分区副本替换来恢复数据。

## 参数配置优化

| 参数名                                  | 默认参数值      | 位置   | 优化场景   | 备注                     |
| --------------------------------------- | --------------- | ------ | ---------- | ------------------------ |
| `num.network.threads`                   | 3               | 服务端 | 低延迟     |                          |
| `num.io.threads`                        | 8               | 服务端 | 低延迟     |                          |
| `socket.send.buffer.bytes`              | 102400(100K)    | 服务端 | 高吞吐     |                          |
| `socket.receive.buffer.bytes`           | 65536(64K)      | 服务端 | 高吞吐场景 |                          |
| `max.in.flight.requests.per.connection` | 5               | 生产端 | 幂等       |                          |
| `buffer.memory`                         | 33554432（32M） | 生产端 | 高吞吐     |                          |
| `batch.size`                            | 16384(16K)      | 生产端 | 提高性能   |                          |
| `linger.ms`                             | 0               | 生产端 | 提高性能   |                          |
| `fetch.min.bytes`                       | 1               | 消费端 | 提高性能   | 网络交互次数             |
| `max.poll.records`                      | 500             | 消费端 | 批量处理   | 控制批量获取消息数量     |
| `fetch.max.bytes`                       | 57671680 (55M)  | 消费端 | 批量处理   | 控制批量获取消息字节大小 |

## 数据压缩和批量发送

通过压缩和批量发送可以优化Kafka的性能表现。Kafka支持多种数据压缩算法，包括`Gzip`、`Snappy`、`LZ4`和`zstd`。在不同场景下，需要选择合适的压缩算法，以确保性能最优。

下面的表格为网络上不同压缩算法的测试数据，仅作参考

| 压缩算法 | 压缩比率 | 压缩效率 | 解压缩效率 |
| -------- | -------- | -------- | ---------- |
| snappy   | 2.073    | 580m/s   | 2020m/s    |
| lz4      | 2.101    | 800m/s   | 4220m/s    |
| zstd     | 2.884    | 520m/s   | 1600m/s    |

从表格数据可以直观看出，`zstd`有着最高得压缩比，而`LZ4`算法，在吞吐量上表现得非常高效。对于Kafka而言，在吞吐量上比较：`lz4 > snappy>zstd>gzip`。而在压缩比上：`zstd>lz4>gzip>snappy`

```yaml
spring:
  kafka:
    # 生产者
    producer:
      # 压缩，默认 none，可配置值 gzip、snappy、lz4和zstd
      compression-type: snappy
```

Kafka支持两种批处理方式：异步批处理和同步批处理。在不同场景下，需要选择合适的批处理方式，进行性能优化。同时需要合理设置批处理参数，如`batch.size`、`linger.ms`等。

```yaml
spring:
  kafka:
    # 生产者
    producer:
      # 批次大小，默认 16k，适当增加该值，可以提高吞吐量，但是如果该值设置太大，会导致数据传输延迟增加。当 linger.ms=0 时，此值无效
      batch-size: 16384
      # RecordAccumulator 缓冲区总大小，默认 32m
      buffer-memory: 33554432
      # 属性配置
      properties:
        # 消息提交延时时间(单位毫秒)，当生产者接收到消息 linger.ms 秒钟后，就会将消息提交给 kafka
        # 当生产端积累的消息达到 batch-size 大小后，也会将消息提交给 kafka
        # linger.ms 默认为 0 ，表示每接收到一条消息就会立即提交给 kafka，此时 batch-size 无效。如果对实时性要求高，则建议设置为 0
        # 数据拉取等待时间，生产环境建议该值大小为 5-100ms 之间。
        linger.ms: 0
```
