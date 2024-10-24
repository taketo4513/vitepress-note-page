# 视图

**视图（View）是一种虚拟存在的表**。视图中的数据并不在数据库中实际存在，行和列数据来自定义视图的查询中使用的表，并且是在使用视图时动态生成的。

通俗的讲，**视图只保存了查询的SQL逻辑，不保存查询结果**。所以我们在创建视图的时候，主要的工作就落在创建这条SQL查询语句上。

## 语法

### 创建

```sql
CREATE [OR REPLACE] 
VIEW 
视图名称[(列名列表)] 
AS 
SELECT语句 
[ WITH [CASCADED | LOCAL ] CHECK OPTION ]
```

### 查询

```sql
查看创建视图语句：
SHOW CREATE VIEW 视图名称;
查看视图数据：
SELECT * FROM 视图名称 ...... ;
```

### 修改

```sql
方式一：
CREATE [OR REPLACE] 
VIEW 
视图名称[(列名列表)] 
AS 
SELECT语句 
[ WITH [ CASCADED | LOCAL ] CHECK OPTION ]
方式二：
ALTER VIEW 视图名称[(列名列表)] 
AS SELECT语句 
[ WITH [ CASCADED | LOCAL ] CHECK OPTION ]
```

### 删除

```sql
DROP VIEW [IF EXISTS] 视图名称 [,视图名称] ...
```

### 示例

```sql
-- 创建视图
create or replace 
view stu_v_1 
as select id,name from student where id <= 10;
-- 查询视图
show create view stu_v_1;
select * from stu_v_1;
select * from stu_v_1 where id < 3;
-- 修改视图
create or replace 
view stu_v_1 
as select id,name,no from student where id <= 10;
alter 
view stu_v_1 
as select id,name from student where id <= 10;
-- 删除视图
drop view if exists stu_v_1;
insert into stu_v_1 values(6,'Tom');
insert into stu_v_1 values(17,'Tom22');
```

执行上述的SQL，我们会发现，id为6和17的数据都是可以成功插入的。

但是我们执行查询，查询出来的数据，**却没有id为17的记录**

因为我们在创建视图的时候，**指定的条件为 id<=10, id为17的数据，是不符合条件的**，所以没有查询出来，但是这条数据确实是已经成功的插入到了基表中。

>如果我们定义视图时，如果指定了条件，然后我们在插入、修改、删除数据时，是否可以做到必须满足条件才能操作，否则不能够操作呢？
>
>答案是可以的，这就需要**借助于视图的检查选项**了。

## 检查选项

当使用**WITH CHECK OPTION子句创建视图**时，MySQL会通过视图检查正在更改的每个行，例如 插入，更新，删除，以使其符合视图的定义。

MySQL允许基于另一个视图创建视图，它还会检查依赖视图中的规则以保持一致性。为了确定检查的范围，mysql提供了两个选项： **CASCADED 和 LOCAL，默认值为 CASCADED（级联）** 。

### CASCADED(级联)

例如，**v2视图是基于v1视图的**，如果在**v2视图**创建的时候**指定了检查选项为 cascaded**，但是**v1视图**创建时**未指定检查选项**。 则在执行检查时，**不仅会检查v2，还会级联检查v2的关联视图v1**。

![An image](/img/dev/mysql/85.png)

### LOCAL(本地)

例如，**v2视图是基于v1视图的**，如果在**v2视图**创建的时候**指定了检查选项为 local**，但是**v1视图**创建时**未指定检查选项**。 则在执行检查时，**只会检查v2，不会检查v2的关联视图v1**。

![An image](/img/dev/mysql/86.png)

## 视图的更新

要使视图可更新，**视图中的行与基础表中的行之间必须存在一对一的关系**。如果视图包含以下任何一项，则该视图不可更新。

- 聚合函数或窗口函数（SUM()、 MIN()、 MAX()、 COUNT()等）
- DISTINCT
- GROUP BY
- HAVING
- UNION 或者 UNION ALL

示例演示

```sql
create view stu_v_count as select count(*) from student;
```

上述的视图中，就只有一个单行单列的数据，如果我们对这个视图进行更新或插入的，将会报错。

```sql
insert into stu_v_count values(10);
```

## 视图作用

### 简单

视图不仅可以简化用户对数据的理解，也可以简化他们的操作。那些被经常使用的查询可以被定义为视图，从而使得用户不必为以后的操作每次指定全部的条件。

### 安全

数据库可以授权，但不能授权到数据库特定行和特定的列上。通过视图用户只能查询和修改他们所能见到的数据

### 数据独立

视图可帮助用户屏蔽真实表结构变化带来的影响。
