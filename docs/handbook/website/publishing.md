# 北门观测站文章发布操作手册

本文带你完成“下载网站 → 写一篇文章 → 本地检查 → 发布”。所有操作都用文字说明；先完成[本地环境安装](setup.md)，再从第 1 节开始。

源码在 [ZJU-Starlight/zju-starlight.github.io](https://github.com/ZJU-Starlight/zju-starlight.github.io)，正式网站是[星弦·北门观测站](https://zju-starlight.github.io/)。源码提交到 `main` 分支后，由 GitHub Actions 构建并写入 `gh-pages` 分支，再由 GitHub Pages 发布。开始前在工作群说明准备修改的页面，确认没有人同时编辑它。

第一次操作依次完成第 1–8 节。以后从第 3 节同步开始；第 6 节的虚拟环境只需创建一次。

## 1. 获得仓库权限

1. 登录 [GitHub](https://github.com/)，点击头像确认自己的用户名。
2. 把用户名发给协会网站负责人，请对方将你加入仓库协作者。
3. 在 GitHub 通知或注册邮箱中找到邀请，选择 **Accept invitation（接受邀请）**。
4. 打开[协会仓库](https://github.com/ZJU-Starlight/zju-starlight.github.io)，确认仓库名是 `ZJU-Starlight/zju-starlight.github.io`，文件列表上方的分支为 `main`。

看到公开仓库的文件只说明可以阅读；要推送修改，还需要接受协作者邀请。负责人只需要用户名，不需要密码、验证码或访问令牌。遇到 404 时先核对登录账号和邀请状态。

## 2. 第一次把网站下载到电脑

### 2.1 克隆仓库

“克隆”会把网站源文件和版本记录下载到电脑。这一步只做一次。

1. 在电脑上新建一个存放项目的文件夹，例如“文档”中的 `Projects`。
2. 打开 VS Code，选择 **File（文件）→ Open Folder…（打开文件夹）**，打开 `Projects`。
3. 选择 **Terminal（终端）→ New Terminal（新建终端）**。在窗口下方的终端运行：

```shell
git clone https://github.com/ZJU-Starlight/zju-starlight.github.io.git
```

命令结束后，`Projects` 中应出现 `zju-starlight.github.io` 文件夹。如果提示目标文件夹已存在，先查看是否已经克隆过，不要反复下载。

也可以从仓库文件列表上方的 **Code → HTTPS** 复制克隆地址；应与上面命令中的地址一致。下载 ZIP 不包含 Git 版本记录，不适用于后面的提交步骤。

### 2.2 打开克隆后的项目

再次选择 **File → Open Folder…**，这次打开 `Projects` 内的 **zju-starlight.github.io**。左侧 **Explorer（资源管理器）** 应能找到以下内容：

```text
zju-starlight.github.io/
├── docs/                  # 网站正文
│   ├── handbook/          # 办事手册
│   └── static/            # 图片、样式、脚本与数据
├── drafts/                # 草稿与练习，不发布到网站
├── mkdocs.yml             # 导航和网站配置
├── requirements.txt       # 构建网站所需的 Python 包
└── .github/workflows/     # 自动发布配置
```

`site/` 是构建后生成的目录，刚克隆时没有它是正常的。日常写文章主要编辑 `docs/`；新增导航时才修改 `mkdocs.yml`。

重新选择 **Terminal → New Terminal**，运行：

```shell
git status
```

第一次正常克隆后，输出应包含下面两行（中间可能还有其他说明）：

```text
On branch main
nothing to commit, working tree clean
```

这分别表示“当前在 main 分支”和“没有待提交的改动”。如果出现 `not a git repository`，确认打开的是 `zju-starlight.github.io`，而不是外层 `Projects` 或单篇文章。

## 3. 每次写文章前先同步

在项目终端先运行 `git status`。如果已有上次未完成的修改，先确认这些文件的用途，不要直接继续同步。

工作区干净后，按顺序运行：

```shell
git switch main
git pull --ff-only origin main
```

`Already up to date.` 表示没有新的远端提交；显示更新文件列表并正常结束，也表示同步成功。`--ff-only` 会在本地和远端各自有新提交时停止，让你先处理分歧。

如果提示不能快进、存在冲突、认证失败或权限不足，保留完整错误文字联系负责人。不要用强制推送或删除本地文件来“解决”报错。

## 4. 新建并编写文章

### 4.1 选择文件位置

在 Explorer 中展开 `docs → handbook`，右键点击 `handbook`，选择 **New File（新建文件）**，输入 `my-first-guide.md`。文件名使用小写英文、数字和短横线；尚未完成的文章先放在仓库根目录的 `drafts/`。

把下面的模板复制进去，再改成自己的内容：

```markdown
# 文章标题

说明这篇指南适合谁、能帮助读者完成什么。

## 开始前准备

- 需要的账号、权限或材料。

## 操作步骤

1. 从哪个入口开始，执行什么操作。
2. 填写哪些信息，怎样判断这一步完成。

## 完成后检查

说明成功时应该看到什么，以及失败时如何处理。
```

按 **Ctrl + S**（Windows）或 **Command + S**（macOS）保存。保存只更新电脑上的文件；提交和上传在第 7 节完成。

### 4.2 优先用文字、链接和表格

按钮写全名，例如“**Terminal → New Terminal**”；下载入口写成有名称的链接；填写要求使用“字段—填什么—注意事项”表；命令与示例输出分别放进代码块。

需要解释关系或条件分支时，可以使用 Mermaid，但图前仍要写出等价文字。参考[Git 原理补充](git.md)中的实例。简单的直线步骤用编号列表即可。

只有照片、场地布置等需要读者观察外观的内容才考虑插图。确有必要时，将图片放在 `docs/static/img/`，使用有意义的英文文件名和替代文本。例如当前文章位于 `docs/handbook/` 时：

```markdown
![活动场地内桌椅的排列方式](../static/img/activity-room.jpg)
```

这只是写法示例；使用前必须放入真实图片。位于更深子目录的文章，需要按文章所在位置调整相对路径。图片没有加载时，正文也应保留必要的说明。

## 5. 将新文章加入导航

打开项目根目录的 `mkdocs.yml`，找到“办事手册 → 文档写作与网站维护”。在已有“网站文章发布”这一行之后增加同样缩进的一行：

```yaml
    - 文档写作与网站维护:
      - handbook/website/index.md
      - 指南撰写指南: handbook/website/writing.md
      - Markdown语法: handbook/website/markdown.md
      - Git、Python、VS Code 与本地环境安装: handbook/website/setup.md
      - 网站文章发布: handbook/website/publishing.md
      - 我的第一篇教程: handbook/my-first-guide.md
```

以上是配置节选：只增加新文章这一行，不要用整个片段覆盖现有导航。左侧是读者看到的标题，右侧是相对于 `docs/` 的文件路径。缩进使用空格，新增行与相邻文章对齐。

只修改已有文章的正文时，不需要改导航。

## 6. 本地构建和预览

### 6.1 第一次创建项目环境

终端应位于 `zju-starlight.github.io` 根目录。按照操作系统执行对应一组命令。虚拟环境把这个项目的依赖放在 `.venv` 中，避免影响其他项目。

Windows（VS Code 的 PowerShell 终端）：

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

macOS：

```shell
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

已有 `.venv` 时跳过创建命令；`requirements.txt` 更新后重新执行安装依赖的命令。下面直接使用环境里的 Python，不需要激活脚本。

### 6.2 先检查构建，再启动预览

Windows：

```powershell
.\.venv\Scripts\python.exe -m mkdocs build --strict
.\.venv\Scripts\python.exe -m mkdocs serve
```

macOS：

```shell
.venv/bin/python -m mkdocs build --strict
.venv/bin/python -m mkdocs serve
```

第一条命令显示 `Documentation built` 且没有构建错误后，再执行第二条。`--strict` 会把警告视为失败，便于在上传前发现问题。安装或构建报错时，先阅读终端输出；重新出现输入光标本身不代表成功。

预览启动后，打开终端实际打印的网址，通常是 `http://127.0.0.1:8000/`。本地预览只在自己的电脑上运行，不会自动发布。

### 6.3 检查网页

从“**骨干手册 → 文档写作与网站维护 → 我的第一篇教程**”进入刚加入的页面。已有文章则按其实际栏目查找。

- 标题、编号步骤、表格和代码块是否完整；示例命令是否可以复制。
- 本地链接能否跳到目标页面；官方外链是否指向正确服务。
- 如果有 Mermaid，是否显示为图形；关闭图形时，正文是否仍能解释流程。
- 缩窄浏览器窗口，正文是否正常换行，表格和代码能否在各自区域横向滚动。
- 本地页面是否确实包含刚保存的修改。

保存文件后，预览通常自动刷新。检查结束，在终端按 **Ctrl + C** 停止服务。构建生成的 `site/` 和项目环境 `.venv/` 已被忽略，不需要提交。

## 7. 提交并推送到 GitHub

### 7.1 检查本次修改

```shell
git status
git diff
```

`git diff` 显示已跟踪文件的未暂存修改；新文件还要在编辑器中查看。状态关键词含义如下：

| 状态 | 含义 | 下一步 |
| --- | --- | --- |
| `Untracked files` | 新文件尚未纳入 Git | 核对是否为本次新增的文章 |
| `Changes not staged for commit` | 修改尚未选入提交 | 查看差异，确认需要提交 |
| `Changes to be committed` | 已暂存的内容 | 用 `git diff --staged` 核对 |
| `nothing to commit, working tree clean` | 没有待提交的文件改动 | 若预期有修改，检查是否保存、是否在正确目录 |

出现不认识的文件时先查明来源，不要把所有文件一次性加入提交。

### 7.2 暂存、提交、推送

以下命令对应前面的新文章示例；按实际修改调整路径。已有文章没有改导航时，省略 `git add mkdocs.yml`。

```shell
git add docs/handbook/my-first-guide.md
git add mkdocs.yml
git diff --staged
```

核对暂存内容后继续：

```shell
git commit -m "docs: add my first guide"
git push origin main
```

如果确实新增了图片，单独暂存它的实际路径。提交说明写清改了什么。`commit` 在本地记录版本；`push` 才将提交上传。HTTPS 推送可能要求通过浏览器完成 GitHub 登录；普通 GitHub 账号密码不能直接用作 Git 推送密码。

若提示 `Author identity unknown`，返回[安装指南的 Git 署名设置](setup.md#git-author)。若提示推送被拒绝，先保留本地提交并联系负责人处理，不要执行强制推送。

## 8. 确认本次发布成功

先记下本次提交的简短编号：

```shell
git log -1 --oneline
```

然后打开[仓库 Actions](https://github.com/ZJU-Starlight/zju-starlight.github.io/actions)：

1. 找到 **Deploy MkDocs to GitHub Pages** 工作流中与本次提交编号、说明及 `main` 分支对应的运行。
2. 打开运行详情，查看结果。不要把其他提交的成功记录当成本次成功。
3. 工作流成功后，继续查看 Pages 的发布记录（通常名为 **pages build and deployment**），确认本次更新对应的部署也已完成。
4. 打开[正式网站](https://zju-starlight.github.io/)，从导航进入修改的页面，核对新标题或一句新增正文。必要时刷新页面。

| 结果 | 如何处理 |
| --- | --- |
| Queued / In progress | 还在排队或执行，稍后查看 |
| Success | 此次运行成功；仍需核对正式页面内容 |
| Failure | 打开失败步骤，复制错误文字，请负责人协助 |
| Cancelled / Skipped | 尚不能视为发布成功，确认是否有后续运行 |
| 找不到本次运行 | 检查 `git push` 是否成功、远端是否为协会仓库以及分支是否为 `main` |

首次发布还需要负责人按仓库 [README 的部署说明](https://github.com/ZJU-Starlight/zju-starlight.github.io#github-pages-部署)配置 Pages 来源。工作流成功但网站仍为 404 时，优先核对 Pages 设置与后续部署，不要反复推送相同内容。运行详情的更多说明见 [GitHub 官方文档](https://docs.github.com/en/actions/how-tos/monitor-workflows/view-workflow-run-history)。

## 发布前后检查清单

- [ ] 已获得写入权限，并与其他编辑者确认修改范围。
- [ ] 从干净的 `main` 分支同步后开始编辑。
- [ ] 正文不依赖截图，也能说明操作与成功标准。
- [ ] 新文章位置正确；需要时已增加导航。
- [ ] 严格构建通过，本地网页检查通过。
- [ ] 暂存区只包含本次需要提交的文件。
- [ ] 本次提交的 Actions 和 Pages 部署成功。
- [ ] 正式网页已经显示本次修改。
