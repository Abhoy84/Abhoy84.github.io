/* =========================================================
   main.js: theme, recruiter mode, clocks, dialogs, counters,
   frame chart, FPS meter, Dynamic Island, contact form.
   Every feature is optional: the page works without JS.
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };
  const withTransition = (fn) => {
    if (document.startViewTransition && !reduceMotion.matches) {
      const t = document.startViewTransition(fn);
      [t.ready, t.finished, t.updateCallbackDone].forEach((p) => p && p.catch(() => {}));
    } else {
      fn();
    }
  };

  /* ---------- Theme ---------- */
  const themeBtn = $('#theme-toggle');
  function syncThemeButton() {
    const dark = root.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
  }
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    withTransition(() => {
      root.dataset.theme = next;
      store.set('theme', next);
      syncThemeButton();
    });
  });
  syncThemeButton();

  /* ---------- Recruiter mode ---------- */
  const recruiter = $('#recruiter');
  recruiter.checked = root.hasAttribute('data-recruiter');
  recruiter.addEventListener('change', () => {
    withTransition(() => {
      root.toggleAttribute('data-recruiter', recruiter.checked);
      store.set('recruiter', recruiter.checked ? '1' : '0');
    });
  });
  $$('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));

  /* ---------- Clocks (status bar, menu bar, taskbar) ---------- */
  function tick() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const long = now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }) + '  ' + time;
    $$('[data-clock="short"]').forEach((el) => { el.textContent = time.replace(/\s?[AP]M$/i, ''); });
    $$('[data-clock="long"]').forEach((el) => { el.textContent = long; });
    $$('[data-clock="tray"]').forEach((el) => { el.textContent = time; });
  }
  tick();
  setInterval(tick, 15000);

  /* ---------- Dynamic Island ---------- */
  const island = $('.island');
  if (island) {
    island.addEventListener('click', () => {
      const open = island.getAttribute('aria-expanded') === 'true';
      island.setAttribute('aria-expanded', String(!open));
    });
    document.addEventListener('click', (e) => {
      if (!island.contains(e.target)) island.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------- Case study dialogs ---------- */
  const startMenu = $('#start-menu');
  $$('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = document.getElementById(btn.dataset.open);
      if (!dialog) return;
      if (startMenu && startMenu.matches(':popover-open')) startMenu.hidePopover();
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });
  });
  $$('dialog.case').forEach((dialog) => {
    // Close when clicking the dimmed backdrop
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  });
  if (startMenu) {
    $$('a', startMenu).forEach((a) => a.addEventListener('click', () => startMenu.hidePopover()));
  }

  /* ---------- Active section in the dock ---------- */
  const navLinks = $$('.dock__item');
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const visible = new Map();
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => visible.set(en.target.id, en.intersectionRatio));
      let best = null, bestRatio = 0;
      visible.forEach((ratio, id) => { if (ratio > bestRatio) { best = id; bestRatio = ratio; } });
      navLinks.forEach((a) => {
        if (a.getAttribute('href') === '#' + best) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }, { threshold: [0, .15, .3, .5, .75, 1], rootMargin: '-15% 0px -35% 0px' });
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- Reveal fallback (no scroll-driven animations) ---------- */
  const hasScrollTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
  if (!hasScrollTimeline && !reduceMotion.matches && 'IntersectionObserver' in window) {
    root.classList.add('no-sda');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('visible'); revealObserver.unobserve(en.target); }
      });
    }, { threshold: .12 });
    $$('.reveal').forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Counting numbers ---------- */
  const counters = $$('[data-count]');
  if (counters.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    const format = (el, n) => (el.dataset.prefix || '') + n + (el.dataset.suffix || '');
    counters.forEach((el) => { el.textContent = format(el, 0); });
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        countObserver.unobserve(en.target);
        const el = en.target;
        const target = Number(el.dataset.count);
        const start = performance.now();
        const duration = 1400;
        (function frame(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = format(el, Math.round(target * eased));
          if (t < 1) requestAnimationFrame(frame);
        })(start);
      });
    }, { threshold: .6 });
    counters.forEach((el) => countObserver.observe(el));
  }

  /* ---------- Frame-timing chart (illustration) ---------- */
  const frames = $('#frames');
  const summary = $('#frames-summary');
  if (frames) {
    // Frame times in ms. Illustrative values, not profiler data.
    const before = [12, 14, 22, 31, 13, 18, 27, 12, 15, 34, 21, 13, 12, 25, 29, 14, 19, 13, 36, 22, 12, 15, 28, 17, 13, 24, 31, 12, 14, 20, 26, 13];
    const after =  [ 9, 10, 12, 14, 9, 11, 13, 9, 10, 15, 12, 9, 9, 12, 14, 10, 11, 9, 17, 12, 9, 10, 13, 11, 9, 12, 14, 9, 10, 11, 13, 9];
    const BUDGET = 16.7;
    const bars = before.map(() => {
      const b = document.createElement('span');
      b.className = 'bar';
      frames.append(b);
      return b;
    });
    const buttons = $$('[data-frames]');

    function render(state) {
      const data = state === 'after' ? after : before;
      frames.dataset.state = state;
      bars.forEach((bar, i) => {
        bar.style.setProperty('--h', data[i]);
        bar.classList.toggle('is-slow', data[i] > BUDGET);
      });
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.frames === state)));
      const slow = data.filter((v) => v > BUDGET).length;
      summary.textContent = `${state === 'after' ? 'After' : 'Before'}: ${slow} of ${data.length} frames over the 16 ms budget.`;
    }
    buttons.forEach((b) => b.addEventListener('click', () => render(b.dataset.frames)));
    render('before');

    // Play the "fix" once when the chart scrolls into view
    if ('IntersectionObserver' in window) {
      const chartObserver = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          chartObserver.disconnect();
          setTimeout(() => render('after'), 900);
        }
      }, { threshold: .7 });
      chartObserver.observe(frames);
    }
  }

  /* ---------- Live FPS meter ---------- */
  const fpsBtn = $('#fps-toggle');
  const fpsBox = $('#fps');
  const fpsValue = $('#fps-value');
  let fpsRunning = false;
  if (fpsBtn) {
    fpsBtn.addEventListener('click', () => {
      fpsRunning = !fpsRunning;
      fpsBtn.setAttribute('aria-pressed', String(fpsRunning));
      fpsBox.hidden = !fpsRunning;
      if (fpsRunning) {
        let count = 0;
        let last = performance.now();
        (function loop(now) {
          if (!fpsRunning) return;
          count++;
          if (now - last >= 500) {
            fpsValue.textContent = Math.round((count * 1000) / (now - last));
            count = 0;
            last = now;
          }
          requestAnimationFrame(loop);
        })(last);
      }
    });
  }

  /* ---------- Contact form ---------- */
  const form = $('#contact-form');
  const status = $('#form-status');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.querySelector('[name="_gotcha"]').value) return; // spam bot
      const data = new FormData(form);

      // Not connected to Formspree yet: open the visitor's email app instead
      if (form.action.includes('YOUR_FORM_ID')) {
        const subject = encodeURIComponent('Portfolio enquiry from ' + data.get('name'));
        const body = encodeURIComponent(data.get('message') + '\n\n' + data.get('name') + ' (' + data.get('email') + ')');
        window.location.href = 'mailto:bs5776571@gmail.com?subject=' + subject + '&body=' + body;
        status.textContent = 'Opening your email app...';
        return;
      }

      status.textContent = 'Sending...';
      try {
        const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        status.textContent = 'Thanks! Your message was sent. I will reply soon.';
      } catch (err) {
        status.textContent = 'Sorry, that did not send. Please email me directly.';
      }
    });
  }

  /* ---------- Horizontal project carousel ---------- */
  $$('[data-carousel]').forEach((carousel) => {
    const track = $('.apps', carousel);
    const prev = $('[data-dir="-1"]', carousel);
    const next = $('[data-dir="1"]', carousel);
    const bar = $('.carousel__progress span', carousel);
    if (!track) return;

    const step = () => {
      const card = track.querySelector('.app-card');
      const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };

    function update() {
      const max = track.scrollWidth - track.clientWidth;
      const pos = Math.max(0, Math.min(track.scrollLeft, max));
      const visible = max > 0 ? track.clientWidth / track.scrollWidth : 1;
      const progress = max > 0 ? Math.min(1, visible + (1 - visible) * (pos / max)) : 1;
      if (bar) bar.style.setProperty('--progress', progress.toFixed(3));
      const last = track.lastElementChild;
      const atEnd = pos >= max - 2 || (last && last.offsetLeft + last.offsetWidth - track.scrollLeft <= track.clientWidth + 4);
      prev.disabled = pos <= 2;
      next.disabled = atEnd;
      track.classList.toggle('is-end', atEnd);
    }

    [prev, next].forEach((btn) => btn.addEventListener('click', () => {
      track.scrollBy({ left: Number(btn.dataset.dir) * step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();

    // Drag to scroll with a mouse (touch and trackpads scroll natively)
    let startX = 0, startLeft = 0, dragging = false, moved = false;
    track.addEventListener('pointerdown', (e) => {
      moved = false;
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      if (!moved) return;
      track.classList.remove('is-dragging');
      // snap to the nearest card after a drag
      const s = step();
      track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
    // A drag should not also count as a click on a card button
    track.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });

  /* ---------- Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* Pause the SVG Bloc animation for reduced motion */
  if (reduceMotion.matches) {
    const svg = $('.bloc svg');
    if (svg && svg.pauseAnimations) svg.pauseAnimations();
  }
})();
