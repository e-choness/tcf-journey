// Dark mode toggle
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Check saved preference
  const savedTheme = localStorage.getItem('tcf-journey-theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = html.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('tcf-journey-theme', newTheme);
    });
  }
});

function applyTheme(theme) {
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  html.setAttribute('data-theme', theme);

  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
  }
}
