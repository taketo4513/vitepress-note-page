# Ingress

## 概述

Service对集群之外暴露服务的主要方式有两种：`NotePort` 和 `LoadBalancer`，但是这两种方式，都有一定的缺点：

- `NodePort` 方式的缺点是会占用很多集群机器的端口，那么当集群服务变多的时候，这个缺点就愈发明显
- LB方式的缺点是每个service需要一个LB，浪费、麻烦，并且需要kubernetes之外设备的支持

基于这种现状，kubernetes提供了Ingress资源对象，Ingress只需要一个 `NodePort` 或者一个 `LB` 就可以满足暴露多个Service的需求。

工作机制大致如下图表示：

实际上，Ingress相当于一个7层的负载均衡器，是kubernetes对反向代理的一个抽象，它的工作原理类似于Nginx，可以理解成在Ingress里建立诸多映射规则，`Ingress Controller`通过监听这些配置规则并转化成Nginx的反向代理配置 , 然后对外部提供服务。

在这里有两个核心概念：

- `ingress`：kubernetes中的一个对象，作用是定义请求如何转发到service的规则
- `ingress controller`：具体实现反向代理及负载均衡的程序，对 `ingress` 定义的规则进行解析，根据配置的规则来实现请求转发，实现方式有很多，比如`Nginx`，`Contour`，`Haproxy`等等

Ingress（以 `Nginx` 为例）的工作原理如下：

1. 用户编写Ingress规则，说明哪个域名对应kubernetes集群中的哪个Service
2. Ingress控制器动态感知Ingress服务规则的变化，然后生成一段对应的Nginx反向代理配置
3. Ingress控制器会将生成的Nginx配置写入到一个运行着的Nginx服务中，并动态更新
4. 到此为止，其实真正在工作的就是一个Nginx了，内部配置了用户定义的请求转发规则

## ingress-nginx

`ingress-nginx` 是 Kubernetes 的 Ingress 控制器，使用 [NGINX](https://www.nginx.org/) 作为反向代理和加载 平衡器。

GitHub地址：[kubernetes/ingress-nginx: Ingress-NGINX Controller for Kubernetes (github.com)](https://github.com/kubernetes/ingress-nginx)

### 版本要求

| Supported | Ingress-NGINX version | k8s supported version        | Alpine Version | Nginx Version | Helm Chart Version |
| --------- | --------------------- | ---------------------------- | -------------- | ------------- | ------------------ |
| 🔄         | **v1.9.4**            | 1.28, 1.27,1.26, 1.25        | 3.18.4         | 1.21.6        | 4.8.3*             |
| 🔄         | **v1.9.3**            | 1.28, 1.27,1.26, 1.25        | 3.18.4         | 1.21.6        | 4.8.*              |
| 🔄         | **v1.9.1**            | 1.28, 1.27,1.26, 1.25        | 3.18.4         | 1.21.6        | 4.8.*              |
| 🔄         | **v1.9.0**            | 1.28, 1.27,1.26, 1.25        | 3.18.2         | 1.21.6        | 4.8.*              |
| 🔄         | **v1.8.4**            | 1.27,1.26, 1.25, 1.24        | 3.18.2         | 1.21.6        | 4.7.*              |
| 🔄         | **v1.8.2**            | 1.27,1.26, 1.25, 1.24        | 3.18.2         | 1.21.6        | 4.7.*              |
| 🔄         | **v1.8.1**            | 1.27,1.26, 1.25, 1.24        | 3.18.2         | 1.21.6        | 4.7.*              |
| 🔄         | **v1.8.0**            | 1.27,1.26, 1.25, 1.24        | 3.18.0         | 1.21.6        | 4.7.*              |
| 🔄         | **v1.7.1**            | 1.27,1.26, 1.25, 1.24        | 3.17.2         | 1.21.6        | 4.6.*              |
| 🔄         | **v1.7.0**            | 1.26, 1.25, 1.24             | 3.17.2         | 1.21.6        | 4.6.*              |
|           | v1.6.4                | 1.26, 1.25, 1.24, 1.23       | 3.17.0         | 1.21.6        | 4.5.*              |
|           | v1.5.1                | 1.25, 1.24, 1.23             | 3.16.2         | 1.21.6        | 4.4.*              |
|           | v1.4.0                | 1.25, 1.24, 1.23, 1.22       | 3.16.2         | 1.19.10+      | 4.3.0              |
|           | v1.3.1                | 1.24, 1.23, 1.22, 1.21, 1.20 | 3.16.2         | 1.19.10+      | 4.2.5              |
|           | v1.3.0                | 1.24, 1.23, 1.22, 1.21, 1.20 | 3.16.0         | 1.19.10+      | 4.2.3              |

### 安装

```sh

```