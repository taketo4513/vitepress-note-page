# 索引结构

MySQL的索引是在存储引擎层实现的，**不同的存储引擎有不同的索引结构**，主要包含以下几种：

| 索引结构            | 描述                                                         |
| ------------------- | ------------------------------------------------------------ |
| B+Tree索引          | 最常见的索引类型，大部分引擎都支持 B+ 树索引                 |
| Hash索引            | 底层数据结构是用哈希表实现的, 只有**精确匹配**索引列的查询才有效, 不支持范围查询 |
| R-tree(空间索引)   | 空间索引是MyISAM引擎的一个特殊索引类型，主要用于**地理空间数据类型**，通常使用较少 |
| Full-text(全文索引) | 是一种通过建立**倒排索引**,快速匹配文档的方式。类似于Lucene,Solr,ES |

不同的存储引擎对于索引结构的支持情况

| 索引           | InnoDB          | MyISAM   | Memory   |
| -------------- | --------------- | -------- | -------- |
| **B+tree索引** | **支持**        | **支持** | **支持** |
| Hash 索引      | 不支持          | 不支持   | 支持     |
| R-tree 索引    | 不支持          | 支持     | 不支持   |
| Full-text      | 5.6版本之后支持 | 支持     | 不支持   |

> 我们平常所说的索引，如果没有特别指明，**都是指B+树结构组织的索引**。

## 二叉树

假如说MySQL的索引结构采用二叉树的数据结构，比较理想的结构如下

![An image](/img/dev/mysql/26.png)

如果主键是顺序插入的，则会形成一个单向链表，结构如下

![An image](/img/dev/mysql/27.png)

> 二叉树作为索引结构，会存在以下缺点
>
> - 顺序插入时，会形成一个链表，查询性能大大降低。
> - 大数据量情况下，层级较深，检索速度慢。

大家可能会想到，我们可以选择**红黑树**，红黑树是一颗自平衡二叉树，那这样即使是顺序插入数据，最终形成的数据结构也是一颗平衡的二叉树，结构如下

![An image](/img/dev/mysql/28.png)

即使如此，由于**红黑树也是一颗二叉树**，所以也会存在一个缺点大数据量情况下，层级较深，检索速度慢。

> 所以，在MySQL的索引结构中，并没有选择二叉树或者红黑树，而**选择的是B+Tree**。

## B-Tree

B-Tree，是一种多叉路衡查找树，相对于二叉树，B树每个节点可以有多个分支，即**多叉**。

![An image](/img/dev/mysql/29.png)

![An image](/img/dev/mysql/30.png)

特点

- 5阶的B树，每一个节点最多存储4个key，对应5个指针。
- 一旦节点存储的**key数量到达5**，就会裂变，中间元素向上分裂。
- 在B树中，非叶子节点和叶子节点都会存放数据。

## B+Tree

B+Tree是B-Tree的变种，**我们以一颗最大度数（max-degree）为4（4阶）的b+tree为例**，来看一下其结构示意图

![An image](/img/dev/mysql/31.png)

我们可以看到，两部分

- 绿色框框起来的部分，是**索引部分，仅仅起到索引数据的作用，不存储数据**。
- 红色框框起来的部分，是**数据存储部分，在其叶子节点中要存储具体的数据**。

![An image](/img/dev/mysql/32.png)

最终我们看到，B+Tree 与 B-Tree相比，主要有以下三点区别

1. 所有的数据都会出现在叶子节点。
2. 叶子节点形成一个单向链表。
3. 非叶子节点仅仅起到索引数据作用，具体的**数据**都是在**叶子节点存放**的。

上述我们所看到的结构是**标准的B+Tree的数据结构**，我们再来看看MySQL中**优化之后的B+Tree**。

MySQL索引数据结构对经典的B+Tree进行了优化。

在原B+Tree的基础上，**增加一个指向相邻叶子节点的链表指针**，就形成了带**有顺序指针的B+Tree**，提高区间访问的性能，利于排序。

![An image](/img/dev/mysql/33.png)

## Hash

MySQL中除了支持B+Tree索引，还支持一种索引类型**Hash索引**。

哈希索引就是采用一定的hash算法，将键值换算成新的hash值，映射到对应的槽位上，然后存储在hash表中。

![An image](/img/dev/mysql/34.png)

如果两个(或多个)键值，映射到一个相同的槽位上，他们就产生了hash冲突（也称为hash碰撞），可以通过链表来解决。

![An image](/img/dev/mysql/35.png)

特点

- Hash索引只能用于对等比较(=，in)，不支持范围查询（between，>，< ，...）
- 无法利用索引完成排序操作
- 查询效率高，通常(不存在hash冲突的情况)只需要一次检索就可以了，效率通常要高于B+tree索引

## 存储引擎支持

在MySQL中，支持hash索引的是Memory存储引擎。而InnoDB中具有自适应hash功能，hash索引是InnoDB存储引擎根据B+Tree索引在指定条件下自动构建的。

思考

为什么InnoDB存储引擎选择使用B+tree索引结构?

- 相对于二叉树，层级更少，搜索效率高；
- 对于B-tree，无论是叶子节点还是非叶子节点，都会保存数据，这样导致一页中存储的键值减少，指针跟着减少，要同样保存大量数据，只能增加树的高度，导致性能降低；
- 相对Hash索引，B+tree支持范围匹配及排序操作；
