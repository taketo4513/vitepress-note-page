# 命名空间

## 概述

命名空间(Namespace)是一种资源隔离机制，将同一集群中的资源划分为相互隔离的组。

命名空间可以在多个用户之间划分集群资源（通过[资源配额](https://kubernetes.io/zh-cn/docs/concepts/policy/resource-quotas/)）。

- 例如我们可以设置**开发、测试、生产**等多个命名空间。

同一命名空间内的资源名称要唯一，但跨命名空间时没有这个要求。

命名空间作用域仅针对带有名字空间的对象，例如 `Deployment`、`Service` 等。

这种作用域对集群访问的对象不适用，例如 `StorageClass`、`Node`、`PersistentVolume` 等。

## 默认命名空间

**Kubernetes 会创建四个初始命名空间：**

- `default`：默认的命名空间，不可删除，未指定命名空间的对象都会被分配到default中。
- `kube-system`：Kubernetes 系统对象(控制平面和Node组件)所使用的命名空间。
- `kube-public`：自动创建的公共命名空间，所有用户（包括未经过身份验证的用户）都可以读取它。通常我们约定，将整个集群中公用的可见和可读的资源放在这个空间中。
- `kube-node-lease`：[租约（Lease）](https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/lease-v1/)对象使用的命名空间。每个节点都有一个关联的 lease 对象，lease 是一种轻量级资源。lease对象通过发送[心跳](https://kubernetes.io/zh-cn/docs/concepts/architecture/nodes/#heartbeats)，检测集群中的每个节点是否发生故障。

> 对于生产集群，请考虑**不要**使用 `default` 名字空间，而是创建其他名字空间来使用。

## 使用多个命名空间

- 命名空间是在多个用户之间划分集群资源的一种方法（通过[资源配额](https://kubernetes.io/zh-cn/docs/concepts/policy/resource-quotas/)）。
  - 例如我们可以设置开发、测试、生产等多个命名空间。
- 不必使用多个命名空间来分隔轻微不同的资源。
  - 例如同一软件的不同版本： 应该使用[标签](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/) 来区分同一命名空间中的不同资源。
- 命名空间适用于跨多个团队或项目的场景。
  - 对于只有几到几十个用户的集群，可以不用创建命名空间。
- 命名空间不能相互嵌套，每个 Kubernetes 资源只能在一个命名空间中。

## 管理命名空间

创建命名空间

```sh
kubectl create namespace dev
```

查看命名空间

```sh
kubectl get ns
```

在命名空间内运行Pod

```sh
kubectl run nginx --image=nginx --namespace=dev
kubectl run my-nginx --image=nginx -n=dev
```

查看命名空间内的Pod

```sh
kubectl get pods -n dev
```

查看命名空间内所有对象

```sh
kubectl get all -n dev
```

删除命名空间会删除命名空间下的所有内容

```sh
kubectl delete ns dev
```

## 切换命名空间

查看当前上下文

```sh
kubectl config current-context
```

将 `dev` 设为当前命名空间，后续所有操作都在此命名空间下执行。

```sh
kubectl config set-context $(kubectl config current-context) --namespace=dev
```
