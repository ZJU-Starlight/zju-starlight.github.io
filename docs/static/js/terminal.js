import {
  API, matchesRiddle, parseDice, rollDice, chooseContext, interventionChance,
  trackAnomaly, buildMessages, requestBody, httpError, readCompletion,
} from './terminal-core.js';

const media = name => new URL(`../img/terminal/${name}`, import.meta.url).href;
const scenes = { roleplay: '异常调查 · 虚构剧情', club: '社团咨询 · 资料快照', handbook: '办事查询 · 资料快照' };
const stickers = {
  warn: '⚠ 异常信号', alert: '● 收容失效', clear: '✓ 事项完成', seal: '◆ SSSSFC 机密印鉴',
  star: '✦ 星弦共鸣', glitch: '▓ 传输异常', lock: '◇ 安全信道',
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, action, className = '') {
  const node = element('button', className, text);
  node.type = 'button';
  if (action) node.dataset.action = action;
  return node;
}

// All untrusted output becomes text nodes. Only these formatting tokens create elements.
export function renderReply(target, text) {
  const fragment = document.createDocumentFragment();
  const stack = [{ name: '', node: fragment }];
  const pattern = /\[(\/?)(corrupt|blue)\]|\[sticker:([a-z_]+)\]|\[(?:roll\s+[^\]]*|terminate|\/?riddle)\]|\[(?:img|audio):[^\]]*\]|\*\*([^*\n]+)\*\*|`([^`\n]+)`/gi;
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    let parent = stack[stack.length - 1].node;
    parent.append(document.createTextNode(text.slice(offset, match.index)));
    offset = match.index + match[0].length;
    if (match[2]) {
      const name = match[2].toLowerCase();
      if (match[1]) {
        if (stack[stack.length - 1].name === name) stack.pop();
      } else {
        const span = element('span', `terminal-${name}`);
        parent.append(span);
        stack.push({ name, node: span });
      }
    } else if (match[3]) {
      const name = match[3].toLowerCase();
      if (name === 'studio_qr') {
        const qr = element('img', 'terminal-qr');
        qr.src = media('studio-qr.png');
        qr.alt = '原终端收录的星弦工作室二维码';
        qr.loading = 'lazy';
        const link = element('a');
        link.href = qr.src;
        link.target = '_blank';
        link.rel = 'noopener';
        link.title = '打开二维码原图';
        link.append(qr);
        parent.append(link);
      } else if (stickers[name]) parent.append(element('span', `terminal-sticker terminal-sticker-${name}`, stickers[name]));
    } else if (match[4]) parent.append(element('strong', '', match[4]));
    else if (match[5]) parent.append(element('code', '', match[5]));
  }
  stack[stack.length - 1].node.append(document.createTextNode(text.slice(offset)));
  target.replaceChildren(fragment);
}

export function mountTerminal(root, riddles) {
  const $ = selector => root.querySelector(selector);
  const life = new AbortController();
  const shell = $('.terminal-shell');
  const access = $('.terminal-access');
  const log = $('[data-log]');
  const input = $('#terminal-input');
  const auth = $('.terminal-auth');
  const secret = $('#terminal-secret');
  const overlay = $('.terminal-overlay');
  const overlayBody = $('[data-overlay-body]');
  const closeButton = $('[data-action="close-overlay"]');
  let alive = true;
  let busy = false;
  let operation = null;
  let knowledge = null;
  let apiKey = '';
  let secretComposing = false;
  let connected = false;
  let locked = false;
  let context = 'roleplay';
  let histories = { roleplay: [], club: [], handbook: [] };
  let anomaly = { active: false, forced: false, rounds: 0 };
  let riddleMode = false;
  let deck = [];
  let riddleIndex = -1;
  let revealed = false;
  let solved = false;
  let hintShown = false;
  let previousFocus = null;
  let sound = false;
  let audio = null;
  let retryCounter = 0;
  const retries = new Map();
  const listen = (node, type, handler) => node.addEventListener(type, handler, { signal: life.signal });

  function announce(text) { if (alive) $('[data-status]').textContent = text; }

  function sync() {
    if (!alive) return;
    root.classList.toggle('terminal-is-busy', busy);
    root.classList.toggle('terminal-is-invaded', anomaly.active);
    const needsCredential = !apiKey;
    input.disabled = busy || locked || needsCredential;
    $('[data-send]').disabled = busy || locked || needsCredential;
    $('[data-send]').hidden = busy;
    $('[data-action="stop"]').hidden = !busy;
    for (const node of root.querySelectorAll('[data-command], [data-retry], [data-action="credentials"]')) node.disabled = busy || locked || needsCredential;
    for (const node of root.querySelectorAll('[data-action="sound"], [data-action="reset"]')) node.disabled = locked || needsCredential;
    for (const node of auth.querySelectorAll('button')) node.disabled = busy;
    secret.disabled = busy;
    auth.querySelector('button[type="submit"]').textContent = busy ? '正在接入……' : '进入终端 ↗';
    $('[data-action="disconnect"]').hidden = !apiKey;
    $('[data-action="cancel-auth"]').hidden = !apiKey;
    $('[data-connection]').textContent = connected ? 'AI 已连接' : apiKey ? '凭据已就绪 · 待连接' : '等待接入';
    $('[data-scene]').textContent = riddleMode ? '本地灯谜' : histories[context].length ? scenes[context] : '待命';
    $('[data-action="sound"]').textContent = `音效：${sound ? '开' : '关'}`;
    $('[data-action="sound"]').setAttribute('aria-pressed', String(sound));
    root.dataset.connection = connected ? 'connected' : apiKey ? 'ready' : 'locked';
  }

  function scrollToBottom() { log.scrollTop = log.scrollHeight; }

  function message(kind, text = '') {
    const row = element('article', `terminal-message terminal-message-${kind}`);
    const label = element('div', 'terminal-message-label', { user: 'YOU / 调查员', assistant: 'SSSSFC / 终端', local: 'LOCAL / 本地工具', error: 'SIGNAL / 连接提示' }[kind]);
    const content = element('div', 'terminal-message-content');
    if (kind === 'assistant') renderReply(content, text);
    else content.textContent = text;
    row.append(label, content);
    log.append(row);
    scrollToBottom();
    return { row, content, label };
  }

  function clearRetries() {
    retries.clear();
    log.querySelectorAll('[data-retry]').forEach(node => node.remove());
  }

  function welcome() {
    log.replaceChildren();
    const card = element('div', 'terminal-welcome');
    const emblem = element('img', 'terminal-emblem');
    emblem.src = media('emblem.png');
    emblem.alt = '';
    emblem.width = 88;
    emblem.height = 88;
    const copy = element('div', 'terminal-welcome-copy');
    copy.append(element('span', 'terminal-kicker', 'NORTH GATE · CHANNEL 07'), element('h2', '', '信道已开启。'), element('p', '', '欢迎，调查员。\n你可以查阅星弦的资料，也可以接入异常调查。'));
    card.append(emblem, copy);
    const foot = element('div', 'terminal-welcome-foot');
    foot.append(element('span', '', '◇ 掷骰 / ✦ 灯谜'), element('span', '', '本地工具已就绪'));
    log.append(card, foot);
    announce(apiKey ? '本次会话已接入，可直接聊天或使用工具' : '请先输入自己的 DeepSeek API Key');
  }

  function setSecretHidden(hidden) {
    secret.type = hidden ? 'password' : 'text';
    const control = $('[data-action="secret-visibility"]');
    control.textContent = hidden ? '显示' : '隐藏';
    control.setAttribute('aria-label', `${hidden ? '显示' : '隐藏'} API Key`);
  }

  function toggleAuth(show = access.hidden) {
    if (!apiKey) show = true;
    access.hidden = !show;
    shell.hidden = show;
    $('[data-action="credentials"]').setAttribute('aria-expanded', String(show));
    if (show) {
      if (!secret.value) setSecretHidden(false);
      secret.focus({ preventScroll: true });
    } else {
      secret.value = '';
      secretComposing = false;
    }
  }

  function openOverlay(title, nodes, type = 'tool') {
    if (overlay.hidden) previousFocus = document.activeElement;
    $('#terminal-dialog-title').textContent = title;
    overlay.dataset.kind = type;
    overlayBody.replaceChildren(...nodes);
    overlay.hidden = false;
    shell.inert = true;
    closeButton.hidden = type === 'terminated';
    const focus = (type === 'riddle' && overlay.querySelector('input:not(:disabled)')) || overlay.querySelector('button:not([hidden]):not(:disabled)');
    focus?.focus({ preventScroll: true });
  }

  function closeOverlay() {
    if (locked) return;
    overlay.hidden = true;
    overlayBody.replaceChildren();
    shell.inert = false;
    if (previousFocus?.isConnected && !previousFocus.disabled) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  }

  function beep(frequency = 440) {
    if (!sound || !audio || audio.state !== 'running') return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.025, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .13);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + .14);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }

  async function toggleSound() {
    sound = !sound;
    if (sound) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audio ||= new AudioContext();
        await audio.resume();
        if (!alive) { await audio.close(); return; }
        beep(620);
      } catch { sound = false; announce('此浏览器暂不支持音效'); }
    } else await audio?.suspend().catch(() => {});
    sync();
  }

  async function start(work) {
    if (!alive || busy || locked) return;
    const controller = new AbortController();
    operation = controller;
    busy = true;
    sync();
    try {
      await work(controller.signal);
    } catch (error) {
      if (!alive || operation !== controller) return;
      if (controller.signal.aborted) announce('操作已停止');
      else { message('error', error.message || '操作失败，请重试。'); announce('操作失败'); }
    } finally {
      if (alive && operation === controller) {
        operation = null;
        busy = false;
        sync();
      }
    }
  }

  async function loadKnowledge(signal) {
    if (knowledge) return knowledge;
    const response = await fetch(new URL('../data/terminal-knowledge.json', import.meta.url), { signal });
    if (!response.ok) throw new Error('资料加载失败，请重试。');
    const value = await response.json();
    if (alive && !signal.aborted) knowledge = value;
    return value;
  }

  function resetConversation() {
    operation?.abort();
    operation = null;
    busy = false;
    locked = false;
    histories = { roleplay: [], club: [], handbook: [] };
    anomaly = { active: false, forced: false, rounds: 0 };
    context = 'roleplay';
    riddleMode = false;
    deck = [];
    riddleIndex = -1;
    clearRetries();
    closeOverlay();
    input.value = '';
    welcome();
    toggleAuth(!apiKey);
    sync();
  }

  function useCredential(signal) {
    let value = secret.value.trim();
    secret.value = '';
    if (!value) return;
    const authMessage = $('[data-auth-message]');
    authMessage.textContent = '正在读取凭据……';
    try {
      if (!alive || signal.aborted) return;
      if (!/^sk-\S+$/.test(value)) throw new Error('请输入以 sk- 开头且不含空格的 DeepSeek API Key。');
      apiKey = value;
      connected = false;
      clearRetries();
      histories = { roleplay: [], club: [], handbook: [] };
      anomaly = { active: false, forced: false, rounds: 0 };
      authMessage.textContent = '';
      toggleAuth(false);
      announce('本次会话已接入，可连续对话；首次发送时验证连接');
    } catch (error) {
      if (alive && !signal.aborted) authMessage.textContent = error.message;
    } finally { value = ''; }
  }

  async function animateDice(dice, signal, npc = false) {
    const result = rollDice(dice);
    const display = element('div', 'terminal-dice-total', '···');
    const label = element('p', 'terminal-dice-caption', `${npc ? 'NPC 判定' : '熵池检测'} / ${dice.notation}`);
    const grid = element('div', 'terminal-dice-grid');
    const footer = element('p', 'terminal-panel-note', '正在投掷……');
    openOverlay('熵池判定', [label, display, grid, footer]);
    announce('正在掷骰');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await new Promise((resolve, reject) => {
      const finish = () => { signal.removeEventListener('abort', cancel); resolve(); };
      const timer = setTimeout(finish, reduced ? 0 : 550);
      const cancel = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
      signal.addEventListener('abort', cancel, { once: true });
      if (signal.aborted) cancel();
    });
    if (!alive || signal.aborted) throw new DOMException('Aborted', 'AbortError');
    display.textContent = String(result.total);
    result.values.forEach(value => grid.append(element('span', '', String(value))));
    footer.textContent = `${result.values.length} 颗骰子 · 总和 ${result.total}`;
    const summary = `${npc ? 'NPC' : '调查员'}掷骰 ${dice.notation}：${result.values.join('、')}；总和 ${result.total}。`;
    message('local', summary);
    beep(520);
    announce(`掷骰完成，总和 ${result.total}`);
    return summary;
  }

  function shuffleRiddles() {
    deck = [...riddles];
    for (let index = deck.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [deck[index], deck[other]] = [deck[other], deck[index]];
    }
    riddleIndex = -1;
  }

  function showRiddle() {
    const riddle = deck[riddleIndex];
    if (!riddle) return;
    const kicker = element('p', 'terminal-riddle-count', `第 ${riddleIndex + 1} / ${deck.length} 题 · ${riddle.category}`);
    const clue = element('p', 'terminal-riddle-clue', riddle.clue);
    const target = element('p', 'terminal-riddle-target', riddle.target);
    const form = element('form', 'terminal-riddle-form');
    const label = element('label', '', '你的谜底');
    label.htmlFor = 'terminal-riddle-answer';
    const guess = element('input');
    guess.id = 'terminal-riddle-answer';
    guess.maxLength = 100;
    guess.autocomplete = 'off';
    guess.placeholder = '输入答案';
    guess.disabled = solved || revealed;
    const submit = button('确认谜底');
    submit.type = 'submit';
    submit.disabled = solved || revealed;
    form.append(label, guess, submit);
    const feedback = element('p', 'terminal-riddle-feedback', solved ? `答对了！谜底：${riddle.answer}` : revealed ? `谜底：${riddle.answer}` : '不计时，慢慢猜。');
    feedback.setAttribute('role', 'status');
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (guess.value.trim()) guessRiddle(guess.value.trim(), feedback, guess, submit);
    });
    const tools = element('div', 'terminal-panel-actions');
    tools.append(button('一点提示', 'riddle-hint'), button('揭晓谜底', 'riddle-answer'), button('下一题 →', 'riddle-next'), button('退出灯谜', 'riddle-exit'));
    const hint = element('p', 'terminal-riddle-hint', hintShown ? riddle.hint : '');
    hint.hidden = !hintShown;
    const note = element('p', 'terminal-panel-note', (solved || revealed) ? riddle.note : '');
    openOverlay('科幻灯谜', [kicker, clue, target, form, feedback, hint, note, tools], 'riddle');
    overlay.dataset.riddleId = riddle.id;
  }

  function nextRiddle() {
    if (!deck.length) shuffleRiddles();
    if (riddleIndex + 1 >= deck.length) {
      openOverlay('这一轮已结束', [element('p', '', '24 道谜题都走过了。再开一轮，或去灯谜专页慢慢点亮。'), button('重新猜一轮', 'riddle-restart'), button('退出灯谜', 'riddle-exit')]);
      return;
    }
    riddleIndex++;
    revealed = solved = hintShown = false;
    const riddle = deck[riddleIndex];
    const row = message('local', `灯谜 ${riddleIndex + 1}/${deck.length}\n${riddle.clue}\n${riddle.target}`);
    row.row.append(button('打开当前灯谜', 'riddle-open', 'terminal-inline-button'));
    showRiddle();
    sync();
  }

  function guessRiddle(answer, feedback, guess, submit) {
    if (solved || revealed) { announce('本题已结束，可以切换下一题'); return; }
    const riddle = deck[riddleIndex];
    if (!riddle) return;
    message('user', answer);
    solved = matchesRiddle(riddle, answer);
    const text = solved ? `答对了！谜底：${riddle.answer}${riddle.note ? `\n${riddle.note}` : ''}` : '还不是这个答案，再想想。';
    message('local', text);
    if (feedback) feedback.textContent = text;
    if (solved) {
      if (guess) guess.disabled = true;
      if (submit) submit.disabled = true;
      beep(740);
    }
    announce(solved ? '灯谜答对了' : '再试一次，或查看提示');
  }

  function riddleAction(action) {
    if (!apiKey || busy || locked) return;
    if (!riddleMode && action !== 'riddle-exit') { riddleMode = true; if (!deck.length) shuffleRiddles(); }
    if (action === 'riddle-exit') {
      riddleMode = false;
      closeOverlay();
      announce('已退出灯谜，可继续聊天或使用其他工具');
    } else if (action === 'riddle-restart') {
      shuffleRiddles();
      nextRiddle();
    } else if (action === 'riddle-next' || riddleIndex < 0) nextRiddle();
    else {
      const riddle = deck[riddleIndex];
      if (action === 'riddle-hint') { hintShown = true; message('local', `提示：${riddle.hint}`); }
      if (action === 'riddle-answer' && !solved && !revealed) { revealed = true; message('local', `谜底：${riddle.answer}${riddle.note ? `\n${riddle.note}` : ''}`); }
      showRiddle();
    }
    sync();
  }

  async function aiRound(text, scene, signal, depth = 0, force = undefined) {
    const reply = message('assistant', '正在接收信号……');
    reply.row.classList.add('terminal-streaming');
    const request = new AbortController();
    const stop = () => request.abort(signal.reason);
    signal.addEventListener('abort', stop, { once: true });
    const timer = setTimeout(() => request.abort(new DOMException('Timeout', 'TimeoutError')), API.timeout);
    let received = '';
    let result;
    try {
      if (signal.aborted) stop();
      const data = await loadKnowledge(request.signal);
      if (!alive || signal.aborted) return;
      force ??= scene === 'roleplay' && Math.random() < interventionChance(anomaly);
      announce('正在接收 AI 回复，可随时停止');
      const response = await fetch(API.url, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody(buildMessages(data, scene, histories[scene], text, force))), signal: request.signal,
      });
      if (!response.ok) {
        if ([401, 403].includes(response.status)) { apiKey = ''; connected = false; }
        throw httpError(response.status);
      }
      result = await readCompletion(response.body, {
        signal: request.signal,
        onText(value) {
          if (!alive || signal.aborted) return;
          received = value;
          const pinned = log.scrollHeight - log.scrollTop - log.clientHeight < 100;
          renderReply(reply.content, value);
          if (pinned) scrollToBottom();
        },
      });
    } catch (error) {
      if (!alive || signal.aborted) {
        if (alive) { reply.label.textContent = 'SSSSFC / 已停止 · 未计入对话'; if (!received) reply.content.textContent = '本次回复已停止。'; }
        return;
      }
      connected = false;
      reply.label.textContent = 'SSSSFC / 回复未完成 · 未计入对话';
      if (!received) reply.content.textContent = '本次未收到完整回复。';
      const explanation = request.signal.reason?.name === 'TimeoutError' ? '连接超时，请重试。' : error instanceof TypeError ? '无法连接 AI 服务，请检查网络及服务可用性后重试。' : error.message;
      const notice = message('error', explanation);
      const retry = button('重试本条消息', null, 'terminal-inline-button');
      const id = String(++retryCounter);
      retry.dataset.retry = id;
      notice.row.append(retry);
      retries.set(id, () => {
        if (!apiKey) { input.value = text; toggleAuth(true); announce('请重新接入后再发送消息'); return; }
        reply.row.remove(); notice.row.remove(); retries.delete(id);
        start(nextSignal => aiRound(text, scene, nextSignal, depth, force));
      });
      if (!apiKey) {
        input.value = text;
        $('[data-auth-message]').textContent = explanation;
        closeOverlay();
        toggleAuth(true);
        announce('凭据失效，请重新接入');
      } else announce('连接未完成，可以重试或继续使用本地工具');
      return;
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', stop);
      reply.row.classList.remove('terminal-streaming');
    }
    if (!alive || signal.aborted || !result) return;
    connected = true;
    context = scene;
    histories[scene].push({ role: 'user', content: text }, { role: 'assistant', content: result.text });
    histories[scene] = histories[scene].slice(-40);
    if (scene === 'roleplay') anomaly = trackAnomaly({ ...anomaly, forced: anomaly.forced || force }, result.text);
    reply.label.textContent = `SSSSFC / ${scenes[scene]}`;
    beep(390);
    sync();
    announce('回复已完成');
    if (scene !== 'roleplay' || !result.action) return;
    if (result.action.type === 'terminate') {
      locked = true;
      openOverlay('信道已中断', [element('div', 'terminal-terminated-mark', '■'), element('p', 'terminal-kicker', 'CONNECTION TERMINATED'), element('p', '', '本次调查已终止。重新启动即可建立新的会话。'), button('重新启动', 'restart', 'terminal-primary')], 'terminated');
      announce('终端已锁定，可重新启动');
      sync();
      return;
    }
    if (depth >= 3) { message('local', '本轮已完成三次连续 NPC 判定。请发送下一步行动后继续。'); return; }
    let dice;
    try { dice = parseDice(result.action.expression); } catch { /* Report bad model commands as text. */ }
    if (!dice) { message('local', 'NPC 的骰子格式或范围无效，本次未执行判定。'); return; }
    const summary = await animateDice(dice, signal, true);
    await aiRound(`[NPC真实掷骰结果] ${summary} 请根据这个实际结果继续，不得修改骰点。`, scene, signal, depth + 1);
  }

  async function send(text, quick = false) {
    if (!text.trim() || busy || locked || !alive) return;
    if (!apiKey) { toggleAuth(true); announce('请先输入自己的 DeepSeek API Key'); return; }
    text = text.trim();
    let dice;
    try { dice = parseDice(text); } catch (error) { message('local', error.message); return; }
    const riddleCommands = { 提示: 'riddle-hint', 答案: 'riddle-answer', 揭晓: 'riddle-answer', 下一题: 'riddle-next', 退出灯谜: 'riddle-exit' };
    if (dice || /^(?:猜灯谜|灯谜)$/.test(text) || (riddleMode && riddleCommands[text])) {
      clearRetries(); input.value = '';
      if (dice) {
        message('user', text);
        await start(async signal => {
          const summary = await animateDice(dice, signal);
          if (apiKey && context === 'roleplay' && histories.roleplay.length && !riddleMode) await aiRound(`[玩家真实掷骰结果] ${summary} 请依据结果继续。`, 'roleplay', signal);
        });
      } else if (riddleCommands[text]) riddleAction(riddleCommands[text]);
      else {
        if (!riddles.length) { message('error', '灯谜题库加载失败，请刷新页面。'); return; }
        riddleAction('riddle-open');
      }
      return;
    }
    if (riddleMode && !quick) { input.value = ''; guessRiddle(text); return; }
    riddleMode = false;
    closeOverlay();
    clearRetries(); input.value = '';
    const scene = chooseContext(text, context, anomaly.active);
    message('user', text);
    await start(signal => aiRound(text, scene, signal));
  }

  listen(root, 'click', event => {
    const target = event.target.closest('button');
    if (!target || !root.contains(target) || target.disabled) return;
    if (!apiKey && target.closest('.terminal-shell')) return;
    if (target.dataset.retry) { retries.get(target.dataset.retry)?.(); return; }
    if (target.dataset.command) { send(target.dataset.command, true); return; }
    const action = target.dataset.action;
    if (action === 'credentials') toggleAuth();
    else if (action === 'secret-visibility' && !secretComposing) {
      const { selectionStart, selectionEnd } = secret;
      setSecretHidden(secret.type === 'text');
      secret.focus({ preventScroll: true });
      secret.setSelectionRange(selectionStart, selectionEnd);
    }
    else if (action === 'cancel-auth') toggleAuth(false);
    else if (action === 'sound') toggleSound();
    else if (action === 'close-overlay') closeOverlay();
    else if (action === 'stop') { operation?.abort(); closeOverlay(); announce('操作已停止'); }
    else if (action === 'reset') openOverlay('重新开始调查？', [element('p', '', '清空对话与本轮灯谜。已接入的凭据将保留到离开此页。'), button('保留当前会话', 'close-overlay'), button('清空并重新启动', 'restart', 'terminal-primary')]);
    else if (action === 'restart') resetConversation();
    else if (action === 'disconnect') {
      apiKey = ''; connected = false; resetConversation();
      $('[data-auth-message]').textContent = '';
      toggleAuth(true);
      announce('已断开，请重新输入自己的 DeepSeek API Key');
    } else if (action?.startsWith('riddle-') && !busy && !locked) riddleAction(action);
  });
  listen($('.terminal-compose'), 'submit', event => { event.preventDefault(); send(input.value); });
  listen(secret, 'compositionstart', () => { secretComposing = true; });
  listen(secret, 'compositionend', () => { secretComposing = false; });
  listen(auth, 'submit', event => {
    event.preventDefault();
    if (!secretComposing) start(useCredential);
  });
  listen(auth, 'keydown', event => {
    if (event.isComposing || secretComposing || event.keyCode === 229) {
      if (event.key === 'Enter') event.preventDefault();
      return;
    }
    if (event.key === 'Escape' && apiKey && !busy) { event.preventDefault(); toggleAuth(false); }
  });
  listen(input, 'keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229) { event.preventDefault(); send(input.value); }
  });
  listen(overlay, 'keydown', event => {
    if (event.key === 'Escape' && !locked) { event.preventDefault(); closeOverlay(); }
    if (event.key === 'Tab' && !locked) {
      const focusable = [...overlay.querySelectorAll('button:not([hidden]):not(:disabled), input:not(:disabled), a[href]')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  // Keep the input reachable when a mobile keyboard reduces the visual viewport.
  function fitViewport() {
    if (window.innerWidth > 700 || !window.visualViewport) { root.style.removeProperty('--terminal-height'); root.classList.remove('terminal-compact'); return; }
    const height = Math.max(320, Math.min(740, window.visualViewport.height - 24));
    root.style.setProperty('--terminal-height', `${height}px`);
    root.classList.toggle('terminal-compact', height < 560);
  }
  if (window.visualViewport) listen(window.visualViewport, 'resize', fitViewport);
  listen(window, 'resize', fitViewport);
  fitViewport();
  welcome();
  $('[data-auth-message]').textContent = '';
  sync();
  toggleAuth(true);

  return () => {
    alive = false;
    operation?.abort();
    life.abort();
    apiKey = '';
    secret.value = '';
    input.value = '';
    log.replaceChildren();
    overlayBody.replaceChildren();
    histories = { roleplay: [], club: [], handbook: [] };
    retries.clear();
    knowledge = null;
    sound = false;
    audio?.close().catch(() => {});
    shell.inert = false;
  };
}
