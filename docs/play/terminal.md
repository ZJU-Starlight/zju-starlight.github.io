---
title: 星弦辅助终端
hide:
  - navigation
  - toc
---

<div class="terminal-page">
  <header class="terminal-page-heading"><a class="game-back" href="../">← 在线体验</a><span class="eyebrow">SSSSFC / FIELD TERMINAL</span><h1>星弦辅助终端</h1><p>接通信道。查阅档案，或走进一次未知的调查。</p></header>
  <section class="terminal-app" data-terminal aria-label="星弦辅助终端">
    <div class="terminal-access" id="terminal-access">
      <div class="terminal-access-heading"><img src="../../static/img/terminal/emblem.png" alt="" width="76" height="76"><span class="terminal-kicker">SSSSFC / ACCESS REQUIRED</span><h2>接入辅助终端</h2><p>输入自己的 DeepSeek API Key，开启本次会话。</p></div>
      <form class="terminal-auth" id="terminal-auth" autocomplete="off"><label for="terminal-secret">自己的 DeepSeek API Key</label><div class="terminal-auth-row"><div class="terminal-secret-field"><input id="terminal-secret" type="text" inputmode="text" maxlength="512" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="sk-…" aria-describedby="terminal-auth-help" required disabled><button type="button" data-action="secret-visibility" aria-controls="terminal-secret" aria-label="隐藏 API Key" disabled>隐藏</button></div><button type="submit" disabled>进入终端 ↗</button></div><p id="terminal-auth-help">请填写自己的 DeepSeek API Key，输入后可点“隐藏”。API Key 仅保留到离开本页；聊天内容会发送给 DeepSeek，首次对话时验证连接。</p><p data-auth-message role="status">正在启动……</p><div class="terminal-auth-actions"><button type="button" data-action="cancel-auth" hidden>返回对话</button><button type="button" data-action="disconnect" hidden>断开并退出会话</button></div></form>
      <p class="terminal-access-foot">STAR STRING · ANOMALY INVESTIGATION</p>
    </div>
    <div class="terminal-shell" hidden>
      <header class="terminal-bar"><div class="terminal-brand"><span class="terminal-signal" aria-hidden="true"></span><strong>SSSSFC<span>辅助终端 / WEB</span></strong></div><div class="terminal-controls"><button type="button" data-action="credentials" aria-expanded="true" aria-controls="terminal-access">连接设置</button><button type="button" data-action="sound" aria-pressed="false">音效：关</button><button type="button" data-action="reset">重启</button></div></header>
      <div class="terminal-telemetry"><span data-connection>等待接入</span><span data-scene>待命</span><span class="terminal-channel">CH / 07</span></div>
      <div class="terminal-log" tabindex="0" role="region" aria-label="终端对话记录" data-log><p class="terminal-loading">正在启动辅助终端……</p></div>
      <div class="terminal-quick" role="group" aria-label="快捷指令"><button type="button" data-command="开始异常调查">异常调查 <span>↗</span></button><button type="button" data-command="介绍一下星弦科幻协会">认识星弦 <span>↗</span></button><button type="button" data-command="如何申请活动场地">办事查询 <span>↗</span></button><button type="button" data-command="掷骰 1d20">掷骰 <span>◇</span></button><button type="button" data-command="猜灯谜">灯谜 <span>✦</span></button></div>
      <form class="terminal-compose" autocomplete="off"><label for="terminal-input" class="terminal-sr-only">输入消息或本地指令</label><div class="terminal-input-row"><span aria-hidden="true">›</span><textarea id="terminal-input" rows="2" maxlength="4000" enterkeyhint="send" placeholder="输入消息，或试试：掷骰 3d6" disabled></textarea><button type="submit" data-send disabled>发送 ↗</button><button type="button" data-action="stop" hidden>停止</button></div><div class="terminal-compose-meta"><span data-status role="status" aria-live="polite">正在启动</span><span class="terminal-enter-hint">Enter 发送 · Shift + Enter 换行</span></div></form>
    </div>
    <div class="terminal-overlay" hidden><section class="terminal-dialog" role="dialog" aria-labelledby="terminal-dialog-title"><div class="terminal-dialog-heading"><h2 id="terminal-dialog-title"></h2><button type="button" data-action="close-overlay" aria-label="关闭面板">×</button></div><div data-overlay-body></div></section></div>
    <noscript><p class="terminal-noscript">请启用 JavaScript 使用终端。也可以直接阅读<a href="../../club/">社团介绍</a>与<a href="../../handbook/">办事手册</a>。</p></noscript>
  </section>
  <div class="terminal-notes"><details><summary>使用说明与资料来源</summary><p>每次进入终端，须先输入自己的 DeepSeek API Key；完成接入后，本页会话中无需重复输入。API Key 的有效性在首次聊天时由服务商确认。掷骰和灯谜在进入终端后由本地程序处理，不产生 AI 请求。</p><p>输入“掷骰 3d6”可投掷三颗六面骰，支持 1–100 颗、每颗 2–1,000,000 面。灯谜支持“提示”“答案”“下一题”和“退出灯谜”，也可直接点击面板按钮。终端灯谜进度仅保留到离开页面，不影响<a href="../lanterns/">科幻灯谜专页</a>的存档。</p><p>异常剧情属于虚构。社团咨询和办事查询使用原终端 v1.7 的资料快照（2026-10-05 提取），不代表信息已更新或核验；最新安排请查看<a href="../../events/">活动公告</a>和<a href="../../handbook/">办事手册</a>。重启会清空对话与本轮灯谜，保留本页已输入的凭据；断开会清除凭据并返回认证页。离开或刷新页面后需重新接入。</p></details><a href="../../">返回北门观测站 ↗</a></div>
</div>
