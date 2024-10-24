# 应用示例

## 更换远程仓库

更换`Git`远程仓库：比如，将`Github`的仓库迁移到`Gitee`上。

```sh
# 先从Github将项目拉下来
git clone https://github.com/xxx/xxx.git

# 进入项目查看远程仓库地址
cd xxx && git remote -v

# fetch代表拉取代码的地址，push代表推送代码的地址
origin  https://github.com/xxx/xxx.git (fetch)
origin  https://github.com/xxx/xxx.git (push)

# 删除Github远程仓库地址
git remote remove <远程仓库名称>

# 添加Gitee远程仓库地址
git remote add <远程仓库名称> <远程仓库URL>

# 确认已经设置了正确的远程仓库
git remote -v

# 推送代码，--all代表所有分支
git push <远程仓库名称> --all
```

## 修改文件权限

在 `GIT` 仓库中经常会放一些可执行脚本，但是拉取后却发现没有可执行权限，还需要手动添加权限。

```sh
# 查看文件权限信息
git ls-files --stage
# 644代表权限(r=4, w=2, x=1)
100644 6a5da4d737b0e90f6dc96ebca7d889aa0423e061 0       scripts/start.sh
100644 858aba42d858832651433ef2d1767b525add909c 0       scripts/stop.sh

# 增加可执行权限
git update-index --chmod +x scripts/start.sh
# 修改为755
100755 6a5da4d737b0e90f6dc96ebca7d889aa0423e061 0       scripts/start.sh
```

## 清除GIT缓存

如果某个文件已经被纳入版本控制并且已经提交到 `Git` 仓库中，即使将其添加到 `.gitignore` 文件中，`Git` 仍然会跟踪该文件。

```sh
# 清除缓存
git rm -r --cached .

# 添加暂存
git add .
```
