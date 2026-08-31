// Navigation and mobile menu (§2, §1.3)
const LANG_KEY = 'tcf-journey-lang';

function initialLang() {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === 'en' || saved === 'fr') return saved;
  return (navigator.language || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

function applyLang(lang) {
  const suffix = lang === 'fr' ? 'Fr' : 'En';  // dataset camelCase
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('data-lang', lang);

  document.querySelectorAll('[data-i18n-en]').forEach(el => {
    const v = el.dataset['i18n' + suffix];
    if (v != null) el.textContent = v;
  });

  document.querySelectorAll('[data-i18n-ph-en]').forEach(el => {
    const v = el.dataset['i18nPh' + suffix];
    if (v != null) el.placeholder = v;
  });

  document.querySelectorAll('[data-i18n-title-en]').forEach(el => {
    const v = el.dataset['i18nTitle' + suffix];
    if (v != null) el.title = v;
  });

  document.querySelectorAll('[data-i18n-aria-en]').forEach(el => {
    const v = el.dataset['i18nAria' + suffix];
    if (v != null) el.setAttribute('aria-label', v);
  });

  const btn = document.getElementById('lang-toggle');
  if (btn) btn.setAttribute('aria-label', lang === 'fr' ? 'Passer en anglais' : 'Switch to French');

  // let other modules relabel their own computed strings
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

document.addEventListener('DOMContentLoaded', () => {
  applyLang(initialLang());

  // --- Mobile menu (§2) ---
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  function setMenu(open) {
    if (!mobileNav || !menuToggle) return;
    mobileNav.classList.toggle('open', open);
    menuToggle.textContent = open ? '✕' : '☰';
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (menuToggle && mobileNav) {
    menuToggle.setAttribute('aria-controls', 'mobile-nav');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.addEventListener('click', () =>
      setMenu(!mobileNav.classList.contains('open')));
    mobileNav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', () => { if (innerWidth > 860) setMenu(false); });
  }

  // --- Language toggle (§1.3) ---
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-lang') === 'fr' ? 'en' : 'fr';
    localStorage.setItem(LANG_KEY, next);
    applyLang(next);
  });
});
