/* ==========================================================================
   CONVERGE '26 — js/app.js
   Shared front-end behaviour for every page.
   --------------------------------------------------------------------------
   Owns: theme toggle, mobile navigation, sticky-header state, scroll reveal,
         stat counters, agenda day switcher, toast helper.
   Every browser-storage access is wrapped in try/catch: localStorage throws
   in private mode and when site data is blocked.
   ========================================================================== */
(function () {
  'use strict';

  /* Mark that JS is alive, so CSS can stop hiding .reveal elements. */
  document.documentElement.classList.remove('no-js');

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ util */
  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (err) {
      /* Storage unavailable — the page must keep working regardless. */
      return null;
    }
    return value;
  }

  /* --------------------------------------------------------------- 1. THEME
     Dark is the default. An explicit choice is remembered; otherwise we let
     the OS preference win through the CSS media query. */
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme);   /* keep Bootstrap in sync */
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#faf8f5' : '#08080a');
  }

  var saved = store('converge-theme');
  if (saved === 'light' || saved === 'dark') applyTheme(saved);

  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      store('converge-theme', next);
      themeBtn.setAttribute('aria-label',
        next === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    });
  }

  /* ----------------------------------------------------------- 2. MOBILE NAV */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('siteMenu');

  function closeNav() {
    if (!navToggle || !navMenu) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    /* Close after choosing a destination */
    navMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    /* Escape closes and returns focus to the trigger */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });

    /* Reset state when we cross back to the desktop layout */
    window.matchMedia('(min-width: 992px)').addEventListener('change', closeNav);
  }

  /* --------------------------------------------------- 3. STICKY HEADER STATE
     Adds the hairline border only once the page has actually scrolled. */
  var siteNav = document.getElementById('siteNav');
  if (siteNav) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
    document.body.prepend(sentinel);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        siteNav.classList.toggle('is-stuck', !entries[0].isIntersecting);
      }).observe(sentinel);
    }
  }

  /* --------------------------------------------------------- 4. SCROLL REVEAL */
  var revealables = document.querySelectorAll('.reveal');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);      /* animate once, then stop watching */
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* -------------------------------------------------------- 5. STAT COUNTERS */
  var counters = document.querySelectorAll('[data-count]');

  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;

    var suffix = el.querySelector('sup');
    var suffixHTML = suffix ? suffix.outerHTML : '';

    if (prefersReduced) {
      el.innerHTML = target.toLocaleString('en-US') + suffixHTML;
      return;
    }

    var duration = 1400;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      /* easeOutExpo — fast then settles, reads as "counting up" */
      var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.innerHTML = Math.round(target * eased).toLocaleString('en-US') + suffixHTML;
      if (progress < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ------------------------------------------------------ 6. AGENDA DAY BAR
     Presentational only — day one is the published agenda; days two and three
     show a short notice rather than fabricated sessions. */
  var dayButtons = document.querySelectorAll('.daybar__btn');
  dayButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      dayButtons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      var heading = document.querySelector('#agenda .u-h2');
      var labels = {
        'Day 01': 'Day one — Thursday, 4 June',
        'Day 02': 'Day two — Friday, 5 June',
        'Day 03': 'Day three — Saturday, 6 June'
      };
      if (heading && labels[btn.textContent.trim()]) {
        heading.textContent = labels[btn.textContent.trim()];
      }

      var agenda = document.querySelector('.agenda');
      if (!agenda) return;

      if (btn.textContent.trim() === 'Day 01') {
        agenda.removeAttribute('data-placeholder');
        agenda.style.opacity = '';
        agenda.style.pointerEvents = '';
        var note = document.getElementById('agendaNote');
        if (note) note.remove();
      } else if (!document.getElementById('agendaNote')) {
        var p = document.createElement('p');
        p.id = 'agendaNote';
        p.className = 'u-mono u-faint';
        p.style.paddingTop = 'var(--s-5)';
        p.textContent = 'Full schedule for this day is published in March 2026.';
        agenda.parentNode.insertBefore(p, agenda.nextSibling);
      }
    });
  });

  /* ------------------------------------------------------------- 7. TOASTS
     Exposed on window so signup.js (and any teammate's script) can reuse it.
  */
  window.Converge = window.Converge || {};

  window.Converge.toast = function (message, variant) {
    var region = document.getElementById('toasts');
    if (!region) return;

    var el = document.createElement('div');
    el.className = 'toast-x' + (variant ? ' toast-x--' + variant : '');
    el.setAttribute('role', 'status');
    el.textContent = message;
    region.appendChild(el);

    window.setTimeout(function () {
      el.classList.add('is-leaving');
      el.addEventListener('animationend', function () { el.remove(); });
      /* Belt-and-braces removal if the animation event never fires */
      window.setTimeout(function () { if (el.parentNode) el.remove(); }, 600);
    }, 3600);
  };
})();
