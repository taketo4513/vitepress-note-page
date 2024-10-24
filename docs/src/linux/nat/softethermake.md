# SoftEtherVPN源码编译

## 下载源码

前往[SoftEther 下载中心 (opens new window)](http://softether.fishinfo.cn/)下载**源码**

```sh
wget https://github.com/SoftEtherVPN/SoftEtherVPN_Stable/releases/download/v4.39-9772-beta/softether-src-v4.39-9772-beta.tar.gz
```

## 安装编译依赖

### Centos

```sh
# 安装依赖
yum -y groupinstall "Development Tools"
yum -y install readline-devel ncurses-devel openssl-devel

# 解压
tar -zxvf softether-src-v4.39-9772-beta.tar.gz
cd v4.39-9772/
./configure
make
```

### Debian

```sh
# 安装依赖
sudo apt-get install gcc make libssl-dev libreadline-dev zlib1g-dev -y

# 解压
tar -zxvf softether-src-v4.39-9772-beta.tar.gz
cd v4.39-9772/
./configure
make
```

编译成功

```sh
taketo@ubuntu:~/package/v4.39-9772$ ll bin/vpnserver/
total 4436
drwxrwxr-x 2 taketo taketo    4096 Oct  7 14:31 ./
drwxrwxr-x 6 taketo taketo    4096 Oct  7 14:30 ../
-rw------- 1 taketo taketo 2009296 Oct  7 14:31 hamcore.se2
-rwxrwxr-x 1 taketo taketo 2519200 Oct  7 14:31 vpnserver*
```

## 破除拆分隧道限制

Split Tunneling （拆分隧道），是 SoftEtherVPN 中比较强悍的一个功能。具体位置在SecureNAT配置界面就可以找到。

![An image](/img/linux/nat/12.png)

但是对于SoftetherVPN 来说，拆分隧道功能并不适合官方下载的版本，从网上查到的信息，某些地区不可以使用该功能在内的一部分功能(当然仅限于官方下载的编译好的版本，对于自己进行源码编译是不限制的)

![An image](/img/linux/nat/13.png)

下载源码后，解压后在`v4.39-9772/src/Cedar`路径下找到`Server.c`文件修改。

```c
bool SiIsEnterpriseFunctionsRestrictedOnOpenSource(CEDAR *c)
{
        char region[128];
        bool ret = false;
        // Validate arguments
        if (c == NULL)
        {
                return false;
        }


        SiGetCurrentRegion(c, region, sizeof(region));

        if (StrCmpi(region, "JP") == 0 || StrCmpi(region, "CN") == 0)
        {
                ret = true; //将true改为false即可。
        }

        return ret;
}
```

重新编译后即可破除限制。
