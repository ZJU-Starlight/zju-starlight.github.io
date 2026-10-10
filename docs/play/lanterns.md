---
title: 科幻灯谜
hide:
  - navigation
  - toc
---

<div class="lantern-page" id="lantern-game">
  <header class="lantern-header">
    <div><a class="game-back" href="../">← 在线小游戏</a><span class="eyebrow">STAR STRING / SCI-FI RIDDLES</span><h1>科幻灯谜<span aria-hidden="true">✦</span></h1><p>选一盏灯，让熟悉的宇宙亮起来。<br class="mobile-break">不计时，慢慢猜。</p></div>
    <div class="festival-seal" aria-hidden="true"><span>科幻</span><span>灯谜</span><i>二十四盏</i></div>
  </header>
  <noscript><div class="game-noscript">灯谜需要启用 JavaScript 才能记录答题。你仍可阅读下方的玩法与题目说明。</div></noscript>
  <p id="game-loading" class="game-loading">正在挂起二十四盏灯……</p>
  <div class="festival-app" hidden>
    <div class="festival-stats"><div><span class="stat-star" aria-hidden="true">✦</span><strong id="solved-count">0</strong><span>/ 24 盏已点亮</span></div><p>已揭晓 <strong id="revealed-count">0</strong> 盏</p><span id="save-status">进度仅保存在当前浏览器</span></div>
    <div id="festival-progress" class="festival-progress" role="progressbar" aria-label="自主答对进度" aria-valuemin="0" aria-valuemax="24" aria-valuenow="0"><span></span></div>
    <div class="festival-filters" role="group" aria-label="选择谜题分类"><button type="button" data-category="all" aria-pressed="true">全部灯谜</button><button type="button" data-category="三体宇宙" aria-pressed="false">三体宇宙</button><button type="button" data-category="小说与银幕" aria-pressed="false">小说与银幕</button><button type="button" data-category="科学与奇想" aria-pressed="false">科学与奇想</button></div>
    <div class="festival-layout">
      <section class="riddle-panel" aria-label="当前灯谜">
        <div class="riddle-top"><span id="riddle-number">第 01 盏</span><span id="riddle-category">三体宇宙</span></div>
        <div class="riddle-ornament" aria-hidden="true"><span></span> ✦ <span></span></div>
        <h2 class="riddle-clue" id="riddle-clue" tabindex="-1"></h2>
        <p class="riddle-target" id="riddle-target"></p>
        <form id="riddle-form" autocomplete="off"><label for="riddle-answer">你的谜底</label><div class="answer-row"><input id="riddle-answer" name="answer" type="text" placeholder="把想到的答案写在这里" maxlength="100" enterkeyhint="done" spellcheck="false" aria-describedby="riddle-feedback"><button type="submit" class="answer-submit">点亮这盏灯 <span aria-hidden="true">↗</span></button></div></form>
        <div class="riddle-feedback" id="riddle-feedback" role="status" aria-live="polite"></div>
        <div class="riddle-help"><button type="button" id="hint-button" aria-expanded="false" aria-controls="riddle-hint">给我一点提示</button><button type="button" id="reveal-button">揭晓谜底</button></div>
        <p class="riddle-hint" id="riddle-hint" hidden></p>
        <div class="riddle-solution" id="riddle-solution" hidden><span id="solution-label">谜底</span><strong id="solution-answer"></strong><p id="solution-note"></p></div>
        <nav class="riddle-navigation" aria-label="切换灯谜"><button type="button" id="previous-riddle">← 上一盏</button><button type="button" id="random-riddle">✧ 随缘选灯</button><button type="button" id="next-riddle">下一盏 →</button></nav>
      </section>
      <aside class="lantern-map"><div class="lantern-map-heading"><span class="eyebrow">YOUR CONSTELLATION</span><h2>灯火地图</h2><p>点选一盏，去另一片星空。</p></div><div id="lantern-grid" class="lantern-grid" role="group" aria-label="灯谜选题"></div><div class="map-legend"><span><i class="legend-unseen"></i>待猜</span><span><i class="legend-solved"></i>点亮</span><span><i class="legend-revealed"></i>揭晓</span></div><p class="map-whisper">“宇宙的另一端，<br>也许有人正好猜到了同一个答案。”</p><button type="button" id="reset-progress">重新猜一轮</button></aside>
    </div>
    <div class="festival-complete" id="festival-complete" role="status" hidden><span aria-hidden="true">✦</span><h2>这一片星空，你已经走过。</h2><p id="complete-summary"></p><a href="../../archive/history/anecdotes/">带一个星弦的故事回去 →</a></div>
  </div>
  <div class="festival-about"><details><summary>怎么玩 · 题目从哪里来</summary><p>输入谜底后按回车，或点“点亮这盏灯”。空格、常见标点和英文大小写不影响判定。要求同时猜书名和作家的题，需要把两项都写上。</p><p>不会的题可以看提示、跳过，或直接揭晓。答对会记为“点亮”，主动查看答案会记为“揭晓”；两种记录分别保存。提示不扣分。关闭页面后，可在同一浏览器继续。</p><p>本期 24 道题整理自所提供的《科幻灯谜打印版（改）(含答案）》文档，保留三组题目的顺序与重复谜底。提示由本站补充；原稿中“丁仪（六分仪）”等并列写法已保留说明。谜底以这份活动稿为参考，欢迎继续校订。</p><p>这些灯谜可以随时在线玩，浏览器不会向网站提交你的答案。若浏览器禁止本地存储，仍可在本次打开的页面内游玩。</p></details><a href="../../">返回北门观测站 ↗</a></div>
  <dialog id="reset-dialog" class="reset-dialog"><form method="dialog"><span class="eyebrow">重新出发</span><h2>让灯火回到最初？</h2><p>这会清除当前浏览器的 24 道题目进度。</p><div><button value="cancel" autofocus>保留进度</button><button value="reset" class="confirm-reset">清空并重新开始</button></div></form></dialog>
</div>
