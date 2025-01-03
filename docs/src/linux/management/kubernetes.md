# 简介概览

## 简介

Kubernetes 是一个开源的容器编排引擎和容器集群管理工具，用来对容器化应用进行自动化部署、 扩缩和管理。

**Kubernetes** 这个名字源于希腊语，意为“舵手”或“飞行员”。k8s 这个缩写是因为 k 和 s 之间有8个字符。 Google 在 2014 年开源了 Kubernetes 项目。

中文官网：[https://kubernetes.io/zh](https://kubernetes.io/zh)

中文社区：[https://www.kubernetes.org.cn](https://www.kubernetes.org.cn)

GitHub：[kubernetes/kubernetes: Production-Grade Container Scheduling and Management (github.com)](https://github.com/kubernetes/kubernetes)

### 部署发展历程

在部署应用程序的方式上，主要经历了三个时代

![An image](/img/linux/management/01.png)

- 传统部署：互联网早期，会直接将应用程序部署在物理机上

  >优点：简单，不需要其它技术的参与
  >
  >缺点：不能为应用程序定义资源使用边界，很难合理地分配计算资源，而且程序之间容易产生影响

- 虚拟化部署：可以在一台物理机上运行多个虚拟机，每个虚拟机都是独立的一个环境

  >优点：程序环境不会相互产生影响，提供了一定程度的安全性
  >
  >缺点：增加了操作系统，浪费了部分资源

- 容器化部署：与虚拟化类似，但是共享了操作系统

  >优点：可以保证每个容器拥有自己的文件系统、CPU、内存、进程空间等运行应用程序所需要的资源都被容器包装，并和底层基础架构解耦容器化的应用程序可以跨云服务商、跨Linux操作系统发行版进行部署
  >
  >缺点：一个容器故障停机了，怎么样让另外一个容器立刻启动去替补停机的容器。当并发访问量变大的时候，怎么样做到横向扩展容器数量

### 优势特点

Kubernetes 建立在 [Google 大规模运行生产工作负载十几年经验](https://research.google/pubs/pub43438)的基础上， 结合了社区中最优秀的想法和实践。它之所以能够迅速流行起来，是因为它的许多功能高度契合互联网大厂的部署和运维需求。

Kubernetes 可以提供：

- **服务发现和负载均衡**

  Kubernetes 可以使用 DNS 名称或自己的 IP 地址来曝露容器。 如果进入容器的流量很大Kubernetes 可以负载均衡并分配网络流量，从而使部署稳定。

- **存储编排**

​  Kubernetes 允许你自动挂载你选择的存储系统，例如本地存储、公共云提供商等。

- **自动部署和回滚**

  你可以使用 Kubernetes 描述已部署容器的所需状态， 它可以以受控的速率将实际状态更改为期望状态。 例如，你可以自动化 Kubernetes 来为你的部署创建新容器， 删除现有容器并将它们的所有资源用于新容器。也可以是方便的实现金丝雀部署(canary deployment )。

- **自动完成装箱计算**

  你为 Kubernetes 提供许多节点组成的集群，在这个集群上运行容器化的任务。 你告诉 Kubernetes 每个容器需要多少 CPU 和内存 (RAM)。 Kubernetes 可以将这些容器按实际情况调度到你的节点上，以最佳方式利用你的资源。

- **自我修复**

  Kubernetes 将重新启动失败的容器、替换容器、杀死不响应用户定义的运行状况检查的容器， 并且在准备好服务之前不将其通告给客户端。

- **密钥与配置管理**

  Kubernetes 允许你存储和管理敏感信息，例如密码、OAuth 令牌和 ssh 密钥。 你可以在不重建容器镜像的情况下部署和更新密钥和应用程序配置，也无需在堆栈配置中暴露密钥。

## 云原生

2015 年由 Google、Redhat 等大型云计算厂商以及一些开源公司共同牵头成立了Cloud Native Computing Foundation（云原生计算基金会）。

云原生计算基金会（CNCF）致力于培育和维护一个厂商中立的开源生态系统，来推广云原生技术。

云原生的概念从此广泛传播。

## 云原生定义

Kubernetes 是 CNCF 托管的第一个开源项目。因此现在提到云原生，往往我们都把它与kubernetes联系起来。

- **通俗解释**

  使用Java、Go、PHP、Python等语言开发的应用我们称之为原生应用，在设计和开发这些应用时，使他们能够运行在云基础设施(或kubernetes)上，从而使应用具备可弹性扩展的能力，我们称之为云原生应用。我们可以将云原生理解为以容器技术为载体、基于微服务架构思想的一套技术体系和方法论。

- **官方定义**

  云原生技术有利于各组织在公有云、私有云和混合云等新型动态环境中，构建和运行可弹性扩展的应用。云原生的代表技术包括容器、服务网格、微服务、不可变基础设施和声明式API。

  这些技术能够构建容错性好、易于管理和便于观察的松耦合系统。结合可靠的自动化手段，云原生技术使工程师能够轻松地对系统作出频繁和可预测的重大变更。

- **微服务**

  在Kubernetes之前，Pivotal（开源 Java 开发框架Spring的母公司，后被 VMware 收购）是云原生应用的提出者，并推出了Pivotal Cloud Foundry 云原生应用平台和Spring Cloud开发框架，成为云原生应用架构中先驱者和探路者。Spring Cloud通过微服务架构，使程序具备可拓展性和在分布式环境运行的能力。

  Spring Cloud和Kubernetes有很多功能是重合的

  - 服务注册和发现
  - API网关
  - 负载均衡
  - 配置管理

  但是Spring Cloud只能用于Java应用开发，而kubernetes是语言无关的，可以用于各种语言开发的应用。
