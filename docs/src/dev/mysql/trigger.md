# 触发器

触发器是与表有关的数据库对象，指在insert/update/delete之前(BEFORE)或之后(AFTER)，触发并执行触发器中定义的SQL语句集合。触发器的这种特性可以协助应用在数据库端确保数据的完整性, 日志记录 , 数据校验等操作 。

使用别名 `OLD` 和 `NEW` 来引用触发器中发生变化的记录内容，这与其他的数据库是相似的。现在触发器还只支持行级触发，不支持语句级触发。

| **触发器类型**  | **NEW 和 OLD**                                          |
| --------------- | ------------------------------------------------------- |
| INSERT 型触发器 | NEW 表示将要或者已经新增的数据                          |
| UPDATE 型触发器 | OLD 表示修改之前的数据 , NEW 表示将要或已经修改后的数据 |
| DELETE 型触发器 | OLD 表示将要或者已经删除的数据                          |

### 语法

创建

```sql
CREATE TRIGGER trigger_name
BEFORE/AFTER INSERT/UPDATE/DELETE
ON tbl_name FOR EACH ROW -- 行级触发器
BEGIN
        trigger_stmt ;
END;
```

查看

```sql
SHOW TRIGGERS ;
```

删除

```sql
DROP TRIGGER [schema_name.]trigger_name ; 
-- 如果没有指定 schema_name，默认为当前数据库 。
```

案例

通过触发器记录 `tb_user` 表的数据变更日志，将变更日志插入到日志表user_logs中, 包含增加，修改，删除；

表结构准备

```sql
-- 准备工作 : 日志表 user_logs
create table user_logs(
  id int(11) not null auto_increment,
  operation varchar(20) not null comment '操作类型, insert/update/delete',
  operate_time datetime not null comment '操作时间',
  operate_id int(11) not null comment '操作的ID',
  operate_params varchar(500) comment '操作参数',
  primary key(`id`)
)engine=innodb default charset=utf8;
```

### 插入数据触发器

```sql
create trigger tb_user_insert_trigger
  after insert on tb_user for each row
begin
    insert into user_logs(id, operation, operate_time, operate_id, operate_params)
VALUES 
  (null, 'insert', now(), new.id, concat('插入的数据内容为:
  id=',new.id,',name=',new.name, ', phone=', NEW.phone, ', email=', NEW.email, ',
  profession=', NEW.profession));
end;
```

测试

```sql
-- 查看
show triggers ;
-- 插入数据到tb_user
insert into tb_user(id, name, phone, email, profession, age, gender, status,
createtime) VALUES (26,'三皇子','18809091212','erhuangzi@163.com','软件工
程',23,'1','1',now());
```

测试完毕之后，检查日志表中的数据是否可以正常插入，以及插入数据的正确性。

### 修改数据触发器

```sql
create trigger tb_user_update_trigger
    after update on tb_user for each row
begin
    insert into user_logs(id, operation, operate_time, operate_id, operate_params)
VALUES
  (null, 'update', now(), new.id,
  concat('更新之前的数据: id=',old.id,',name=',old.name, ', phone=',
  old.phone, ', email=', old.email, ', profession=', old.profession,
  ' | 更新之后的数据: id=',new.id,',name=',new.name, ', phone=',
  NEW.phone, ', email=', NEW.email, ', profession=', NEW.profession));
end;
```

测试

```sql
-- 查看
show triggers ;
-- 更新
update tb_user set profession = '会计' where id = 23;
update tb_user set profession = '会计' where id <= 5;
```

测试完毕之后，检查日志表中的数据是否可以正常插入，以及插入数据的正确性。

### 删除数据触发器

```sql
create trigger tb_user_delete_trigger
    after delete on tb_user for each row
begin
    insert into user_logs(id, operation, operate_time, operate_id, operate_params)
VALUES
  (null, 'delete', now(), old.id,
  concat('删除之前的数据: id=',old.id,',name=',old.name, ', phone=',
  old.phone, ', email=', old.email, ', profession=', old.profession));
end;
```

测试

```sql
-- 查看
show triggers ;
-- 删除数据
delete from tb_user where id = 26;
```

测试完毕之后，检查日志表中的数据是否可以正常插入，以及插入数据的正确性。
