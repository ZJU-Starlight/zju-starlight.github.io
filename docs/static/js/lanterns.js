/* A local-only lantern game; also supports MkDocs Material instant navigation. */
(() => {
  'use strict';
  if (window.__starlightLanternsInstalled) return;
  window.__starlightLanternsInstalled = true;
  const STORAGE_KEY = 'starlight.lanterns.v1';
  const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

  function initialize() {
    const root = document.getElementById('lantern-game');
    if (!root || root.dataset.ready) return;
    const riddles = window.STARLIGHT_RIDDLES;
    if (!Array.isArray(riddles) || riddles.length !== 24) {
      root.querySelector('#game-loading').textContent = '灯谜暂时未能加载，请刷新页面再试一次。';
      return;
    }
    root.dataset.ready = 'true';
    const $ = selector => root.querySelector(selector);
    const ids = new Set(riddles.map(riddle => riddle.id));
    const categories = new Set(['all', ...riddles.map(riddle => riddle.category)]);
    const blank = () => ({version: 1, solved: [], revealed: [], current: riddles[0].id, category: 'all'});
    let state = blank();
    let storageAvailable = true;
    let composing = false;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && saved.version === 1) {
        state.solved = Array.isArray(saved.solved) ? [...new Set(saved.solved.filter(id => ids.has(id)))] : [];
        state.revealed = Array.isArray(saved.revealed) ? [...new Set(saved.revealed.filter(id => ids.has(id) && !state.solved.includes(id)))] : [];
        if (ids.has(saved.current)) state.current = saved.current;
        if (categories.has(saved.category)) state.category = saved.category;
      }
    } catch (error) {
      // Malformed or unavailable storage must not prevent playing.
      if (error.name !== 'SyntaxError') storageAvailable = false;
    }
    const deck = () => riddles.filter(riddle => state.category === 'all' || riddle.category === state.category);
    const current = () => riddles.find(riddle => riddle.id === state.current);
    const status = id => state.solved.includes(id) ? 'solved' : state.revealed.includes(id) ? 'revealed' : 'unseen';
    const feedback = (message, type = '') => {
      $('#riddle-feedback').textContent = message;
      $('#riddle-feedback').className = 'riddle-feedback' + (type ? ' ' + type : '');
    };
    function save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
      catch (_) { storageAvailable = false; }
      $('#save-status').textContent = storageAvailable ? '进度仅保存在当前浏览器' : '当前浏览器无法保存进度，本次仍可游玩';
    }
    function renderMap() {
      const grid = $('#lantern-grid');
      grid.replaceChildren();
      deck().forEach(riddle => {
        const button = document.createElement('button');
        const kind = status(riddle.id);
        const name = {solved: '已点亮', revealed: '已揭晓', unseen: '待猜'}[kind];
        button.type = 'button';
        button.className = 'map-lantern ' + kind;
        button.dataset.id = riddle.id;
        button.setAttribute('aria-label', `第 ${riddle.number} 盏，${name}`);
        button.setAttribute('aria-pressed', String(riddle.id === state.current));
        const number = document.createElement('span');
        number.textContent = String(riddle.number).padStart(2, '0');
        const mark = document.createElement('small');
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = kind === 'solved' ? '✦' : kind === 'revealed' ? '·' : '';
        button.append(number, mark);
        grid.append(button);
      });
    }
    function render() {
      if (!deck().some(riddle => riddle.id === state.current)) state.current = deck()[0].id;
      const riddle = current();
      const kind = status(riddle.id);
      root.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === state.category)));
      $('#riddle-number').textContent = `第 ${String(riddle.number).padStart(2, '0')} 盏 / 24`;
      $('#riddle-category').textContent = riddle.category;
      $('#riddle-clue').textContent = riddle.clue;
      $('#riddle-target').textContent = riddle.target;
      $('#riddle-answer').value = '';
      $('#riddle-answer').removeAttribute('aria-invalid');
      $('#riddle-form').hidden = kind !== 'unseen';
      $('#riddle-hint').hidden = true;
      $('#riddle-hint').textContent = riddle.hint;
      $('#hint-button').setAttribute('aria-expanded', 'false');
      $('.riddle-help').hidden = kind !== 'unseen';
      $('#riddle-solution').hidden = kind === 'unseen';
      $('#solution-label').textContent = kind === 'solved' ? '这盏灯，被你点亮了' : '已揭晓 · 留一份新知识';
      $('#solution-answer').textContent = riddle.answer;
      $('#solution-note').textContent = riddle.note || `原稿谜底：${riddle.sourceAnswer}`;
      $('.riddle-panel').dataset.status = kind;
      $('#solved-count').textContent = state.solved.length;
      $('#revealed-count').textContent = state.revealed.length;
      $('#festival-progress').setAttribute('aria-valuenow', state.solved.length);
      $('#festival-progress > span').style.width = `${state.solved.length / riddles.length * 100}%`;
      $('#festival-complete').hidden = state.solved.length + state.revealed.length !== riddles.length;
      $('#complete-summary').textContent = `24 盏灯，自主点亮 ${state.solved.length} 盏，揭晓 ${state.revealed.length} 盏。谢谢你和这些科幻世界相遇。`;
      renderMap();
      feedback('');
      save();
    }
    function select(id, focus = false) {
      if (!deck().some(riddle => riddle.id === id)) return;
      state.current = id;
      render();
      if (focus) $('#riddle-clue').focus({preventScroll: true});
    }
    function move(direction) {
      const list = deck();
      const index = list.findIndex(riddle => riddle.id === state.current);
      select(list[(index + direction + list.length) % list.length].id);
    }
    $('#riddle-answer').addEventListener('compositionstart', () => { composing = true; });
    $('#riddle-answer').addEventListener('compositionend', () => { composing = false; });
    $('#riddle-form').addEventListener('submit', event => {
      event.preventDefault();
      if (composing || status(state.current) !== 'unseen') return;
      const answer = normalize($('#riddle-answer').value);
      if (!answer) {
        feedback('先写下一个谜底吧。');
        $('#riddle-answer').focus();
        return;
      }
      const riddle = current();
      const accepted = [...riddle.aliases, riddle.answer, riddle.sourceAnswer].map(normalize);
      if (accepted.includes(answer)) {
        state.solved.push(riddle.id);
        render();
        feedback('猜中了。星海里又多了一盏灯。', 'correct');
        $('#next-riddle').focus({preventScroll: true});
      } else {
        $('#riddle-answer').setAttribute('aria-invalid', 'true');
        feedback('还差一点点。换个角度想想，也可以看看提示。', 'try-again');
        $('#riddle-answer').focus();
      }
    });
    $('#riddle-answer').addEventListener('input', () => $('#riddle-answer').removeAttribute('aria-invalid'));
    $('#hint-button').addEventListener('click', () => {
      const show = $('#riddle-hint').hidden;
      $('#riddle-hint').hidden = !show;
      $('#hint-button').setAttribute('aria-expanded', String(show));
    });
    $('#reveal-button').addEventListener('click', () => {
      if (status(state.current) !== 'unseen') return;
      state.revealed.push(state.current);
      render();
      feedback('谜底已揭晓，这一盏单独记为“揭晓”。', 'revealed');
      $('#next-riddle').focus({preventScroll: true});
    });
    $('#lantern-grid').addEventListener('click', event => {
      const button = event.target.closest('[data-id]');
      if (button) select(button.dataset.id, true);
    });
    $('.festival-filters').addEventListener('click', event => {
      const button = event.target.closest('[data-category]');
      if (!button || !categories.has(button.dataset.category)) return;
      state.category = button.dataset.category;
      render();
    });
    $('#previous-riddle').addEventListener('click', () => move(-1));
    $('#next-riddle').addEventListener('click', () => move(1));
    $('#random-riddle').addEventListener('click', () => {
      const unseen = deck().filter(riddle => status(riddle.id) === 'unseen' && riddle.id !== state.current);
      const others = deck().filter(riddle => riddle.id !== state.current);
      const candidates = unseen.length ? unseen : others;
      if (candidates.length) select(candidates[Math.floor(Math.random() * candidates.length)].id);
    });
    $('#reset-progress').addEventListener('click', () => {
      $('#reset-dialog').returnValue = 'cancel';
      $('#reset-dialog').showModal();
    });
    $('#reset-dialog').addEventListener('close', () => {
      if ($('#reset-dialog').returnValue === 'reset') {
        state = blank();
        render();
        feedback('新一轮开始了。慢慢猜，不赶时间。');
        $('#riddle-clue').focus({preventScroll: true});
      }
    });
    $('#game-loading').hidden = true;
    $('.festival-app').hidden = false;
    render();
  }
  if (typeof document$ !== 'undefined') document$.subscribe(initialize);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
