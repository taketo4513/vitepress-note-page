# 版本升级

由于`GitLab`系统较为复杂庞大，因此升级需要遵循官方的升级路径进行升级，升级前先检查是否与升级路径一致，切记不可直接跨大版本升级，可能会由于数据结构不一致导致无法启动。

[版本升级路径查询](https://gitlab-com.gitlab.io/support/toolbox/upgrade-path/)

因此升级需要遵循官方升级路径的版本顺序依次升级，不可跳过中间版本直接升级，否则会报错无法启动成功。例如我当前的版本是：`v15.7.1`,我的升级路径如下：

```sh
15.7.1 -> 15.11.13 -> 16.1.5 -> 16.3.6 -> 16.6.0
```

每次更新`docker-compose.yaml`中的镜像版本号，然后执行

```sh
docker compose up -d
```

确保每次更新版本号启动后进入healthy状态，并且日志输出变缓，只有访问`gitlab`才有少量请求日志后再进行重复操作，直至版本升级至最新版。