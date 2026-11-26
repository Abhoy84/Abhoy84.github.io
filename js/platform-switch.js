/* =========================================================
   platform-switch.js: Android / iOS / Windows / macOS skins
   Uses the View Transitions API when available, and falls
   back to an instant switch everywhere else.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const PLATFORMS = ['android', 'ios', 'windows', 'macos'];
  const NAMES = { android: 'Android', ios: 'iOS', windows: 'Windows', macos: 'macOS' };
  const BUILD = {
    android: 'flutter build appbundle --release',
    ios: 'flutter build ipa --release',
    windows: 'flutter build windows --release',
    macos: 'flutter build macos --release',
  };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const radios = [...document.querySelectorAll('input[name="platform"]')];
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(command, message) {
    toast.replaceChildren();
    const code = document.createElement('code');
    code.textContent = '$ ' + command;
    const text = document.createElement('span');
    text.textContent = message;
    toast.append(code, text);
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }

  function sync(platform) {
    radios.forEach((r) => { r.checked = r.value === platform; });
    document.querySelectorAll('[data-device-name]').forEach((el) => {
      el.textContent = 'Running on ' + NAMES[platform];
    });
  }

  function setPlatform(platform) {
    if (!PLATFORMS.includes(platform) || platform === root.dataset.platform) return;

    const apply = () => {
      root.dataset.platform = platform;
      sync(platform);
      try { localStorage.setItem('platform', platform); } catch (e) { /* private mode */ }
    };

    if (document.startViewTransition && !reduceMotion.matches) {
      const t = document.startViewTransition(apply);
      [t.ready, t.finished, t.updateCallbackDone].forEach((p) => p && p.catch(() => {}));
    } else {
      apply();
    }

    showToast(BUILD[platform], 'Switched to the ' + NAMES[platform] + ' style');
    document.dispatchEvent(new CustomEvent('platformchange', {
      detail: { platform, name: NAMES[platform], build: BUILD[platform] },
    }));
  }

  radios.forEach((r) => r.addEventListener('change', () => { if (r.checked) setPlatform(r.value); }));
  sync(root.dataset.platform);

  window.Portfolio = Object.assign(window.Portfolio || {}, { setPlatform, PLATFORM_NAMES: NAMES });
})();
