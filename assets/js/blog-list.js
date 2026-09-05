// Blog list — order toggle (newest/oldest first) over month sections
(function () {
  const ORDER_KEY = 'tcf-journey-blog-order';

  document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('posts-list');
    const btn = document.getElementById('blog-sort-toggle');
    if (!list || !btn) return;

    let order = localStorage.getItem(ORDER_KEY);
    if (order !== 'asc' && order !== 'desc') order = 'desc';

    function relabel() {
      const lang = document.documentElement.getAttribute('data-lang') || 'en';
      const key = (order === 'asc' ? 'oldest' : 'newest') + (lang === 'fr' ? 'Fr' : 'En');
      const label = btn.querySelector('.sort-label');
      const arrow = btn.querySelector('.sort-arrow');
      if (label) label.textContent = btn.dataset[key] || '';
      if (arrow) arrow.textContent = order === 'asc' ? '↑' : '↓';
      btn.dataset.order = order;
      btn.setAttribute('aria-label', label ? label.textContent : '');
    }

    function apply() {
      const dir = order === 'asc' ? 1 : -1;
      const groups = Array.from(list.querySelectorAll('.post-month'));
      groups.sort((a, b) => dir * a.dataset.month.localeCompare(b.dataset.month));
      groups.forEach(group => {
        const rows = Array.from(group.querySelectorAll('.post-preview'));
        rows.sort((a, b) => dir * a.dataset.date.localeCompare(b.dataset.date));
        group.append(...rows);          // label stays first, rows re-appended in order
      });
      list.append(...groups);
      relabel();
    }

    btn.addEventListener('click', () => {
      order = order === 'asc' ? 'desc' : 'asc';
      try { localStorage.setItem(ORDER_KEY, order); } catch (e) {}
      apply();
    });

    document.addEventListener('langchange', relabel);
    apply();
  });
})();
