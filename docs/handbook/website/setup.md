# Git、Python、VS Code 与本地环境安装指南

完成本文后，你应能打开 VS Code，并在终端检查 Git 和 Python 的版本。之后按[网站文章发布手册](publishing.md)下载项目、创建环境并预览网站。

本项目的自动构建使用 **Python 3.12**，初次安装也按这个版本准备。如果已有可用的 Git 和 Python 3.12，可直接完成文末验收，无需重复安装。

## 先分清三个工具

| 工具 | 用途 | 是否需要 |
| --- | --- | --- |
| VS Code | 编辑文章、打开项目文件夹和终端 | 需要 |
| Git | 记录修改、同步 GitHub 仓库 | 需要 |
| Python 3.12 | 运行 MkDocs，将文章构建成网页 | 需要 |
| Homebrew | macOS 上安装软件的工具 | 本文 macOS 路线使用；Windows 不需要 |
| Miniconda | 另一种 Python 环境管理工具 | 已在使用时可沿用；新成员无需额外安装 |

## 1. 安装 VS Code

打开 [VS Code 官方下载页](https://code.visualstudio.com/download)，根据自己的系统选择安装包。系统和芯片不确定时，按下面的方法确认：

| 系统 | 去哪里确认 | 下载选择 |
| --- | --- | --- |
| Windows | 设置 → 系统 → 系统信息（或“关于”）→ 系统类型 | x64 对应 x64，ARM 对应 Arm64 |
| macOS | 苹果菜单 → 关于本机，查看“芯片”或“处理器” | Apple M 系列对应 Apple silicon；Intel 对应 Intel chip；官网提供时也可选 Universal |

### Windows

选择 **Windows User Installer**，运行安装程序。保持常规默认设置；如果安装器提供 **Add to PATH（添加到 PATH）**，勾选后完成安装。随后重新打开终端。安装流程可参考 [VS Code 的 Windows 官方说明](https://code.visualstudio.com/docs/setup/windows)。

### macOS

打开下载的安装包，将 **Visual Studio Code.app** 放入 **Applications（应用程序）**，再从应用程序启动。若下载为压缩包，先解压；磁盘映像则打开后拖入应用程序。安装方式参考 [VS Code 的 macOS 官方说明](https://code.visualstudio.com/docs/setup/mac)。

### 验收

打开 VS Code，选择 **Terminal（终端）→ New Terminal（新建终端）**，窗口下方出现可以输入命令的区域即可。后续命令都在这里运行，不要粘贴进 Markdown 正文。

## 2. 安装 Git

### Windows

打开 [Git for Windows 官方入口](https://git-scm.com/install/windows)，下载适合系统架构的安装程序并运行。初次安装一般保留默认选项即可；安装目录也可以使用默认值，没有必须避开 C 盘的要求。

安装完成后重启 VS Code，在新终端运行：

```shell
git --version
```

看到 `git version` 开头的版本信息就通过，具体小版本号不需要与他人相同。

### macOS

已有 Git 时先执行 `git --version`，能输出版本号即可跳过。否则打开 [Homebrew 官方网站](https://brew.sh/zh-cn/)，按页面安装说明完成 Homebrew，并执行安装结束时 **Next steps** 提示的终端配置命令。

需要输入系统密码时，终端可能不显示字符，这是正常现象。重开终端后执行：

```shell
brew --version
brew install git
git --version
```

最后一条输出 Git 版本号即通过。其他安装途径见 [Git 的 macOS 官方说明](https://git-scm.com/install/mac)，选择一种完成即可。

## 3. 安装 Python 3.12

### Windows：使用 Python 安装管理器

先运行 `py -3.12 --version`；已经输出 `Python 3.12.x` 时跳过安装。没有对应版本时：

1. 打开 [Python 官方下载页](https://www.python.org/downloads/)，安装 **Python install manager**。
2. 关闭并重新打开 VS Code 终端。
3. 安装本项目使用的版本，再检查：

```powershell
pymanager install 3.12
py -3.12 --version
py -3.12 -m pip --version
```

使用 `pymanager` 安装可以避免与旧版 `py` 启动器的子命令混淆。后两条应分别输出 `Python 3.12.x` 和 pip 的版本及路径。管理器的安装及命令说明见 [Python 官方 Windows 文档](https://docs.python.org/3/using/windows.html)。

如果电脑上使用的是传统 Python 安装器，界面可能有 **Add python.exe to PATH**；它与新版管理器不同。已有 Python 不必为寻找旧教程里的复选框而重装，以版本检查结果为准。

### macOS：使用 Homebrew

完成上一节的 Homebrew 设置后，运行：

```shell
brew install python@3.12
python3.12 --version
python3.12 -m pip --version
```

后两条分别输出 Python 3.12 和 pip 信息即通过。这里明确使用 `python3.12`，避免误用电脑上其他版本。安装命令参考 [Homebrew 的 Python 3.12 说明](https://formulae.brew.sh/formula/python@3.12)。

已有通过其他方式安装的 Python 3.12，且上述检查通过时，可直接使用。不要为了本项目卸载系统 Python。

### 已经使用 Conda 的成员

新成员按前面的系统路线完成即可。如果已有 Conda，可在 Conda 可用的终端建立专用环境：

```shell
conda create -n starlight python=3.12 pip
conda activate starlight
python --version
python -m pip --version
```

后续在这个已激活环境中使用 `python -m pip` 和 `python -m mkdocs`。它替代发布手册中的 `.venv` 路线，不需要再创建第二套环境。每次重开终端都先激活 `starlight`。

## 4. 设置 Git 提交署名 {#git-author}

Git 在提交中记录作者名和邮箱。这里设置的是署名，GitHub 登录和仓库写入权限仍需另外取得。

把示例文字替换为自己的信息：

```shell
git config --global user.name "你的姓名或 GitHub 用户名"
git config --global user.email "你的提交邮箱"
```

提交邮箱会随提交记录公开；可使用 GitHub **Settings → Emails** 提供的 noreply 地址。检查刚设置的两项：

```shell
git config --global --get user.name
git config --global --get user.email
```

能看到预期署名即通过，不需要输出或分享全部 Git 配置。

## 5. 安装完成验收

打开 VS Code 的新终端，按系统执行一组命令。

Windows：

```powershell
git --version
py -3.12 --version
py -3.12 -m pip --version
```

macOS：

```shell
git --version
python3.12 --version
python3.12 -m pip --version
```

三条都能输出版本信息后，继续[网站文章发布手册](publishing.md)。MkDocs 依赖在克隆仓库后按该手册安装到项目环境中。

## 问题速查

| 问题 | 先检查什么 | 如何处理 |
| --- | --- | --- |
| `git` 找不到 | 安装是否完成、终端是否重开 | 重启 VS Code 后再检查版本 |
| `pymanager` 找不到 | 是否安装了 Python install manager | 核对安装方式并重开终端；已有 3.12 时直接验收 |
| `py -3.12` 找不到运行时 | 是否已经安装 3.12 | 在管理器可用时执行 `pymanager install 3.12` |
| macOS 找不到 `brew` | Homebrew 的 Next steps 是否执行 | 按安装器针对本机输出的命令配置，再开新终端 |
| `python3.12` 找不到 | 对应版本是否安装、Homebrew 是否可用 | 检查安装结果与终端路径；保留报错求助 |
| pip 提示权限不足或环境由系统管理 | 是否正在给系统 Python 安装包 | 按发布手册创建项目 `.venv`，用其中的 Python 安装依赖 |
| 多个 Python 的版本不同 | 当前命令指向哪个环境 | 本教程明确指定 3.12；Conda 用户先激活专用环境 |

求助时提供操作系统、当前步骤、输入的完整命令和完整错误文字。截图可以辅助说明，但通常可复制的错误文字更便于排查。
