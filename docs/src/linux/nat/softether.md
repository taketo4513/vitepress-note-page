# SoftEtherVPN

## 概述

### 介绍

[SoftEtherVPN](https://www.softether.org/)是开源跨平台，多重协议的虚拟专用网方案，是openvpn最佳替代方案，比openvpn要快，其L2TP VPN与windows、mac、ios和android高度兼容。SoftEtherVPN本身还具有ssl-vpn协议，可以穿透任何类型的防火墙。

### 特点

- 免费和[开源](http://www.softether.org/5-download/src)软件。
- 易于建立[远程访问](http://www.softether.org/4-docs/1-manual/A._Examples_of_Building_VPN_Networks/10.4_Build_a_PC-to-LAN_Remote_Access_VPN)和站点[到站点](http://www.softether.org/4-docs/1-manual/A._Examples_of_Building_VPN_Networks/10.5_Build_a_LAN-to-LAN_VPN_(Using_L2_Bridge)) VPN。
- HTTPS 上的 SSL-VPN 隧道，用于[通过 NAT 和防火墙](http://www.softether.org/1-features/1._Ultimate_Powerful_VPN_Connectivity)。
- 革命性的 [VPN over ICMP 和 VPN over DNS](http://www.softether.org/1-features/1._Ultimate_Powerful_VPN_Connectivity#1.6._VPN_over_ICMP.2C_and_VPN_over_DNS_(Awesome!)) 功能。
- 抵抗高度受限的防火墙。
- 通过 VPN 的[以太网桥接 （L2）](http://www.softether.org/1-features/2._Layer-2_Ethernet-based_VPN) 和 [IP 路由 （L3）。](http://www.softether.org/4-docs/1-manual/A._Examples_of_Building_VPN_Networks/10.6_Build_a_LAN-to-LAN_VPN_(Using_L3_IP_Routing))
- 嵌入式[动态 DNS](http://www.softether.org/1-features/1._Ultimate_Powerful_VPN_Connectivity#1.4._Built-in_Dynamic_DNS_(*.softether.net)) 和 [NAT 遍历](http://www.softether.org/1-features/1._Ultimate_Powerful_VPN_Connectivity#1.5._NAT_Traversal)，因此不需要静态或固定 IP 地址。
- [AES 256 位和 RSA 4096 位](http://www.softether.org/1-features/3._Security_and_Reliability)加密。
- 足够的安全功能，例如[日志记录](http://www.softether.org/4-docs/1-manual/3._SoftEther_VPN_Server_Manual/3.5_Virtual_Hub_Security_Features)和[防火墙](http://www.softether.org/4-docs/1-manual/3._SoftEther_VPN_Server_Manual/3.5_Virtual_Hub_Security_Features)内部VPN隧道。
- [1Gbps级高速吞吐性能](http://www.softether.org/4-docs/9-research/Design_and_Implementation_of_SoftEther_VPN)，内存和CPU使用率低。
- 支持**Windows，Linux，Mac，Android，iPhone，iPad和Windows Mobile**。
- SSL-VPN（HTTPS）和6种主要的VPN协议（OpenVPN，IPsec，L2TP，MS-SSTP，L2TPv3和[EtherIP](http://www.softether.org/3-spec)）都支持作为VPN隧道底层协议。
- OpenVPN[克隆功能支持传统的OpenVPN](http://www.softether.org/1-features/1._Ultimate_Powerful_VPN_Connectivity#Support_OpenVPN_Protocol)客户端。
- IPv4 / [IPv6](http://www.softether.org/1-features/4._Fast_Throughput_and_High_Ability#4.8._Full_IPv6_Supports) 双栈。
- [VPN服务器](http://www.softether.org/4-docs/1-manual/3._SoftEther_VPN_Server_Manual)运行在[Windows，Linux，FreeBSD，Solaris和Mac OS X](http://www.softether.org/3-spec)上。
- 配置 [GUI](http://www.softether.org/1-features/5._Easy_Installation_and_Management) 上的所有设置。
- [多语言](http://www.softether.org/1-features/5._Easy_Installation_and_Management#5.8._Multi-language.2C_Single_Binary_Package_and_Unicode_Support)（英语、日语和简体中文）。
- 无内存泄漏。高质量稳定的代码，用于长期运行。在发布内部版本之前，我们始终会验证没有内存或资源泄漏。
- RADIUS / NT域用户认证功能
- RSA 证书认证功能
- 深度检测数据包记录功能
- 源 IP 地址控制列表功能
- 系统日志传输函数

## 安装包部署

### 前提条件

使用softethervpn构建虚拟局域网时需要具备如下条件：

- softethervpn节点必须对公网的映射ip；
- softethervpn节点能和内网server互通；

使用L2TP/IPSec方式实现内部局域网通信

![An image](/img/linux/nat/01.webp)

### 环境依赖

| 名称               | 环境                  | 版本                       | 备注                  |
| ------------------ | --------------------- | -------------------------- | --------------------- |
| 操作系统（服务端） | Ubuntu                | 20.04                      |                       |
| 操作系统（客户端） | Windows               | 10                         |                       |
| 服务端             | SoftEther VPN Server  | Ver 4.39, Build 9772, beta |                       |
| 管理端             | SoftEther VPN Manager | Ver 4.39, Build 9772, beta | 配置SoftEther VPN界面 |
| 客户端             | Windows VPN           |                            | Windows自带VPN        |

### 环境搭建

#### 下载安装包

前往[SoftEther 下载中心](http://softether.fishinfo.cn/)下载**服务端**和**管理端**

```sh
wget https://github.com/SoftEtherVPN/SoftEtherVPN_Stable/releases/download/v4.39-9772-beta/softether-vpnserver-v4.39-9772-beta-2022.04.26-linux-x64-64bit.tar.gz
```

#### 安装服务端

```sh
# 安装依赖
sudo apt install make gcc

# 解压安装包
tar -zxvf softether-vpnserver-v4.39-9772-beta-2022.04.26-linux-x64-64bit.tar.gz 

# 编译
cd vpnserver/
make

# 输出
The preparation of SoftEther VPN Server is completed !
```

> 注意：ubuntu系统必须使用root权限操作上述步骤，否则会因权限不足导致端口无法开放！！！

#### 启动服务端

```sh
# 启动
./vpnserver start

# 输出
The SoftEther VPN Server service has been started.

Let's get started by accessing to the following URL from your PC:

https://10.0.0.121:5555/
  or
https://10.0.0.121/

Note: IP address may vary. Specify your server's IP address.
A TLS certificate warning will appear because the server uses self signed certificate by default. That is natural. Continue with ignoring the TLS warning.
```

#### 配置systemd管理

如Linux服务端上没有安装 `systemd`，可以使用 `yum` 或 `apt` 等命令安装 `systemd`。

```sh
# yum
yum install systemd
# apt
apt install systemd
```

使用文本编辑器，如 `vim` 创建并编辑 `vpnserver.service` 文件。

```sh
vim /etc/systemd/system/vpnserver.service
```

写入内容

```ini
[Unit]
# 服务的描述
Description=VpnServer
# 服务依赖—在什么服务之后启动，一般为在网络服务启动后启动
After=network.target

[Service]
# 服务类型—如果是shell脚本的方式,则Type=forking,否则不指定作何值(也就是去掉该配置项)
Type=forking

# 启动命令
ExecStart=/usr/local/vpnserver/vpnserver start
# 停止命令
ExecStop=/usr/local/vpnserver/vpnserver stop

[Install]
WantedBy=multi-user.target
```

使用 `systemd` 命令，管理 vpnserver

```sh
# 启动frp
systemctl start vpnserver
# 停止frp
systemctl stop vpnserver
# 重启frp
systemctl restart vpnserver
# 查看frp状态
systemctl status vpnserver
# 开机启动
systemctl enable vpnserver
```

#### 连接服务端

在windows系统中，启动管理端

![An image](/img/linux/nat/02.png)

首次连接无需输入密码，点击连接会提示设置新密码

![An image](/img/linux/nat/03.png)

进入简单安装界面，勾选远程访问 VPN Server 并创建一个虚拟HUB，名称随意

![An image](/img/linux/nat/04.png)

动态 DNS 功能，保持不变

![An image](/img/linux/nat/05.png)

启用 L2TP 服务器功能，并设置 IPsec 预共享密钥（尽可能复杂，客户端连接时会使用到）

![An image](/img/linux/nat/06.png)

禁用 VPN Azure 服务

![An image](/img/linux/nat/07.png)

创建新用户，设置用户名和密码

![An image](/img/linux/nat/08.png)

启用 SecureNAT 功能，暂时默认配置即可，后续会提供优化方案

![An image](/img/linux/nat/09.png)

#### 客户端连接

填写服务器名称或地址（自定义），VPN类型选择L2TP/IPsec，预共享密钥、用户名和密码需填写正确

![An image](/img/linux/nat/10.png)

连接成功

![An image](/img/linux/nat/11.png)

## Docker部署

### 前提条件

使用softethervpn构建虚拟局域网时需要具备如下条件：

- softethervpn节点必须对公网的映射ip；
- softethervpn节点能和内网server互通；

使用L2TP/IPSec方式实现内部局域网通信

![An image](/img/linux/nat/01.webp)

### 环境依赖

| 名称               | 环境                  | 版本                           | 备注                  |
| ------------------ | --------------------- | ------------------------------ | --------------------- |
| 操作系统（服务端） | Ubuntu                | 20.04                          |                       |
| 操作系统（客户端） | Windows               | 10                             |                       |
| 服务端             | SoftEther VPN Server  | Ver 4.39, Build 9772, beta     |                       |
| 管理端             | SoftEther VPN Manager | Ver 4.39, Build 9772, beta     | 配置SoftEther VPN界面 |
| 客户端             | Windows VPN           |                                | Windows自带VPN        |
| 容器               | Docker                | version 24.0.5, build ced0996  |                       |
| 容器编排           | Docker-compose        | version 1.29.2, build 5becea4c |                       |

### 环境搭建

dockerhub：[siomiz/softethervpn](https://hub.docker.com/r/siomiz/softethervpn)

#### 生成服务配置文件

```sh
# 创建数据目录
mkdir -p softethervpn/data/{server_log,packet_log,security_log} && cd softethervpn/

# 生成用户账户配置文件；
sudo docker pull siomiz/softethervpn:4.39
sudo docker run --rm siomiz/softethervpn:4.39 gencert > softethervpn_env

# 配置服务参数
# sudo vim softethervpn_env
TZ=Asia/Shanghai   # 设置时区
PSK=vpn  # 预共享密钥，设置复杂一点就好
SPW=test # 管理端密码
USERS=user1:admin@123;user2:admin@456 # 账户:密码，多个账号用";"隔开即可
```

#### 构建compose文件

```sh
# 添加compose文件
cat > docker-compose.yml <<eof
version: "3.9"
services:
  vpn:
    image: "siomiz/softethervpn:4.39"
    container_name: softethervpn
    privileged: true
    cap_add:
      - NET_ADMIN
    volumes:
      - "./data/server_log:/usr/vpnserver/server_log"
      - "./data/packet_log:/usr/vpnserver/packet_log"
      - "./data/security_log:/usr/vpnserver/security_log"
      - /etc/localtime:/etc/localtime
    env_file:
      - "./softethervpn_env"
    ports:
      # 公网放行vpn节点的500、1701、4500三个端口的udp协议策略；
      - 5555:5555/tcp
      - 500:500/udp
      - 4500:4500/udp
      - 1701:1701/udp
eof

# 启动服务
docker compose up -d
```
