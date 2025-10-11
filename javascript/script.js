'use strict';

// ---------- Small helpers ----------
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

// ---------- Bootstrapping after DOM is ready ----------
on(document, 'DOMContentLoaded', () => {
  setupThemeToggle();
  setupTagFiltering();
  setupMobileMenu();
  setupScrollReveal();
});

// ---------- Theme toggle ----------
function setupThemeToggle() {
  const btn = $('#theme-toggle');
  if (!btn) return;

  const updateToggleUI = () => {
    const isDark = document.documentElement.classList.contains('dark');
    btn.setAttribute('aria-pressed', String(isDark));
  };
  updateToggleUI();

  on(btn, 'click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (_) {}
    updateToggleUI();
  });
}

// Respect OS theme only when user hasn't chosen yet
(function watchSystemThemeWhenUnset() {
  try { if (localStorage.getItem('theme')) return; } catch (_) {}
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const apply = () => {
    const isDark = mql.matches;
    document.documentElement.classList.toggle('dark', isDark);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', String(isDark));
  };
  apply();
  if ('addEventListener' in mql) mql.addEventListener('change', apply);
  else mql.addListener(apply); // older Safari
})();

// ---------- Project tag filtering ----------
function setupTagFiltering() {
  const bar = $('#tag-bar');
  const grid = $('#project-grid');
  if (!bar || !grid) return;

  const buttons = $$('[data-tag]', bar);
  const cards = $$('.card', grid);
  if (!buttons.length || !cards.length) return;

  on(bar, 'click', (e) => {
    const btn = e.target.closest('[data-tag]');
    if (!btn) return;

    buttons.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const tag = (btn.dataset.tag || '').toLowerCase();
    cards.forEach(card => {
      const tags = (card.dataset.tags || '').toLowerCase().split(/\s+/);
      card.hidden = !(tag === 'all' || tags.includes(tag));
    });
  });
}

// ---------- Mobile menu toggle ----------
function setupMobileMenu() {
  const toggle = $('#menu-toggle'); // <button id="menu-toggle" aria-controls="site-nav">
  if (!toggle) return;
  const navId = toggle.getAttribute('aria-controls') || 'site-nav';
  const nav = document.getElementById(navId);
  if (!nav) return;

  on(toggle, 'click', () => {
    const opening = nav.hasAttribute('hidden');
    toggle.setAttribute('aria-expanded', String(opening));
    nav.toggleAttribute('hidden');
  });

  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && !nav.hasAttribute('hidden')) {
      nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

// ---------- Optional: Scroll reveal (graceful) ----------
function setupScrollReveal() {
  const revealables = $$('[data-reveal]');
  if (!revealables.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    revealables.forEach(el => (el.style.opacity = ''));
    return;
  }

  revealables.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
  });

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      target.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 500, easing: 'ease-out', fill: 'forwards' }
      );
      obs.unobserve(target);
    });
  }, { threshold: 0.12 });

  revealables.forEach(el => io.observe(el));
}


