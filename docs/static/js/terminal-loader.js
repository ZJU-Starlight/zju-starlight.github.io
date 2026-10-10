/* Material's instant navigation does not reload global scripts. */
(() => {
  if (window.__starlightTerminalInstalled) return;
  window.__starlightTerminalInstalled = true;
  const moduleURL = new URL('terminal.js', document.currentScript.src);
  let root = null;
  let dispose = null;
  let generation = 0;

  async function initialize() {
    const next = document.querySelector('[data-terminal]');
    if (next === root) return;
    dispose?.();
    dispose = null;
    root = next;
    const current = ++generation;
    if (!next) return;
    try {
      const { mountTerminal } = await import(moduleURL.href);
      if (current !== generation || !next.isConnected) return;
      dispose = mountTerminal(next, window.STARLIGHT_RIDDLES || []);
    } catch {
      if (current !== generation) return;
      const log = next.querySelector('[data-log]');
      log.replaceChildren(document.createTextNode('终端加载失败，请刷新页面重试。'));
      next.querySelector('[data-auth-message]').textContent = '终端加载失败，请刷新页面重试。';
      next.querySelector('[data-status]').textContent = '加载失败';
    }
  }
  if (typeof document$ !== 'undefined') document$.subscribe(initialize);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
  window.addEventListener('pagehide', () => { dispose?.(); dispose = null; root = null; generation++; });
  window.addEventListener('pageshow', initialize);
})();
