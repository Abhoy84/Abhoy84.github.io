/* =========================================================
   hot-reload.js: the editor + terminal in the hero.
   Press r to "hot reload" the profile card, R to restart.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const term = document.getElementById('terminal');
  const card = document.getElementById('profile-card');
  const greetingOut = document.getElementById('greeting');
  const swatch = document.getElementById('swatch');
  const srStatus = document.getElementById('sr-status');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!term || !card) return;

  const edits = {
    accent: document.querySelector('[data-edit="accent"]'),
    greeting: document.querySelector('[data-edit="greeting"]'),
  };
  const DEFAULTS = {
    accent: edits.accent.textContent.trim(),
    greeting: edits.greeting.textContent.trim(),
  };
  const NAMES = { android: 'Android', ios: 'iOS', windows: 'Windows', macos: 'macOS' };
  const ARTIFACT = {
    android: 'build/app/outputs/bundle/release/app-release.aab',
    ios: 'build/ios/ipa/portfolio.ipa',
    windows: 'build\\windows\\x64\\runner\\Release\\portfolio.exe',
    macos: 'build/macos/Build/Products/Release/portfolio.app',
  };

  /* ---------- Editable values ---------- */
  Object.values(edits).forEach((el) => {
    try { el.contentEditable = 'plaintext-only'; } catch (e) { el.contentEditable = 'true'; }
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); hotReload(); }
    });
    el.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\s+/g, ' ');
      document.execCommand('insertText', false, text);
    });
  });
  edits.accent.addEventListener('input', previewSwatch);

  function clean(text) { return text.replace(/\s+/g, ' ').trim(); }

  function parseHex(text) {
    const value = clean(text).replace(/^#/, '').replace(/^0x(ff)?/i, '');
    return /^[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : null;
  }

  function previewSwatch() {
    const hex = parseHex(edits.accent.textContent);
    if (hex) swatch.style.setProperty('--swatch', '#' + hex);
  }
  previewSwatch();

  /* ---------- Terminal (types line by line) ---------- */
  const queue = [];
  let busy = false;

  function log(text, kind = '') {
    queue.push({ text, kind });
    if (!busy) pump();
  }

  function pump() {
    const item = queue.shift();
    if (!item) { busy = false; return; }
    busy = true;

    const line = document.createElement('div');
    line.className = 'tl ' + item.kind;
    term.append(line);

    // Trim old lines so the log never grows forever
    while (term.children.length > 80) term.firstElementChild.remove();

    if (reduceMotion.matches || document.hidden) {
      line.textContent = item.text;
      scrollDown();
      setTimeout(pump, 20);
      return;
    }

    const isCommand = item.kind.includes('cmd');
    const speed = isCommand ? 26 : 5;
    let i = 0;
    line.classList.add('typing');
    (function step() {
      i += isCommand ? 1 : 3;
      line.textContent = item.text.slice(0, i);
      scrollDown();
      if (i < item.text.length) {
        setTimeout(step, speed);
      } else {
        line.classList.remove('typing');
        setTimeout(pump, isCommand ? 260 : 80);
      }
    })();
  }

  function scrollDown() { term.scrollTop = term.scrollHeight; }

  function announce(message) {
    if (!srStatus) return;
    srStatus.textContent = '';
    setTimeout(() => { srStatus.textContent = message; }, 30);
  }

  function flash(kind) {
    card.classList.remove('flash-ok', 'flash-err');
    void card.offsetWidth; // restart the animation
    card.classList.add('flash-' + kind);
  }

  const rand = (min, max) => Math.round(min + Math.random() * (max - min));

  /* ---------- Hot reload / restart ---------- */
  function hotReload() {
    log('r', 'cmd');
    log('Performing hot reload...', 'dim');

    const hex = parseHex(edits.accent.textContent);
    if (!hex) {
      log(`lib/main.dart:12: Error: '${clean(edits.accent.textContent).slice(0, 20)}' is not a valid colour. Use 6 hex digits, e.g. 13B9A5.`, 'err');
      flash('err');
      announce('Hot reload failed: the accent colour must be six hex digits.');
      return;
    }

    const greeting = clean(edits.greeting.textContent).slice(0, 60) || DEFAULTS.greeting;
    card.style.setProperty('--card-accent', '#' + hex);
    greetingOut.textContent = greeting;
    previewSwatch();

    log(`Reloaded 1 of 614 libraries in ${rand(140, 320)}ms (compile: ${rand(30, 70)} ms, reload: ${rand(60, 120)} ms, reassemble: ${rand(40, 90)} ms).`, 'ok');
    flash('ok');
    announce('Hot reload complete. The profile card was updated.');
  }

  function hotRestart() {
    edits.accent.textContent = DEFAULTS.accent;
    edits.greeting.textContent = DEFAULTS.greeting;
    card.style.removeProperty('--card-accent');
    greetingOut.textContent = DEFAULTS.greeting;
    previewSwatch();

    log('R', 'cmd');
    log('Performing hot restart...', 'dim');
    log(`Restarted application in ${rand(420, 780)}ms.`, 'ok');
    flash('ok');
    announce('Hot restart complete. Values were reset.');
  }

  document.getElementById('hot-reload').addEventListener('click', hotReload);
  document.getElementById('hot-restart').addEventListener('click', hotRestart);

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (document.querySelector('dialog[open]')) return;
    if (root.matches('[data-recruiter]')) return;
    if (e.key === 'r') hotReload();
    else if (e.key === 'R') hotRestart();
  });

  /* ---------- React to platform changes ---------- */
  document.addEventListener('platformchange', (e) => {
    const { platform, build } = e.detail;
    log(build, 'cmd');
    log(`✓ Built ${ARTIFACT[platform]}`, 'ok');
    log(`Now running on ${NAMES[platform]}. Same code, new platform.`, 'info');
  });

  /* ---------- Boot sequence ---------- */
  function boot() {
    const p = root.dataset.platform;
    const device = NAMES[p] || 'Windows';
    log(`flutter run -d ${p}`, 'cmd');
    log(`Launching lib/main.dart on ${device} in debug mode...`, 'dim');
    log(`✓ Built portfolio for ${device}.`, 'ok');
    log('[2024-05]  Joined Solution Infotech as Flutter Developer', 'info');
    log('[shipped]  30+ white-label apps · 20,000+ active users', 'info');
    log('[deploy]   Google Play · App Store · Microsoft Store · Mac App Store', 'info');
    log('Flutter run key commands:  r Hot reload  ·  R Hot restart', 'dim');
  }

  setTimeout(boot, 500);
})();
