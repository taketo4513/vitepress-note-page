# String

## 概述

`java.lang.String`类代表字符串。Java程序中所有的字符串文字（例如 "abc" ）都可以被看作是实现此类的实例。

String 被声明为 final，因此它不可被继承。（Integer 等包装类也不能被继承）

在 Java 8 中，String 内部使用 char 数组存储数据。

```java
public final class String
    implements java.io.Serializable, Comparable<String>, CharSequence {
    /** The value is used for character storage. */
    private final char value[];
}
```

在 Java 9 之后，String 类的实现改用 byte 数组存储字符串，同时使用 coder 来标识使用了哪种编码。

```java
public final class String implements java.io.Serializable, Comparable<String>, CharSequence {
    /** The value is used for character storage. */
    private final byte[] value;
    /** The identifier of the encoding used to encode the bytes in {@code
    value}. */
    private final byte coder; 
}
```

value 数组被声明为 final，这意味着 value 数组初始化之后就不能再引用其它数组。并且 String 内部没有改变 value 数组的方法，因此可以保证 String 不可变。

## 使用

- public String() ：初始化新创建的String对象，以使其表示空字符序列。
- public String(char[] value) ：通过当前参数中的字符数组来构造新的String。
- public String(byte[] bytes) ：通过使用平台的默认字符集解码当前参数中的字节数组来构造新的String。

```java
// 无参构造 
String str = new String(); 

// 通过字符数组构造 
char chars[] = {'a', 'b', 'c'};
String str2 = new String(chars); 

// 通过字节数组构造 
byte bytes[] = { 97, 98, 99 };
String str3 = new String(bytes);
```

## 特点

字符串不变：字符串的值**在创建后不能被更改**。

### 不可变的好处

1. 可以缓存 **hash** 值

   因为 String 的 hash 值经常被使用，例如 String 用做 HashMap 的 key。不可变的特性可以使得 hash值也不可变，因此只需要进行⼀次计算。

2. String Pool的需要

   如果⼀个 String 对象已经被创建过了，那么就会从 String Pool 中取得引用。只有 String 是不可变的，才可能使用 String Pool。

3. 安全性

   String 经常作为参数，String 不可变性可以保证参数不可变。

   例如在作为⽹络连接参数的情况下如果String 是可变的，那么在⽹络连接过程中，String 被改变，改变 String 的那⼀方以为现在连接的是其它主机，⽽实际情况却不⼀定是。

4. 线程安全

   String 不可变性天生具备线程安全，可以在多个线程中安全地使用。

## 常用方法

### 判断

- `public boolean equals (Object anObject)`：将此字符串与指定对象进行比较。
- `public boolean equalsIgnoreCase (String anotherString)` ：将此字符串与指定对象进行比较，忽略大小写。

### 获取

- `public int length ()` ：返回此字符串的长度。
- `public String concat (String str)`：将指定的字符串连接到该字符串的末尾。
- `public char charAt (int index)`：返回指定索引处的 char值。
- `public int indexOf (String str)`：返回指定子字符串第一次出现在该字符串内的索引。
- `public String substring (int beginIndex)`：返回一个子字符串，从`beginIndex`开始截取字符串到字符 串结尾。
- `public String substring (int beginIndex, int endIndex)`：返回一个子字符串，从`beginIndex`到 `endIndex`截取字符串。含`beginIndex`，不含`endIndex`。

### 转换

- `public char[] toCharArray ()`：将此字符串转换为新的字符数组。
- `public byte[] getBytes ()`：使用平台的默认字符集将该 String编码转换为新的字节数组。
- `public String replace (CharSequence target, CharSequence replacement)`：将与target匹配的字符串使 用replacement字符串替换。

### 分割

- `public String[] split(String regex)`：将此字符串按照给定的regex（规则）拆分为字符串数组。

## String Pool

字符串常量池（String Pool）保存着所有字符串字⾯量（literal strings），这些字⾯量在编译时期就确定。

不仅如此，还可以使用 String 的 `intern()`方法在运行过程将字符串添加到 String Pool 中。

当⼀个字符串调用 intern() 方法时，如果 String Pool 中已经存在⼀个字符串和该字符串值相等（使用equals() 方法进行确定），那么就会返回 String Pool 中字符串的引用；否则，就会在 String Pool 中添加⼀个新的字符串，并返回这个新字符串的引用。

下⾯示例中，s1 和 s2 采用 new String() 的方式新建了两个不同字符串，⽽ s3 和 s4 是通过 s1.intern()和 s2.intern() 方法取得同⼀个字符串引用。intern() ⾸先把 "aaa" 放到 String Pool 中，然后返回这个字符串引用，因此 s3 和 s4 引用的是同⼀个字符串。

```java
String s1 = new String("aaa");
String s2 = new String("aaa");
System.out.println(s1 == s2); // false
String s3 = s1.intern();
String s4 = s2.intern();
System.out.println(s3 == s4); // true
```

如果是采用 "bbb" 这种字⾯量的形式创建字符串，会自动地将字符串放⼊ String Pool 中。

```java
String s5 = "bbb";
String s6 = "bbb";
System.out.println(s5 == s6); // true
```

> 在 Java 7 之前，String Pool 被放在运行时常量池中，它属于永久代。⽽在 Java 7，String Pool 被移到堆中。这是因为永久代的空间有限，在大量使用字符串的场景下会导致 OutOfMemoryError 错误。

## String、StringBuffer和StringBuilder区别

1. 可变性

   String 不可变

   StringBuffer 和 StringBuilder 可变

2. 线程安全

   String 不可变，因此是线程安全的

   StringBuilder 不是线程安全的

   StringBuffer 是线程安全的，内部使用 synchronized 进行同步

## new String("abc")

使用这种方式**⼀共会创建两个字符串对象**（前提是 String Pool 中还没有 "abc" 字符串对象）。

- "abc" 属于字符串字⾯量，因此编译时期会在 String Pool 中创建⼀个字符串对象，指向这个 "abc"字符串字⾯量；
- ⽽使用 new 的方式会在堆中创建⼀个字符串对象。
