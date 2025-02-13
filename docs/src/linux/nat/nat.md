# NAT - 网络地址转换

转载：[[译] NAT - 网络地址转换（2016）](https://arthurchiao.art/blog/nat-zh/)

本文翻译自 2016 年的一篇英文博客 [NAT - Network Address Translation](https://www.karlrupp.net/en/computer/nat_tutorial) 。

## 1 绪论

网络地址转换通常涉及**在 IP 包经过路由器或防火墙的时候，修改其源和/或目的地址**（ [Wikipedia: NAT](http://en.wikipedia.org/wiki/Network_Address_Translation)）。

本文将介绍什么是 NAT、如何使用 NAT 以及在 Linux （或者更广泛地说，各种 Unix 的衍生版） 上如何配置 NAT。 但是，本文不会覆盖 NAT 的所有细节，而主要想让读者知道： 在现代计算机网络中它可以用来做什么，及其不能用来做什么。

接下来首先会查看 IP 包的结构，然后简要地介绍 （Linux）内核的一些功能，然后进入正 题，介绍一种最常见的 NAT 应用场景，即，通过路由器（本例中为一台支持 iptables 的 Linux 机器）将私有子网连接到互联网。

再后面，会介绍几种其他的可能性，例如重定向，或者如何使用代理（proxy）绕过防火 墙。但是，我不能保证这些解决方案是最智能、最强大或者设计最精巧的，读者应该 仅将它们视为展示 NAT 功能的一些示例方案（proof of concept）。

## 2 网络内的数据包

本节只讨论基于 TCP 和 UDP 协议的 IP 包。

IP 包的介绍见 [IPv4 at Wikipedia](http://en.wikipedia.org/wiki/IPv4)。本文将主要 用到其中的两个字段：源 IP 和目的 IP。

TCP 和 UDP 是传输层协议，介绍分别见:

1. [TCP at Wikipedia](http://en.wikipedia.org/wiki/Transmission_Control_Protocol)
2. [UDP at Wikipedia](http://en.wikipedia.org/wiki/User_Datagram_Protocol)

传输层会用到端口号，本文为简单起见，认为每个（网络）进程进行有独立的端口号，例如 ，HTTP 服务运行在 80 端口， SSH 服务运行在 22 端口。

一个 IP 地址加一个传输层端口号定义一个 socket。socket 是唯一的，一个客户端 socket 和一个服务端 socket 定义一个连接（connection），一端发送的数据，另一端就会接收到 。 例如，socket `123.123.123.123:65432` 和 socket `112.112.112.112:80` 建立的一个连 接，可能是 `123.123.123.123` 这台机器上的浏览器正在访问位于 `112.112.112.112` 上 面的 HTTP 服务。

服务端程序一般使用标准的端口号，称为“well known ports”（公认的端口号），见 [well known ports at IANA](http://www.iana.org/assignments/port-numbers) 或[well known ports at Wikipedia](http://en.wikipedia.org/wiki/Well_known_ports)。客户端程序使 用临时端口号，一般从 1023 往上增加，选择一个可用的。

## 3 Linux 和 Netfilter

Linux 内核中有一个数据包过滤框架（packet filter framework），叫做 **netfilter**（ 项目地址 [netfilter.org](https://arthurchiao.art/blog/nat-zh/netfilter.org)）。这个框架使得 Linux 机器可以像路由器一 样工作。接下来我们将使用一个命令行工具 iptables 来创建复杂的规则，用于修改和过滤 数据包。毫无意外，和 NAT 相关的最重要的规则，都在 `nat` 这个（iptables）table 里。这个表有三个预置的 chain：`PREROUTING`, `OUTPUT` 和 `POSTROUTING`。

![An image](/img/linux/nat/21.gif)

`PREROUTING` 和 `POSTROUTING` 是最重要的 chain。如名字所示，`PREROUTING` chain 负 责处理刚刚到达网络接口的数据包，这时还没有做路由判断，因此还不知道这个包是发往本 机（local），还是网络内的其他主机。包经过 `PREROUTING` chain 之后，将进行路由判 断。如果目的是本机，那接下来的过程将不涉及 NAT；如果目的是网络内的其他机器，那包 将会被转发到那台机器，前提是这台机器配置了允许转发。

在转发包离开本机之前，它会经过 `POSTROUTING` chain。对于本机生成的包，这里还有一 点不同：它会先经过 `OUTPUT` chain，然后再经过 `POSTROUTING` chain。

要使用 NAT，我们首先需要配置机器。下面的例子中，`#` 开头的是注释，`$>` 开头的是命 令。

``` sh
# IMPORTANT: Activate IP-forwarding in the kernel!

# Disabled by default!
$> echo "1" > /proc/sys/net/ipv4/ip_forward

# Load various modules. Usually they are already loaded 
# (especially for newer kernels), in that case 
# the following commands are not needed.
 
# Load iptables module:
$> modprobe ip_tables

# activate connection tracking
# (connection's status are taken into account)
$> modprobe ip_conntrack

# Special features for IRC:
$> modprobe ip_conntrack_irc

# Special features for FTP:
$> modprobe ip_conntrack_ftp
```

以上配置应该足够了。如果遇到错误，可能是因为你的内核在编译时没有指定路由相关的选 项，请参考[这里](http://www.comptechdoc.org/os/linux/usersguide/linux_ugipmasq.html)。

## 4 例子：将私有网络通过 NAT 连接到互联网

我们知道了 IP 包的结构，也知道了在 Linux 中如何操控数据包，因此接下来就可以应 用它了。NAT 最广泛的使用场景应该就是：**一个私有子网的所有机器共享一个公网连接**。 接下来我们就从这个例子开始。

### 4.1 类比：地主和租户的信件收发

我们用一个形象的例子做类比，以更容易理解 NAT。

**考虑如下场景：**

有一个地主，他的几个租户，和若干个邮递员。

地主有几个信箱可以收发信件，但租户没有，因此，所有直接寄给租户的信件将被邮递员直 接丢弃。但是，租户可以将他们的信件交给地主，地主会将这些信件送到邮局。那么问题是 ：**租户如何参与收发信件呢？**

一种解决方案是：

地主将不同租户的信件放到他自己不同的信箱，并将信件上**租户的地址**（某种意义上说 是无效地址，因为这个地址的信件会被邮递员直接丢弃）换成**自己的某个信箱的地址** 。因此，回信也会被邮递员放到地主的相应邮箱，地主可以轻松地判断信件属于哪个 租户并转交给他们（转交之前地主会将自己的地址再修改回租户的地址，因此租户不会发现 信件地址被修改过）。这种方式从某种意义上说是最优的，因为它对租户来说完全透明，他 们完全意识不到邮递员是无法处理直接寄给租户的信件的。

### 4.2 从租户问题到计算机世界

NAT 的原理和以上租户问题很相似：

- **租户**对应**本地子网内的 IP 地址**，不同租户（在 NAT 路由器上）由不同端口号（port）区分
- **地主**对应**NAT 路由器**
- **信件接收方**对应**互联网上的任意主机**

一个 socket 是一个 IP 地址加一个 port。

租户的通信过程：

1. 租户将信件放到地主的办公室
2. 地主将**发送地址**（此时为租户地址）改成他自己的某个邮箱地址
3. 地主收到回信时，将接收地址（此时为自己的某个邮箱地址）改成对应租户的地址

本地网络的情形和这个过程很类似：

1. 子网内的所有主机（客户端）通过 socket 将数据包发送到一个 特定路由器（通过将路由器地址设置为所有机器的网关来实现，数据会通过以太网 或其他底层协议传输）
2. 路由器将发送方的 socket 替换为自己的一个（还未使用的）socket
3. 这个 socket 收到的数据，路由器将 socket 地址修改为对应的客户端 socket，并转 发给它

我们假设客户端的网关设置是正确的，那剩下的就是如何配置路由器了。

幸运的是，netfilter 框架会对设置的每条一条（出向或入向）规则，自动设置它的反向规则，因此我们只需要设 置一个方向的规则即可。选择哪个方向来设置规则？通常是选择不确定性小的一个方向。 例如，“替换所有从本地网络发出的数据包的地址”比“如果客户端发送过一些东西给服务端 ，那将服务端发送的数据进行某种方式的修改”要简单的多。

### 4.3 如何设置规则

我们希望实现的是：**从本地网络发出的、目的是公网的包，将发送方地址修改为路由器 的地址。**

接下来假设路由器的本地网络走 `eth0` 端口，到公网的网络走 `eth1` 端口。那么**如 下命令就能完成我们期望的功能**：

``` sh
# Connect a LAN to the internet
$> iptables -t nat -A POSTROUTING -o eth1 -j MASQUERADE
```

解释：

- `iptables` - 配置内核的工具
- `-t nat` - 指定对名为 `nat` 的 iptables table 配置 NAT 规则
- `-A POSTROUTING` - 追加（A: Append）规则到 iptables 的 `POSTROUTING` chain
- `-o eth1` - 指定只对从 `eth1` **发出**的数据包做操作（o: output）
- **`-j MASQUERADE`** - 规则匹配成功后的动作是 **masquerade** （伪装）数据包，例如将源地址修改为路由器地址

另外需要说明的是，（除了客户端过来的包，）路由器自己的包也会涉及以上处理逻辑，因 为它们也经过 `POSTROUTING` chain（见上面的图）。然而，因为路由器为客户端做 socket (IP+Port) 转换的时候，会从它的未使用端口中挑选，因此它自身的包所使用的 port 与做 NAT 的 port 肯定是不同的。因此，虽然它自身的包也会经过以上规则，但并不会被修改。

网络接口可以为任意类型，例如 ISDN 和 SDL 接口也是可以的（通常是 `ppp0` 或者 `ippp0`）。可以通过 `ifconfig` 查看所有（active）的接口：

``` sh
# Display available network interfaces
$> ifconfig
```

### 4.4 NAT 的不足

现在，本地计算机可以访问公网，但反过来，我们看看公网上的机器访问本地机器会是 什么情况。

公网上的机器要和本地机器建立连接的话，它唯一能利用的信息就是用路由器的 IP 地址 加一个端口号。大部分情况下，这个端口都是没有被使用的，因此过来的包会被拒绝。即使 运气比较好，这个端口是路由器做 NAT 的一个端口，包仍然很可能会被拒绝，因为这个端 口已经和公网上的其他主机建立连接了。

**因此，从公网上的机器向本地机器建立连接几乎是不可能的。**

对于常规服务，可以静态地将路由器的端口映射到本地服务，例如，将路由器的 80 端口收到 的包转发到本地机器的 HTTP 服务器。

## 5 近距离查看 iptables

有了以上基础后，我们来详细查看 iptables 的功能。命令帮助：

``` sh
# Abstract structure of an iptables instruction:
iptables [-t table] command [match pattern] [action]
```

对于 NAT，必须要选择 `nat` table。

### 5.1 选择 table

接下来的命令都会选择 `nat` table：

``` sh
# Choosing the nat-table
# (further arguments abbreviated by [...])
iptables -t nat [...]
```

`mangle` 和 `filter` table 和 NAT 无关，因此本文不介绍。因为 **默认的 table 是 `filter` table，因此我们接下来每次都要指定 `-t nat`**。

### 5.2 几个重要命令

最重要的几个命令：

``` sh
# In the following "chain" represents
# one of the chains PREROUTING, OUTPUT and POSTROUTING

# add a rule:
$> iptables -t nat -A chain [...]

# list rules:
$> iptables -t nat -L

# remove user-defined chain with index 'myindex':
$> iptables -t nat -D chain myindex

# Remove all rules in chain 'chain':
$> iptables -t nat -F chain
```

完整 iptables 命令可以查看 man page：

``` sh
# manual pages of iptables
$> man iptables
```

按 `q` 退出帮助。

### 5.3 选择匹配模式（pattern）

要对特定包进行处理需要指定匹配模式。如下是几个重要的例子，完整模式信息请参阅 iptables man page。

``` sh
# actions to be taken on matched packets
# will be abbreviated by '[...]'.
# Depending on the match pattern the appropriate chain is selected.

# TCP packets from 192.168.1.2:
$> iptables -t nat -A POSTROUTING -p tcp -s 192.168.1.2 [...]

# UDP packets to 192.168.1.2:
$> iptables -t nat -A POSTROUTING -p udp -d 192.168.1.2 [...]

# all packets from 192.168.x.x arriving at eth0:
$> iptables -t nat -A PREROUTING -s 192.168.0.0/16 -i eth0 [...]

# all packets except TCP packets and except packets from 192.168.1.2:
$> iptables -t nat -A PREROUTING -p ! tcp -s ! 192.168.1.2 [...]

# packets leaving at eth1:
$> iptables -t nat -A POSTROUTING -o eth1 [...]

# TCP packets from 192.168.1.2, port 12345 to 12356
# to 123.123.123.123, Port 22
# (a backslash indicates contination at the next line)
$> iptables -t nat -A POSTROUTING -p tcp -s 192.168.1.2 \
   --sport 12345:12356 -d 123.123.123.123 --dport 22 [...]
```

大部分选项都有长短两种格式，例如 `--source` 和 `-s`，长格式写起来麻烦，但更易 阅读。

### 5.4 匹配后的动作

至此，我们已经可以指定匹配模式来过滤包了，接下来就是选择合适的动作。对于 `nat` table，有如下几种动作：`SNAT`, `MASQUERADE`, `DNAT`, `REDIRECT`，都需要通过 `-j` 指定。它们的格式如下（表示的意思将在下一节介绍）：

``` sh
# In the following the table selection, the command and the match pattern
# will be abbreviated using [...]

# Source-NAT: Change sender to 123.123.123.123
$> iptables [...] -j SNAT --to-source 123.123.123.123

# Mask: Change sender to outgoing network interface
$> iptables [...] -j MASQUERADE

# Destination-NAT: Change receipient to 123.123.123.123, port 22
$> iptables [...] -j DNAT --to-destination 123.123.123.123:22

# Redirect to local port 8080
$> iptables [...] -j REDIRECT --to-ports 8080
```

## 6 几种 iptables 动作

详细解释一下四种动作。

### 6.1 SNAT - 修改源 IP 为固定新 IP （静态）

前面的将本地私有网络连接到公网的例子中，我们已经使用了 Source NAT（SNAT ）。如名字所暗示，发送方的地址会被静态地修改。

在例子中我们选择 `MASQUERADE` 的原因在于：**对于 SNAT，必须显式指定转换后的 IP**。 如果路由器配置的是静态 IP 地址，那 SNAT 是最合适的选择，因为它比 `MASQUERADE` 更 快，后者对每个包都需要检查指定的输出端口上配置的 IP 地址。

**因为 SNAT 只对离开路由器的包有意义，因此它只用在 `POSTROUTING` chain 中。**

``` sh
# Options for SNAT (abstract of manual page)
--to-source <ipaddr>[-<ipaddr>][:port-port]
```

### 6.2 MASQUERADE - 修改源 IP 为动态新 IP（动态获取网络接口 IP）

和 `SNAT` 类似，但是对每个包都会动态获取指定输出接口（网卡）的 IP，因此如果接口 的 IP 地址发送了变化，`MASQUERADE` 规则不受影响，可以正常工作；而对于 `SNAT` 就必须重新调整规则。

和 `SNAT` 一样，`MASQUERADE` 只对 `POSTROUTING` chain 有意义。但和 `SNAT` 不同， `MASQUERADE` 不支持更详细的配置项了。

### 6.3 DNAT - 修改目的 IP

如果想修改包的目的 IP 地址，那需要使用 Destination NAT（DNAT）。

DNAT 可以用于运行在防火墙后面的服务器。

显然，接收端修改**必须在做路由决策之前，因此 DNAT 适用于 `PREROUTING` 和 `OUTPUT` （本地生成的包）chain**。

``` sh
# Options for DNAT (abstract of manual page)
--to-destination <ipaddr>[-<ipaddr>][:port-port] 
```

### 6.4 REDIRECT - 将包重定向到本机另一个端口

REDIRECT 是 DNAT 的一个特殊场景。包被重定向到路由器的另一个本地端口，可以实现， 例如透明代理的功能。和 DNAT 一样，REDIRECT 适用于 `PREROUTING` 和 `OUTPUT` chain 。

``` sh
# Options for REDIRECT (abstract of manual page)
--to-ports <port>[-<port>] 
```

## 7 NAT 应用 (Applications)

本文第一个例子（将本地网络连接到公网）的晦涩（cryptic）指令可能让你有些困惑。 之后我们陆续给了一些命令参数的解释，读者应该比之前理解更清楚了一些。问题可能从“ 人们怎么写出这么晦涩的指令的” 变成了 “好的，我该如何使用这些晦涩的指令呢？”本章 将给出一些如何使用 NAT 的例子。应用范围并没有限制，但我将尽力涵盖最常见的一些场 景。

### 7.1 透明代理

假设我们有一个本地网络，通过 NAT 连接到公网。我们需要在路由器的 8080 端口运行 一个 HTTP 代理，处理本地网络 HTTP 流量。

首先想到的解决方案是：让每个用户设置他们的浏览器使用代理服务器，然后禁止所有 80 端口的出流量。对于很小的网络，这种方式可能让人满意，但无法扩展到很大的网络，因为 这种方式需要对每个客户端进行配置。（也失去了“透明代理”的意义）。

![An image](/img/linux/nat/22.gif)

使用 NAT，我们有另一种可能：所有从 80 端口进来的流量，重定向到 8080 端口。相应 的命令：

``` sh
# Transparent proxying:
# (local net at eth0, proxy server at port 8080)
$> iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 \
   -j REDIRECT --to-ports 8080 
```

当然，8080 端口要有 HTTP 代理运行。另外，你的服务器可能做一些特殊配置（甚至特殊 编译）才能支持透明代理。

透明代理的缺点是 CPU load 会升高（尤其是大型网络），对太新或太旧的浏览器可能有兼 容性问题。

### 7.2 绕过防火墙

在继续本文之前，我首先要发出警告：

**每位读者在使用以下提供的技术之前，都需要确认这些步骤是否会破坏你们的现有环境！ 使用如下命令带来的风险是读者自己的，对不当使用以下命令和技术带来的损坏，我不负 任何责任！**

你可能意想不到，NAT 在这种场景下可以派上用场。

我们假设路由器只有少量端口可以被本地网络访问。

首先要找到这些已经被打开的（open）端口。一个的常用工具是 [nmap](http://insecure.org/nmap/)（请只扫描你自己的机器，扫描未知的机器会被认为 是入侵行为的前奏）。

``` sh
# Scan a machine:
# (Replace www.example.com by an appropriate machine)
$> nmap www.example.com
```

以上命令会扫描出很多端口，其中大部分处于 “closed” 状态（该端口上没有服务），另 外有一部分处于 “filtered” 状态（该端口上没有连接），可能有一些处于 “open” 状态（ 服务正在该端口上运行）。我们假设 5000 以下的端口除了 80 都处于 closed 状态，但是 5000 以上的端口有 可达的。

为了实现可以连接任意外网机器的 5000 以下的任意端口，需要一个位于防火墙之前的机器 （称为跳板机，位置没有关系，只要网络可达，并且它自己没有被防火墙限制），它要能被 访问，并且支持 NAT （iptables）。假设这台机器 IP 为 `111.111.111.111`。

#### 7.2.1 配置内网机器可以 SSH 到跳板机

首先需要 SSH 登录到 `111.111.111.111`（由于防火墙限制 5000 以下端口，SSH 端口默 认是 22，因此需要在防火墙外面找机器才能登录）。然后在 `111.111.111.111` 上执行：

``` sh
# Redirect SSH from port 5000 to port 22:
$> iptables -t nat -A PREROUTING -p tcp --dport 5000 -j REDIRECT --to-ports 22
```

这个命令做的事情就是，将 5000 端口 进来的流量重定向到本机的 22 端口（SSH）。

然后，我们在防火墙内的机器上，就可以通过 5000 端口用 SSH 访问工作站了，工作站会 将请求转向 `111.111.111.111` 的 `22` 端口。

或者，你也可以配置 `111.111.111.111` 的 SSH 进程直接运行在 5000 端口，这样就不需 要以上 iptables 规则了。

#### 7.2.2 通过跳板机从内网连接到公网举例：邮件服务器 POP3

现在，你可以在跳板机 `111.111.111.111` 上配置连接其他机器或服务（运行在其他端口 ）的 NAT 规则来。

例如，通过跳板机的 5001 端口连接机器 `123.123.123.123` 的 110 （POP3）端口，执行：

``` sh
# redirect port 5001 to port 110 (POP3) at 123.123.123.123:
$> iptables -t nat -A PREROUTING -p tcp --dport 5001 \
   -j DNAT --to-destination 123.123.123.123:110
   
# Change sender to redirecting machine:
$> iptables -t nat -A POSTROUTING -p tcp --dport 110 \
   -j MASQUERADE
```

![An image](/img/linux/nat/23.gif)

这里用的是 `MASQUERADE`，但用 `SNAT` 也是可以的（`-j SNAT --to-source 111.111.111.111`）。

用同样的方式，我们可以（从内网）连接到（外网机器的）其他端口，只要跳板机上的可用 端口足够多。即使是安全连接（例如 IMAPS）也可以这样操作，但需要忽略安全证书的警告 （只要我们知道自己在做什么）。对于上面的 POP3 例子，你还需要配置你的邮件客户端， 将服务器地址设置为 `111.111.111.111`，端口为 `5001`。

#### 7.2.3 通过跳板机绕过 HTTP 监控

假设网络供应商为 80 端口的所有连接设置了代理（例如，透明代理），然后监控所有的网络 流量（内容），我们使用 NAT 可以绕过它。

和上面类似，在跳板机上寻找一个可用端口，例如 5002，做透明代理。

然后，在你自己的（内网）机器上，执行：

``` sh
# redirect http-Traffic going to Port 80 to 111.111.111.111:5002:
$> iptables -t nat -A OUTPUT -p tcp --dport 80 \
   -j DNAT --to-destination 111.111.111.111:5002
```

这样就成功绕过了供应商的代理（我们使用透明代理绕过了供应商的透明代理！）。

或者，不需要 iptables 规则，你可以设置浏览器的默认端口是 5002，但是这可能有一些 潜在的问题。

总结本节的透明代理方案步骤：

1. 首先找到找到一个可用端口，可以让内网机器和跳板机建立 SSH 连接
2. 静态地将可用端口重定向到期望的地址（大部分情况下都是 HTTP 服务）

如果想实现动态重定向，那两个 TCP 端口（其中一个用于 SSH）和一个 UDP 端口足够了， 据此可以实现从内网机器连接到任意外网机器的任意端口，唯一的不足是每次只能有一个连 接（每种协议）。

### 7.3 通过 NAT 从外网访问内网服务

运行在 NAT 路由器后面的内网服务器，默认是不能被外部网络直接访问的。例如，假设我 们有一个 HTTP 服务运行在内网机器 `192.168.1.2`，NAT 路由器的地址是 `192.168.1.1` ，并通过另一张有公网 IP `123.123.123.123` 的网卡连接到了外部网络。

要使得外网机器可以访问 `192.168.1.2` 的服务，需要执行：

``` sh
# redirect http traffic to 192.168.1.2:
$> iptables -t nat -A PREROUTING -p tcp -i eth1 --dport 80 -j DNAT --to 192.168.1.2
```

然后，就可以通过公网 IP `123.123.123.123` 的 80 端口访问 `192.168.1.2` 的 HTTP 服务了。

## 8 相关文章

类似的文章：

1. [非常详细的关于 iptables 的文章](http://iptables-tutorial.frozentux.net/iptables-tutorial.html)
2. [关于透明代理更深入的介绍](http://www.faqs.org/docs/Linux-mini/TransparentProxy.html)
3. [netfilter extension 来实现更多的功能](http://www.barryodonovan.com/publications/lg/108/)
