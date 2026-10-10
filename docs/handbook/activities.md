# 举办活动涉及的行政流程
***社团运作的基本单元——活动***

```mermaid
%%{init: {"flowchart": {"curve": "bumpX", "nodeSpacing": 16, "rankSpacing": 38, "padding": 10}}}%%
flowchart LR
    activity(["<span style='color:#0f172a'>活动流程</span>"])
    funding("<span style='color:#78350f'>1. 筹款（经费）</span>")
    funding1["草拟预算方案"]
    funding2["青苗计划、恒星计划<br/>繁星计划"]
    funding3["其他学校机构的经费"]
    funding4["向参与者收费（内部活动）"]
    activity --- funding
    funding --- funding1 & funding2 & funding3 & funding4

    planning("<span style='color:#0c4a6e'>2. 策划（必要）</span>")
    planning1["草拟活动地点和时间"]
    planning2["决定活动具体形式"]
    planning3["估计活动举办工作量<br/>并拆分分工方案"]
    activity --- planning
    planning --- planning1 & planning2 & planning3

    approval("<span style='color:#4c1d95'>3. 立项（正式）</span>")
    approval1["撰写简洁的策划案"]
    approval2["在“素质拓展网”<br/>立项申请二课分"]
    activity --- approval
    approval --- approval1 & approval2

    publicity("<span style='color:#0c4a6e'>4. 宣传（必要）</span>")
    publicity1["在群内宣传"]
    publicity2["使用社团官媒发布活动通知"]
    publicity3["申请帮推"]
    publicity4["申请三大学园LED大屏幕"]
    publicity5["在“团在浙大”平台<br/>提交宣传品申请"]
    publicity6["在“团在浙大”上<br/>申请摆摊现宣"]
    activity --- publicity
    publicity --- publicity1 & publicity2 & publicity3 & publicity4 & publicity5 & publicity6

    preparation("<span style='color:#0c4a6e'>5. 准备（必要）</span>")
    preparation1["工作分配"]
    preparation2["招募工作人员"]
    preparation3["场地的借用、预约、检查"]
    preparation4["获取道具和奖品"]
    preparation5["搬运必要的活动道具<br/>和活动奖品"]
    preparation1 & preparation2 & preparation3 & preparation4 & preparation5 --- preparation
    preparation --- activity

    hosting("<span style='color:#0c4a6e'>6. 举办（必要）</span>")
    hosting1["签到"]
    hosting2["主持方向"]
    hosting3["秩序维持"]
    hosting4["核验与发放奖品"]
    hosting1 & hosting2 & hosting3 & hosting4 --- hosting
    hosting --- activity

    closing("<span style='color:#4c1d95'>7. 结项（正式）</span>")
    closing1["在“团在浙大”活动备案"]
    closing2["在“素质拓展网”<br/>进行二课分加分流程"]
    closing1 & closing2 --- closing
    closing --- activity

    reimbursement("<span style='color:#78350f'>8. 报销（经费）</span>")
    reimbursement1["收集报销材料<br/>发票、网购订单记录<br/>支付记录"]
    reimbursement2["在浙大计财处网站上传发票<br/>并发起报销预约"]
    reimbursement3["填写“预决算表”和<br/>“经费使用情况登记表”"]
    reimbursement4["将文件送指导老师签字<br/>和文学院盖章"]
    reimbursement5["将签好字盖好章的文件<br/>送计财处"]
    reimbursement6["处理被计财处打回的<br/>报销申请"]
    reimbursement1 & reimbursement2 & reimbursement3 & reimbursement4 & reimbursement5 & reimbursement6 --- reimbursement
    reimbursement --- activity

    classDef overview fill:#e2e8f0,stroke:#475569,color:#0f172a,stroke-width:2px,font-weight:bold;
    classDef required fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e,stroke-width:2px,font-weight:bold;
    classDef formal fill:#ede9fe,stroke:#7c3aed,color:#4c1d95,stroke-width:2px,font-weight:bold;
    classDef budget fill:#fef3c7,stroke:#d97706,color:#78350f,stroke-width:2px,font-weight:bold;
    classDef detail fill:transparent,stroke:#cbd5e1,stroke-width:1px;
    class activity overview;
    class planning,publicity,preparation,hosting required;
    class approval,closing formal;
    class funding,reimbursement budget;
    class funding1,funding2,funding3,funding4,planning1,planning2,planning3,approval1,approval2,publicity1,publicity2,publicity3,publicity4,publicity5,publicity6,preparation1,preparation2,preparation3,preparation4,preparation5,hosting1,hosting2,hosting3,hosting4,closing1,closing2,reimbursement1,reimbursement2,reimbursement3,reimbursement4,reimbursement5,reimbursement6 detail;
```

本篇指南主要有关举办活动过程中涉及的**行政流程**，包括立项、宣传、现场记录、采购与报销、活动后备案等。

任何活动都包含策划、宣传、准备、举办环节；对于申请二课分的正式活动，额外多了立项、结项环节；对于使用经费的活动，又额外多了经费筹集、事后报销环节。

## 策划

策划一个活动，首先需要想出有趣的活动内容，然后需要为活动选择合适的时间地点，并评估后续工作。如有必要需要为活动拟定合适的奖品，

社团举办活动主要是为了丰富学生们的课余生活、满足学生的社交需求。我们的主要竞争对手是低质量的短视频和电子游戏。在策划活动时，您可以围绕增强社交属性、制造有限的良性竞争、给予所有人平等的表现机会、给予参与者素质提升的机会、尽量降低活动参与门槛来进行活动策划。

选择活动时间时需要尽力避开以下时间点：小长假开头和中段、考试周和考试周前一周、四六级考试当天。

活动地点应尽量选择无需租金的、学生熟悉的地点或便于通过导航软件前往的地点。优先考虑东教、西教，其次考虑北教，再次考虑尧坤楼。如果您没有到过这些地点，您应当线下去实地考察过后再做决定——这个步骤通常在您上课的时候就完成了。

在策划活动时，您应当对本次活动给规模做出估计，从而估计后续的工作量、对任务进行初步的拆分、估计各项工作进行的大致时间、估计协会需要调动的人力。以“星弦杯征文”为例，其后续工作包括：立项、宣传、初审、复审、结项、选手对接、奖品发放、报销。其产生了细分任务约50余项，调动人力超过25人。

为活动选定奖品需要您详细参阅当年的活动报销规则。相关规则您可以要求社长提供。

## 宣传

依据活动的面向对象、预计规模、剩余时间来决定你的宣传规模，请务必为宣传工作预留足够的时间。

依据宣传规模和消耗的人力排序，常规宣传渠道包括：协会Q群内宣传、CC98发布预告帖、微信公众号发布宣传推文、申请帮推、申请学园LED大屏幕挂电子海报、申请悬挂海报横幅、申请宣传摊位现宣。其中，微信推文帮推和LED大屏幕申请请参阅[帮推投稿指南](promotion.md)，申请悬挂海报横幅、摊位现宣请参阅社团宝典。

宣传的文案内容至少需要包括活动的时间、地点、内容，线上活动需要明确活动参与方式，涉及奖品发放的活动需要明确奖品发放规则和评奖评优规则。对于各类活动的宣传文案，可以参阅骨干手册的模板部分。

## 举办

线下举办的活动请至少拍摄3张照片。需要发放奖品的活动请记录：领奖人信息（姓名、学号、联系方式）、奖项。**领奖表格是报销的必要材料**。

## 立项：策划案不只是应付行政流程
首先，“为什么要立项？”

我的回答是：**为了申请资源**——活动场地、活动经费、二课分、宣传帮推等。你不需要进行立项就能和室友一起开黑来一把王者，立项对组织活动来说不是必须的（特别是内建和不申请二课分的内训活动）。

### 活动计划书
活动立项需要有明确的活动计划书。根据2026/1/26是校素拓网提供的模板和团在浙大平台的文件要求，一份活动计划书的目录结构如下：
- 策划案
	- 活动时间、地点、预估人数
	- 活动内容
	- 二三课分设置
- 预算方案
- 安全方案

活动计划书的 Markdown 模板示例：[查看活动计划书](templates/proposal.md)。

## 场地

借用教室：[借教室](venues.md)

借用活动室：在工作群向社长提出申请。活动室是和其他社团合用的，社长会负责预约和借用事宜

## 物料采购

通常在撰写策划的同时拟定。需要注意的是：
1. 不是所有活动都需要经费支持
2. 社团活动经费每个学期都要申请
3. 购买奖品的单价不要超过200
4. 拟定采购计划时应参考社团宝典的相关规定

上次更新2026/1/24

天天开心

