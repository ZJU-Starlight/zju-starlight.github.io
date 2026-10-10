# 星弦科幻协会资料汇总网站

> Warning 正在建设中

源码仓库：<https://github.com/ZJU-Starlight/zju-starlight.github.io>

网站地址：<https://zju-starlight.github.io/>

## 本地搭建

* 准备 Python 3.12（下面的安装命令适用于 Ubuntu 24.04）

```shell
sudo apt update
sudo apt install python3.12 python3.12-venv -y
python3.12 --version
```

其他系统请先按[安装指南](docs/handbook/website/setup.md)准备 Python 3.12。
`venv` 会为项目安装独立的 pip，无需向系统 Python 全局安装依赖。

* 创建项目环境并安装依赖（macOS / Linux）

```shell
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

* 严格构建检查后开启本地预览服务

```shell
.venv/bin/python -m mkdocs build --strict
.venv/bin/python -m mkdocs serve
```

打开终端打印的预览地址，通常为 `http://127.0.0.1:8000/`。Windows 用户的对应命令及完整操作步骤见
[安装指南](docs/handbook/website/setup.md)和[文章发布手册](docs/handbook/website/publishing.md)。

## GitHub Pages 部署

源码仓库必须位于 `ZJU-Starlight` 组织下，仓库名为 `zju-starlight.github.io`，才能使用上述根地址。
源码使用 `main` 分支，GitHub 仓库的默认分支也应设为 `main`。`.github/workflows/ci.yml` 会在推送到 `main` 时安装
`requirements.txt` 中的依赖，先严格构建检查，再通过 `mkdocs gh-deploy --strict --force` 构建并发布到
`gh-pages` 分支；也可以在 Actions 页面手动运行该工作流。

尚未初始化 Git 的本地目录，可在仓库根目录执行以下命令（需已配置 GitHub SSH 访问权限，并先在 GitHub 创建同名空仓库）：

```shell
git init -b main
git remote add origin git@github.com:ZJU-Starlight/zju-starlight.github.io.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

`git push -u` 会将本地 `main` 的上游设为 `origin/main`。`.gitignore` 会排除虚拟环境、构建产物等本地文件。
已有 Git 仓库的副本无需重新初始化，远程地址更新命令见本节末尾。

新仓库首次部署：

1. 将源码（包括 `.github/workflows/ci.yml` 和 `.gitignore`）提交并推送到 `main`。
2. 在仓库的 **Actions** 页面确认 **Deploy MkDocs to GitHub Pages** 成功，生成 `gh-pages` 分支。
3. 在 **Settings → Pages → Build and deployment** 中，将 **Source** 设为
   **Deploy from a branch**，选择 **gh-pages** 分支和 **/(root)**，保存。
4. 等待 Pages 发布完成，访问 <https://zju-starlight.github.io/>。

本流程通过 `gh-pages` 分支发布，Pages 的 Source 应使用上述分支模式。
组织和仓库需允许 GitHub Actions 运行；工作流已声明 `contents: write`，用于写入发布分支。

在项目环境中执行 `python -m mkdocs build --strict` 可检查构建。`docs/` 是源文件，`site/` 是自动生成的
静态网站，已加入 `.gitignore`，无需提交到 `main`。

迁移前的本地副本可执行以下命令更新远程地址：

```shell
git remote set-url origin git@github.com:ZJU-Starlight/zju-starlight.github.io.git
```
