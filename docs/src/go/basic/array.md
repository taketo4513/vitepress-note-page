# 数组

## 概念

数组是具有相同 **唯一类型** 的一组已编号且长度固定的数据项序列（这是一种同构的数据结构）；这种类型可以是任意的原始类型例如整型、字符串或者自定义类型。数组长度必须是一个常量表达式，并且必须是一个非负整数。数组长度也是数组类型的一部分，所以 `[5]int` 和 `[10]int` 是属于不同类型的。数组的编译时值初始化是按照数组顺序完成的（如下）。

如果我们想让数组元素类型为任意类型的话可以使用空接口作为类型。当使用值时我们必须先做一个类型判断。

数组元素可以通过 **索引**（位置）来读取（或者修改），索引从 `0` 开始，第一个元素索引为 `0`，第二个索引为 `1`，以此类推（数组以 0 开始在所有类 C 语言中是相似的）。元素的数目（也称为长度或者数组大小）必须是固定的并且在声明该数组时就给出（编译时需要知道数组长度以便分配内存）；数组长度最大为 2GB。

声明的格式是：

```go
var identifier [len]type
```

例如：

```go
var arr1 [5]int
```

在内存中的结构是：

![An image](/img/go/base/03.png)

每个元素是一个整型值，当声明数组时所有的元素都会被自动初始化为默认值 0。

`arr1` 的长度是 5，索引范围从 `0` 到 `len(arr1)-1`。

第一个元素是 `arr1[0]`，第三个元素是 `arr1[2]`；总体来说索引 `i` 代表的元素是 `arr1[i]`，最后一个元素是 `arr1[len(arr1)-1]`。

对索引项为 `i` 的数组元素赋值可以这么操作：`arr[i] = value`，所以数组是 **可变的**。

只有有效的索引可以被使用，当使用等于或者大于 `len(arr1)` 的索引时：如果编译器可以检测到，会给出索引超限的提示信息；如果检测不到的话编译会通过而运行时会 `panic()`

```go
runtime error: index out of range
```

由于索引的存在，遍历数组的方法自然就是使用 `for` 结构：

```go
package main
import "fmt"

func main() {
 var arr1 [5]int

 for i:=0; i < len(arr1); i++ {
  arr1[i] = i * 2
 }

 for i:=0; i < len(arr1); i++ {
  fmt.Printf("Array at index %d is %d\n", i, arr1[i])
 }
}

// 输出
Array at index 0 is 0
Array at index 1 is 2
Array at index 2 is 4
Array at index 3 is 6
Array at index 4 is 8
```

> `for` 循环中的条件非常重要：`i < len(arr1)`，如果写成 `i <= len(arr1)` 的话会产生越界错误。

也可以使用 for-range 的遍历方式

```go
for i,_:= range arr1 {
...
}
```

在这里 `i` 也是数组的索引。当然这两种 `for` 结构对于切片（`slices`）来说也同样适用。

## 数组常量

如果数组值已经提前知道了，那么可以通过 **数组常量** 的方法来初始化数组，而不用依次使用 `[]=` 方法（所有的组成元素都有相同的常量语法）。

```go
package main

import "fmt"

func main() {
 // var arrAge = [5]int{18, 20, 15, 22, 16}
 // var arrLazy = [...]int{5, 6, 7, 8, 22}
 // var arrLazy = []int{5, 6, 7, 8, 22} //注：初始化得到的实际上是切片slice
 var arrKeyValue = [5]string{3: "Chris", 4: "Ron"}
 // var arrKeyValue = []string{3: "Chris", 4: "Ron"} //注：初始化得到的实际上是切片slice

 for i := 0; i < len(arrKeyValue); i++ {
  fmt.Printf("Person at %d is %s\n", i, arrKeyValue[i])
 }
}
```

第一种变化：

```go
var arrAge = [5]int{18, 20, 15, 22, 16}
```

> `[5]int` 可以从左边起开始忽略：`[10]int {1, 2, 3}` :这是一个有 10 个元素的数组，除了前三个元素外其他元素都为 `0`。

第二种变化：

```go
var arrLazy = [...]int{5, 6, 7, 8, 22}
```

> `...` 同样可以忽略，从技术上说它们其实变成了切片。

第三种变化：`key: value 语法`

```go
var arrKeyValue = [5]string{3: "Chris", 4: "Ron"}

// 输出
Person at 0 is
Person at 1 is
Person at 2 is
Person at 3 is Chris
Person at 4 is Ron
```

>只有索引 3 和 4 被赋予实际的值，其他元素都被设置为空的字符串

你可以取任意数组常量的地址来作为指向新实例的指针。

```go
package main

import "fmt"

func fp(a *[3]int) {
 fmt.Println(a)
}

func main() {
 for i := 0; i < 3; i++ {
  fp(&[3]int{i, i * i, i * i * i})
 }
}

// 输出
&[0 0 0]
&[1 1 1]
&[2 4 8]
```

几何点（或者数学向量）是一个使用数组的经典例子。

在Go语言中，`type`关键字用于定义新的类型别名。

通过使用`type`，您可以为现有的类型定义一个新的名称，以便在代码中更方便地使用。

```go
package main

import "fmt"

type Vector3D [3]float32

func main() {
 vec1 := Vector3D{1.0, 2.0, 3.0}
 vec2 := Vector3D{4.0, 5.0, 6.0}

 dotProduct := dot(vec1, vec2)
 fmt.Println("Dot product:", dotProduct)
}

func dot(a, b Vector3D) float32 {
 return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
}

// 输出
Dot product: 32
```

## 多维数组

数组通常是一维的，但是可以用来组装成多维数组，例如：`[3][5]int`，`[2][2][2]float64`。

内部数组总是长度相同的。Go 语言的多维数组是矩形式的（唯一的例外是切片的数组）

```go
package main

const (
 WIDTH  = 1920
 HEIGHT = 1080
)

type pixel int

var screen [WIDTH][HEIGHT]pixel

func main() {
 for y := 0; y < HEIGHT; y++ {
  for x := 0; x < WIDTH; x++ {
   screen[x][y] = 0
  }
 }
}
```

## 将数组传递给函数

把一个大数组传递给函数会消耗很多内存。有两种方法可以避免这种情况：

- 传递数组的指针
- 使用数组的切片

接下来的例子阐明了第一种方法：

```go
package main

import "fmt"

func main() {
 array := [3]float64{7.0, 8.5, 9.1}
 x := Sum(&array) // Note the explicit address-of operator
 // to pass a pointer to the array
 fmt.Printf("The sum of the array is: %f", x)
}

func Sum(a *[3]float64) (sum float64) {
 for _, v := range a { // derefencing *a to get back to the array is not necessary!
  sum += v
 }
 return
}

// 输出
The sum of the array is: 24.600000
```

>但这在 Go 中并不常用，通常使用切片
