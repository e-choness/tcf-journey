// Navigation and mobile menu
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const langToggle = document.getElementById('lang-toggle');

  // Mobile menu
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function() {
      const isOpen = mobileNav.style.display === 'flex';
      mobileNav.style.display = isOpen ? 'none' : 'flex';
      menuToggle.textContent = isOpen ? '☰' : '✕';
    });

    // Close menu when link is clicked
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        mobileNav.style.display = 'none';
        menuToggle.textContent = '☰';
      });
    });
  }

  // Language toggle
  if (langToggle) {
    const savedLang = localStorage.getItem('tcf-journey-lang') || 'en';
    updateLanguageUI(savedLang);

    langToggle.addEventListener('click', function() {
      const currentLang = localStorage.getItem('tcf-journey-lang') || 'en';
      const newLang = currentLang === 'en' ? 'fr' : 'en';
      localStorage.setItem('tcf-journey-lang', newLang);
      updateLanguageUI(newLang);
      // Page content would be updated via Jekyll templates
    });
  }
});

function updateLanguageUI(lang) {
  const langToggle = document.getElementById('lang-toggle');
  if (!langToggle) return;

  const enSpan = langToggle.querySelector('.lang-en');
  const frSpan = langToggle.querySelector('.lang-fr');

  if (lang === 'en') {
    enSpan.style.color = 'var(--color-accent)';
    enSpan.style.boxShadow = 'inset 0 0 0 1px var(--color-accent)';
    frSpan.style.color = 'rgba(233, 233, 237, 0.5)';
    frSpan.style.boxShadow = 'none';
  } else {
    enSpan.style.color = 'rgba(233, 233, 237, 0.5)';
    enSpan.style.boxShadow = 'none';
    frSpan.style.color = 'var(--color-accent)';
    frSpan.style.boxShadow = 'inset 0 0 0 1px var(--color-accent)';
  }
}
