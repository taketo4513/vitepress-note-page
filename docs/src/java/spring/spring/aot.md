# 提前编译

## AOT

**IT与AOT的区别：**

JIT和AOT 这个名词是指两种不同的编译方式，这两种编译方式的主要区别在于是否在“运行时”进行编译

JIT， Just-in-time，动态(即时)编译，边运行边编译。

在程序运行时，根据算法计算出热点代码，然后进行 JIT 实时编译，这种方式吞吐量高，有运行时性能加成，可以跑得更快，并可以做到动态生成代码等，但是相对启动速度较慢，并需要一定时间和调用频率才能触发 JIT 的分层机制。JIT 缺点就是编译需要占用运行时资源，会导致进程卡顿。

AOT，Ahead Of Time，指运行前编译，预先编译。

AOT 编译能直接将源代码转化为机器码，内存占用低，启动速度快，可以无需 runtime 运行，直接将 runtime 静态链接至最终的程序中，但是无运行时性能加成，不能根据程序运行情况做进一步的优化，AOT 缺点就是在程序运行前编译会使程序安装的时间增加。

简单来讲：JIT即时编译指的是在程序的运行过程中，将字节码转换为可在硬件上直接运行的机器码，并部署至托管环境中的过程。而 AOT 编译指的则是，在程序运行之前，便将字节码转换为机器码的过程。

```tex
.java -> .class -> (使用jaotc编译工具) -> .so（程序函数库,即编译好的可以供其他程序使用的代码和数据）
```

![An image](/img/java/spring/spring/15.png)

**AOT的优点：**

简单来讲，Java 虚拟机加载已经预编译成二进制库，可以直接执行。不必等待及时编译器的预热，减少 Java 应用给人带来“第一次运行慢” 的不良体验。

- 在程序运行前编译，可以避免在运行时的编译性能消耗和内存消耗
- 可以在程序运行初期就达到最高性能，程序启动速度快
- 运行产物只有机器码，打包体积小

**AOT的缺点：**

由于是静态提前编译，不能根据硬件情况或程序运行情况择优选择机器指令序列，理论峰值性能不如JIT。

没有动态能力，同一份产物不能跨平台运行。

第一种即时编译 (JIT) 是默认模式，Java Hotspot 虚拟机使用它在运行时将字节码转换为机器码。后者提前编译 (AOT)由新颖的 GraalVM 编译器支持，并允许在构建时将字节码直接静态编译为机器码。

现在正处于云原生，降本增效的时代，Java 相比于 Go、Rust 等其他编程语言非常大的弊端就是启动编译和启动进程非常慢，这对于根据实时计算资源，弹性扩缩容的云原生技术相冲突，Spring6 借助 AOT 技术在运行时内存占用低，启动速度快，逐渐的来满足 Java 在云原生时代的需求，对于大规模使用 Java 应用的商业公司可以考虑尽早调研使用 JDK17，通过云原生技术为公司实现降本增效。

## Graalvm

Spring6 支持的 AOT 技术，这个 GraalVM  就是底层的支持，Spring 也对 GraalVM 本机映像提供了一流的支持。GraalVM 是一种高性能 JDK，旨在加速用 Java 和其他 JVM 语言编写的应用程序的执行，同时还为 JavaScript、Python 和许多其他流行语言提供运行时。 GraalVM 提供两种运行 Java 应用程序的方法：在 HotSpot JVM 上使用 Graal 即时 (JIT) 编译器或作为提前 (AOT) 编译的本机可执行文件。 GraalVM 的多语言能力使得在单个应用程序中混合多种编程语言成为可能，同时消除了外语调用成本。GraalVM 向 HotSpot Java 虚拟机添加了一个用 Java 编写的高级即时 (JIT) 优化编译器。

GraalVM 具有以下特性：

1. 一种高级优化编译器，它生成更快、更精简的代码，需要更少的计算资源
2. AOT 本机图像编译提前将 Java 应用程序编译为本机二进制文件，立即启动，无需预热即可实现最高性能
3. Polyglot 编程在单个应用程序中利用流行语言的最佳功能和库，无需额外开销
4. 高级工具在 Java 和多种语言中调试、监视、分析和优化资源消耗

总的来说对云原生的要求不算高短期内可以继续使用 2.7.X 的版本和 JDK8，不过 Spring 官方已经对 Spring6 进行了正式版发布。

## Native Image

目前业界除了这种在JVM中进行AOT的方案，还有另外一种实现Java AOT的思路，那就是直接摒弃JVM，和C/C++一样通过编译器直接将代码编译成机器代码，然后运行。这无疑是一种直接颠覆Java语言设计的思路，那就是GraalVM Native Image。

它通过C语言实现了一个超微缩的运行时组件 —— Substrate VM，基本实现了JVM的各种特性，但足够轻量、可以被轻松内嵌，这就让Java语言和工程摆脱JVM的限制，能够真正意义上实现和C/C++一样的AOT编译。这一方案在经过长时间的优化和积累后，已经拥有非常不错的效果，基本上成为Oracle官方首推的Java AOT解决方案。

Native Image 是一项创新技术，可将 Java 代码编译成独立的本机可执行文件或本机共享库。在构建本机可执行文件期间处理的 Java 字节码包括所有应用程序类、依赖项、第三方依赖库和任何所需的 JDK 类。生成的自包含本机可执行文件特定于不需要 JVM 的每个单独的操作系统和机器体系结构。

## 使用Native Image构建

### GraalVM安装

官网：[graalvm.org](https://www.graalvm.org/downloads/)

下载GraalVM

```sh
wget https://download.oracle.com/graalvm/17/latest/graalvm-jdk-17_linux-x64_bin.tar.gz

# 解压
tar -zxvf graalvm-jdk-17_linux-x64_bin.tar.gz

mv graalvm-jdk-17.0.9+11.1/ /usr/local/graalvm
```

配置环境变量

```sh
export JAVA_HOME=/usr/local/graalvm
export PATH=$PATH:$JAVA_HOME/bin
```

查看已安装列表

```sh
# 查看已安装列表
gu list

# resp
ComponentId              Version             Component name                Stability                     Origin 
---------------------------------------------------------------------------------------------------------------------------------
graalvm                  23.0.2              GraalVM Core                  Supported                     
native-image             23.0.2              Native Image                  Early adopter        
```

>安装包中自带`native-image`插件，若没有，使用 `gu install native-image` 安装

### 安装依赖

```sh
sudo apt update && sudo apt install gcc && sudo apt install zlib1g-dev
```

### 构建Native Image

编写Java代码

```java
public class Hello {

    public static void main(String[] args) {
        System.out.println("hello world");
    }
}
```

编译代码

```sh
javac Hello.java
```

Native Image 进行构建

```sh
native-image Hello
```

> 构建`jar`包：`native-image -jar [jar包全路径] [编译后的文件名称]`

构建成功

```sh
zhangp@MiWiFi-R3-srv:~/graalvm$ ls -alh
drwxr-xr-x  2 zhangp zhangp 4.0K Jan  2 17:54 .
drwx------ 14 zhangp zhangp 4.0K Jan  2 17:41 ..
-rwxr-xr-x  1 zhangp zhangp 6.5M Jan  2 17:54 hello
-rw-r--r--  1 zhangp zhangp  415 Jan  2 17:44 Hello.class
-rw-r--r--  1 zhangp zhangp  118 Jan  2 17:41 Hello.java
```

### 编译后结果对比

```sh
-rwxr-xr-x 1 zhangp zhangp 7.6M Jan  2 18:00 test-bed-server
-rw-r--r-- 1 zhangp zhangp  44M Dec  8 17:40 test-bed-server-1.0.jar
```

可以看到这个test-bed-server最终打包产出的二进制文件大小为7.6M，这是包含了SVM和JDK各种库后的大小，虽然相比C/C++的二进制文件来说体积偏大，但是对比完整JVM来说，可以说是已经是非常小了。

相比于使用JVM运行，Native Image的速度要快上不少，cpu占用也更低一些，从官方提供的各类实验数据也可以看出Native Image对于启动速度和内存占用带来的提升是非常显著的：

启动时间

![An image](/img/java/spring/spring/16.png)

内存占用

![An image](/img/java/spring/spring/17.png)
