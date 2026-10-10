/* Pure protocol and local-tool logic; shared by the UI and Node tests. */
export const API = Object.freeze({
  url: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-flash',
  timeout: 60000,
});

export function normalizeAnswer(value) {
  return String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

export function matchesRiddle(riddle, answer) {
  const normalized = normalizeAnswer(answer);
  return Boolean(normalized) && [riddle.answer, riddle.sourceAnswer, ...(riddle.aliases || [])]
    .filter(Boolean).some(value => normalizeAnswer(value) === normalized);
}

export function parseDice(value) {
  const text = value.trim().normalize('NFKC');
  const explicit = /^(?:掷骰|投骰|骰子|熵池检测|熵池判定|\/roll)(?:\s|\d|d|$)/i.test(text);
  const expression = text.replace(/^(?:掷骰|投骰|骰子|熵池检测|熵池判定|\/roll)\s*/i, '').trim();
  const match = /^(\d*)d(\d+)$/i.exec(expression || (explicit ? '1d20' : ''));
  if (!match) {
    if (explicit) throw new Error('请使用“掷骰 3d6”这样的格式。');
    return null;
  }
  const count = Number(match[1] || 1);
  const sides = Number(match[2]);
  if (!Number.isSafeInteger(count) || !Number.isSafeInteger(sides) || count < 1 || count > 100 || sides < 2 || sides > 1000000) {
    throw new Error('支持 1–100 颗骰子，每颗 2–1,000,000 面。');
  }
  return { count, sides, notation: `${count}d${sides}` };
}

export function rollDice({ count, sides }, random = Math.random) {
  const values = Array.from({ length: count }, () => Math.floor(random() * sides) + 1);
  return { values, total: values.reduce((sum, value) => sum + value, 0) };
}

export function chooseContext(text, previous = 'roleplay', invaded = false) {
  if (invaded) return 'roleplay';
  if (/异常|调查组|收容|入侵|角色扮演|看板娘|星弦号|天苑四|呼叫星弦|星弦求助|星弦支援/.test(text)) return 'roleplay';
  if (/宝典|手册|办事|报销|经费|场地|教室|申请|审批|二课|财务|结项|LED|帮推|推文|换届|交接/i.test(text)) return 'handbook';
  if (/科幻协会|社团|加入星弦|认识星弦|介绍.*星弦|纳新|招新|入社|负责人|部门|活动|工作室|星弦是/.test(text)) return 'club';
  return previous;
}

export function interventionChance({ active, forced, rounds }) {
  if (!active || forced || rounds < 4) return 0;
  if (rounds >= 10) return 1;
  if (rounds >= 8) return .75;
  if (rounds >= 6) return .5;
  return .25;
}

export function trackAnomaly(state, reply) {
  const corrupt = /\[corrupt\]/i.test(reply);
  const blue = [...reply.matchAll(/\[blue\]([\s\S]*?)\[\/blue\]/gi)].map(match => match[1]).join('\n');
  if (!corrupt && /收容完成|收容成功|告别|再见|恢复|压制完成/.test(blue)) return { active: false, forced: false, rounds: 0 };
  const active = state.active || corrupt;
  return { ...state, active, rounds: active ? state.rounds + 1 : 0 };
}

export function detectAction(text) {
  const match = /\[roll\s+([^\]\n]+)\]|\[terminate\]/i.exec(text);
  if (!match) return null;
  return { type: match[1] === undefined ? 'terminate' : 'roll', expression: match[1], end: match.index + match[0].length };
}

export function buildMessages(knowledge, context, history, input, intervene = false) {
  const base = knowledge.bases[context];
  const messages = [
    { role: 'system', content: `${knowledge.prompts[context]}\n\n【参考资料：${base.title}】\n${base.content}` },
    ...history.slice(-40),
    { role: 'user', content: input },
  ];
  if (intervene) messages.push({ role: 'system', content: '[星弦强制介入] 异常持续多轮，星弦现在强行接入信道。请使用 [blue]...[/blue] 回应，依据玩家实际行动判断压制或收容进度，不凭空宣告完成。' });
  return messages;
}

export function requestBody(messages) {
  return { model: API.model, messages, stream: true, thinking: { type: 'disabled' }, temperature: .8, max_tokens: 4000 };
}

export function httpError(status) {
  const messages = {
    400: '请求未被接受，请检查当前服务配置。',
    401: '凭据无效或已过期，请重新接入。',
    402: '服务商账户余额不足，请更换凭据或充值后重试。',
    403: '该凭据无权使用此服务，请更换凭据。',
    404: '服务或模型暂不可用，请稍后重试。',
    429: '请求过于频繁，请稍后重试。',
  };
  return new Error(messages[status] || (status >= 500 ? 'AI 服务暂时不可用，请稍后重试。' : `连接失败（HTTP ${status}）。`));
}

// Parse complete SSE events, even when UTF-8 codepoints or CRLF delimiters span chunks.
// A protocol action stops consumption immediately; predictions after a roll are discarded.
export async function readCompletion(stream, { signal, onText = () => {} } = {}) {
  if (!stream) throw new Error('服务没有返回可读取的消息流。');
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  let complete = false;
  let action = null;
  let finishReason = null;
  const abort = () => { reader.cancel().catch(() => {}); };
  signal?.addEventListener('abort', abort, { once: true });
  const checkAbort = () => { if (signal?.aborted) throw signal.reason || new DOMException('Aborted', 'AbortError'); };

  function consume(event) {
    const data = event.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).replace(/^ /, '')).join('\n');
    if (!data.trim()) return;
    if (data.trim() === '[DONE]') { complete = true; return; }
    let value;
    try { value = JSON.parse(data); } catch { throw new Error('收到的消息流格式不完整，请重试。'); }
    if (value.error) throw new Error('AI 服务中断了本次回复，请重试。');
    const choice = value.choices?.[0];
    const delta = choice?.delta?.content;
    if (typeof delta === 'string') {
      full += delta;
      if (full.length > 64000) throw new Error('回复过长，本次连接已停止。');
      action = detectAction(full);
      if (action) full = full.slice(0, action.end);
      onText(full);
    }
    if (choice?.finish_reason) finishReason = choice.finish_reason;
  }

  try {
    checkAbort();
    while (!complete && !action) {
      const { done, value } = await reader.read();
      checkAbort();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let match;
      while (!complete && !action && (match = /\r?\n\r?\n/.exec(buffer))) {
        const event = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        consume(event);
      }
      if (buffer.length > 128000) throw new Error('消息流格式异常，请重试。');
      if (done) {
        if (!complete && !action && buffer.trim()) consume(buffer);
        break;
      }
    }
    if (!action && finishReason && finishReason !== 'stop') throw new Error('回复未完整生成，请缩短问题后重试。');
    if (!action && !complete && finishReason !== 'stop') throw new Error('连接提前结束，回复未完成，请重试。');
    if (!full.trim()) throw new Error('AI 返回了空回复，请重试。');
    return { text: full, action };
  } finally {
    signal?.removeEventListener('abort', abort);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
