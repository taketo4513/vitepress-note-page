# Headscale

## 介绍

Headscale 是一个开源的、自托管的 Tailscale 控制服务器（Control Server）。Tailscale 是一个基于 WireGuard 协议的虚拟专用网络（VPN）工具，而 Headscale 则允许你在自己的服务器上运行 Tailscale 的控制平面，从而完全掌控你的网络环境，而不依赖 Tailscale 的官方云服务。

## 核心功能

1. **自托管**
    你可以在自己的服务器上运行 Headscale，完全控制你的网络和数据。
2. **兼容 Tailscale 客户端**
    Headscale 与 Tailscale 客户端完全兼容，你可以使用 Tailscale 客户端连接到 Headscale 服务器。
3. **多用户支持**
    Headscale 支持多用户管理，可以为不同的用户或团队分配独立的网络权限。
4. **灵活的网络配置**
    你可以自定义 DNS、子网路由、访问控制列表（ACL）等网络配置。
5. **轻量级**
    Headscale 设计简洁，资源占用低，适合在小型服务器或容器中运行。

## 工作原理

1. **控制服务器**：Headscale 作为控制服务器，负责管理设备注册、认证和网络配置。
2. **客户端连接**：设备通过 Tailscale 客户端连接到 Headscale 服务器。
3. **点对点通信**：设备之间通过 WireGuard 协议直接通信，数据不经过 Headscale 服务器。

## 快速开始

### 安装 Headscale

 在你的服务器上安装 Headscale，可以通过 Docker 或直接运行二进制文件。

1. **配置 Headscale**
    修改配置文件，设置 DNS、子网路由、ACL 等。
2. **注册设备**
    使用 Tailscale 客户端连接到 Headscale 服务器，注册设备。
3. **管理网络**
    通过 Headscale 的 API 或命令行工具管理用户、设备和网络配置。