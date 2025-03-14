# 常量和变量

## 常量

常量使用关键字 `const` 定义，用于存储不会改变的数据。

存储在常量中的数据类型只可以是布尔型、数字型（整数型、浮点型和复数）和字符串型。

常量的定义格式：`const identifier [type] = value`，例如：

```go
const Pi = 3.14159
```

在 Go 语言中，你可以省略类型说明符 `[type]`，因为编译器可以根据变量的值来推断其类型。

- 显式类型定义： `const b string = "abc"`
- 隐式类型定义： `const b = "abc"`

一个没有指定类型的常量被使用时，会根据其使用环境而推断出它所需要具备的类型。

反斜杠 `\` 可以在常量表达式中作为多行的连接符使用。

常量还可以用作枚举：

```go
const (
 Unknown = 0
 Female = 1
 Male = 2
)
```

现在，数字 `0`、`1` 和 `2` 分别代表未知性别、女性和男性。这些枚举值可以用于测试某个变量或常量的实际值，比如使用 switch/case 结构

## 变量

声明变量的一般形式是使用 `var` 关键字：`var identifier type`。

::: tip

需要注意的是，Go 和许多编程语言不同，它在声明变量时将变量的类型放在变量的名称之后。Go 为什么要选择这么做呢？

首先，它是为了避免像 C 语言中那样含糊不清的声明形式，例如：`int* a, b;`。在这个例子中，只有 `a` 是指针而 `b` 不是。如果你想要这两个变量都是指针，则需要将它们分开书写。
:::
而在 Go 中，则可以很轻松地将它们都声明为指针类型：

```go
var a, b *int
```

其次，这种语法能够按照从左至右的顺序阅读，使得代码更加容易理解。

示例：

```go
var a int
var b bool
var str string
```

你也可以改写成这种形式：

```go
var (
 a int
 b bool
 str string
)
```

这种因式分解关键字的写法一般用于声明全局变量。

当一个变量被声明之后，系统自动赋予它该类型的零值：`int` 为 `0`，`float32(64)` 为 `0.0`，bool 为 `false`，`string` 为空字符串，指针为 `nil`。记住，所有的内存在 Go 中都是经过初始化的。

变量的命名规则遵循骆驼命名法，即首个单词小写，每个新单词的首字母大写，例如：`numShips` 和 `startDate`。

但如果你的全局变量希望能够被外部包所使用，则需要将首个单词的首字母也大写。

一个变量（常量、类型或函数）在程序中都有一定的作用范围，称之为作用域。

如果一个变量在函数体外声明，则被认为是**全局变量**，可以在整个包甚至外部包（被导出后）使用，不管你声明在哪个源文件里或在哪个源文件里调用该变量。

在函数体内声明的变量称之为**局部变量**，它们的作用域只在函数体内，参数和返回值变量也是局部变量。

声明与赋值（初始化）语句也可以组合起来。一般情况下，当变量之间类型相同时，才能进行如 `=` 的赋值。

示例：

```go
var identifier [type] = value
var a int = 15
var b bool = false
var str string = "Go says hello to the world!"
```

但是 Go 编译器的智商已经高到可以根据变量的值来**自动推断其类型**，这有点像 Ruby 和 Python 这类动态语言，只不过它们是在运行时进行推断，而 Go 是在编译时就已经完成推断过程。因此，你还可以使用下面的这些形式来声明及初始化变量：

```go
var a = 15
var b = false
var str = "Go says hello to the world!"
```

不过自动推断类型并不是任何时候都适用的，当你想要给变量的类型并不是自动推断出的某种类型时，你还是需要显式指定变量的类型。

### 值类型

值类型在赋值或作为函数参数传递时，会进行一次拷贝操作。这意味着在函数内部对值类型的修改不会影响到原始变量。以下是一些常见的值类型：

- 基本类型：如`int`、`float32`、`bool`、`string`等。
- 结构体（struct）：自定义的数据类型，由多个基本类型或其它结构体组成。
- 数组（array）：具有固定长度的同类型元素的数据结构。

### 引用类型

引用类型在赋值或作为函数参数传递时，不会进行拷贝操作，而是传递引用（即内存地址）到函数内部。因此，在函数内部对引用类型的修改会影响到原始变量。以下是一些常见的引用类型：

- 指针（pointer）：指向内存地址的变量。
- 切片（slice）：切片是一个引用类型，它包含指向底层数组的指针、切片的长度和容量。
- 字典（map）：字典是一个引用类型，它包含指向底层哈希表的指针。
- 通道（channel）：用于在goroutine之间进行通信的特殊类型。

需要注意的是，Go语言中的`interface`（接口）也被视为引用类型，因为接口定义了一个方法集合，而不是具体的值。

## 初始化声明

我们知道可以在变量的初始化时省略变量的类型而由系统自动推断，而这个时候再在写上 `var` 关键字就显得有些多余了，因此我们可以将它们简写为 `a := 50` 或 `b := false`。

`a` 和 `b` 的类型（`int` 和 `bool`）将由编译器自动推断。

这是使用变量的首选形式，但是它只能被用在函数体内，而不可以用于全局变量的声明与赋值。使用操作符 `:=` 可以高效地创建一个新的变量，称之为初始化声明。

::: warning

如果在相同的代码块中，我们不可以再次对于相同名称的变量使用初始化声明，例如：`a := 20` 就是不被允许的，编译器会提示错误 `no new variables on left side of :=`，但是 `a = 20` 是可以的，因为这是给相同的变量赋予一个新的值。

局部变量声明后必须使用，否则会报错`declared and not used`。全局变量是允许声明但不使用。

:::
