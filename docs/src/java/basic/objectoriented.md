# 面向对象

Java语言是一种面向对象的程序设计语言，而面向对象思想是一种程序设计思想，我们在面向对象思想的指引下， 使用Java语言去设计、开发计算机程序。 这里的**对象**泛指现实中一切事物，每种事物都具备自己的**属性**和**行为**。

面向对象的语言中，包含了三大基本特征，即**封装、继承和多态**。

## 什么是面向过程？

概述：自顶而下的编程模式

- 把问题分解成一个一个步骤， 每个步骤用函数实现， 依次调用即可。
- 最典型的用法就是实现一个简单的算法， 比如实现冒泡排序。

面向过程： 占用资源相对`低`,速度相对`快`。

## 什么是面向对象？

概述：将事务高度抽象化的编程模式

将问题分解成一个一个步骤， 对每个步骤进行相应的抽象， 形成对象， 通过不同对象之间的调用， 组合解决问题。

面向对象： 占用资源相对`高`,速度相对`慢`。

## 类和对象

### 什么是类

`类`是一组相关**属性**和**行为**的集合。可以看成是一类事物的模板，使用事物的属性特征和行为特征来描述该`类`事物。

### 什么是对象

`对象`是一类事物的具体体现。对象是类的一个**实例**，必然具备该类事物的属性和行为。

### 类与对象的关系

- 类是对一类事物的描述，是**抽象的**。
- 对象是一类事物的实例，是**具体的**。
- **类是对象的模板，对象是类的实体**。

### 类的定义

#### 事物与类的对比

现实世界的一类事物： **属性**：事物的状态信息。 **行为**：事物能够做什么。

Java中用class描述事物也是如此： **成员变量**：对应事物的**属性**。**成员方法**：对应事物的**行为**

```java
public class ClassName {
    //成员变量 
    //成员方法 
}
```

- **定义类**：就是定义类的成员，包括**成员变量**和**成员方法**。
- **成员变量**：和变量几乎是一样的。只不过位置发生了改变。**在类中，方法外**。
- **成员方法**：和定义方法几乎是一样的。

#### 成员变量的默认值

|          | 数据类型                       | 默认值 |
| -------- | ------------------------------ | ------ |
| 基本类型 | 整数（byte、short、int、long） | 0      |
|          | 浮点数（float、double）        | 0.0    |
|          | 字符（char）                   | \u0000 |
|          | 布尔（boolean）                | false  |
| 引用类型 | 数组、类、接口                 | null   |

#### 成员变量和局部变量区别

变量根据定义**位置的不同**，我们给变量起了不同的名字。

- 在类中的位置不同

  - 成员变量：类中，方法外

  - 局部变量：方法中或者方法声明上(形式参数)

- 作用范围不一样

  - 成员变量：类中

  - 局部变量：方法中

- 初始化值的不同

  - 成员变量：有默认值

  - 局部变量：没有默认值。必须先定义，赋值，最后使用

- 在内存中的位置不同

  - 成员变量：堆内存

  - 局部变量：栈内存

- 生命周期不同

  - 成员变量：随着对象的创建而存在，随着对象的消失而消失

  - 局部变量：随着方法的调用而存在，随着方法的调用完毕而消失