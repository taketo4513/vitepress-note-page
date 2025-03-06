# Tailscale

## 介绍

Tailscale 是一个基于 WireGuard 的现代 VPN（虚拟专用网络）解决方案，旨在简化设备之间的安全连接。它通过点对点（P2P）技术，让用户能够轻松地在不同设备之间建立加密的网络连接，而无需复杂的配置或管理。Tailscale 特别适合个人用户、开发团队和企业，用于远程访问、跨设备协作以及安全地连接分布式基础设施。

## 传统 VPN 与 Tailscale 的对比

### 传统 VPN 的问题

- **高延迟**：用户通过位于远距离的中央网关连接，导致高延迟。
- **瓶颈效应**：流量集中化可能导致瓶颈，进一步减慢连接速度。

### Tailscale 的优势

- **低延迟**：Tailscale 允许设备之间直接连接，从而降低延迟。例如，查尔斯顿的用户可以直接连接到纽约市的计算机。
- **去中心化**：Tailscale 尽可能避免集中化，从而提高吞吐量和降低延迟，同时增强稳定性和可靠性，减少单点故障。

## 主要优势

### 安全与隐私

Tailscale 提供设备之间的安全私有连接，采用现代、经过验证的技术和最佳实践，如端到端加密和零信任架构。其核心使用 WireGuard，这是一种以安全性和性能著称的先进 VPN 协议。Tailscale 还通过访问控制策略和 tailnet 锁定等功能进一步增强安全性。

### 灵活的网络拓扑

Tailscale 的网络架构灵活，能够根据组织需求无缝扩展。无论是从小团队扩展到大型企业，还是跨多个地理位置扩展，Tailscale 都能保持其性能和安全性。其分布式架构意味着添加新设备或用户不会像传统 VPN 解决方案那样造成瓶颈。

### 简化设置

Tailscale 高度可配置，但上手非常简单。与传统 VPN 需要大量配置、服务器设置和网络专业知识不同，您可以在几分钟内部署 Tailscale 网络（tailnet）。创建账户后，验证两个或更多设备会自动创建一个具有合理默认访问策略的 tailnet。
Tailscale 的连接在防火墙和网络地址转换（NAT）之间无缝工作，无需端口转发或复杂的防火墙规则。这种“零配置”方法大大降低了实施安全网络的技术门槛，使其对技术用户和非技术用户都易于使用。

### 跨平台与基础设施无关

Tailscale 支持多种平台，且与基础设施无关，具有高度可配置性和丰富的功能与集成。

## 快速开始

### 下载客户端

访问[Download | Tailscale](https://tailscale.com/download)下载客户端

Linux：

```sh
curl -fsSL https://tailscale.com/install.sh | sh
```

window：

```sh
https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe
```

### 常用命令

#### 命令列表

```sh
tailscale --help
SUBCOMMANDS
  up          Connect to Tailscale, logging in if needed # 连接到 Tailscale 网络。如果还没有登录，会提示你登录。
  down        Disconnect from Tailscale # 断开与 Tailscale 网络的连接。
  set         Change specified preferences # 修改 Tailscale 的配置选项。
  login       Log in to a Tailscale account # 登录到你的 Tailscale 账户。
  logout      Disconnect from Tailscale and expire current node key # 退出当前 Tailscale 账户，并断开连接。
  switch      Switches to a different Tailscale account # 切换到另一个 Tailscale 账户。
  configure   [ALPHA] Configure the host to enable more Tailscale features
  netcheck    Print an analysis of local network conditions # 检查本地网络状况，看看是否有问题影响 Tailscale 连接。
  ip          Show Tailscale IP addresses # 显示当前设备在 Tailscale 网络中的 IP 地址。
  dns         Diagnose the internal DNS forwarder # 诊断 Tailscale 内部的 DNS 服务。
  status      Show state of tailscaled and its connections # 查看当前 Tailscale 的连接状态，包括已连接的设备。
  ping        Ping a host at the Tailscale layer, see how it routed # 测试与另一台 Tailscale 设备的网络连通性。
  nc          Connect to a port on a host, connected to stdin/stdout # 通过 Tailscale 网络连接到另一台设备的指定端口。
  ssh         SSH to a Tailscale machine # 通过 Tailscale 网络 SSH 连接到另一台设备。
  funnel      Serve content and local servers on the internet # 将本地服务暴露到互联网，让外部用户访问。
  serve       Serve content and local servers on your tailnet # 在 Tailscale 网络中共享本地服务。
  version     Print Tailscale version # 显示当前安装的 Tailscale 版本。
  web         Run a web server for controlling Tailscale
  file        Send or receive files # 通过 Tailscale 网络发送或接收文件。
  bugreport   Print a shareable identifier to help diagnose issues # 生成一个报告，用于帮助诊断 Tailscale 的问题。
  cert        Get TLS certs # 获取 TLS 证书，用于加密通信。
  lock        Manage tailnet lock # 管理 Tailscale 网络的安全锁定功能。
  licenses    Get open source license information
  exit-node   Show machines on your tailnet configured as exit nodes # 查看或设置 Tailscale 网络中的出口节点（用于访问外部网络）。
  update      Update Tailscale to the latest/different version # 更新 Tailscale 到最新版本。
  whois       Show the machine and user associated with a Tailscale IP (v4 or v6) # 查看某个 Tailscale IP 地址对应的设备和用户信息。
  drive       Share a directory with your tailnet
  completion  Shell tab-completion scripts # 生成 Shell 自动补全脚本，方便命令行使用。

FLAGS
  --socket value
        path to tailscaled socket (default /var/run/tailscale/tailscaled.sock)
```

#### 基本命令

`tailscale login`：启动 Tailscale 并连接到网络。

```sh
tailscale login --login-server https://xxx.xxx
```

`tailscale down`：断开 Tailscale 连接并停止服务。

`tailscale status`:：查看当前 Tailscale 网络中的设备及其连接状态。

`tailscale netcheck`:：查看当前 Tailscale 网络中的节点。

`tailscale ping`：测试与 Tailscale 网络中其他设备的连接。

`tailscale logout`：从当前设备注销 Tailscale 账户。

`tailscale switch`：切换 Tailscale 账户。

`tailscale set`：配置设备属性。

`tailscale dns`：配置DNS

```sh
tailscale set --accept-dns=false
```

`tailscale version`：查看 Tailscale 客户端版本。
