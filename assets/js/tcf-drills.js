// TCF drills list - filtering, progress tracking (§3.1, §3.2, §3.3)
document.addEventListener('DOMContentLoaded', function() {
  const list = document.getElementById('drills-list');
  if (!list) return;  // Not the TCF index — do nothing

  const drillItems = Array.from(document.querySelectorAll('.drill-item'));
  const filterTags = document.querySelectorAll('.filter-tags .tag');
  const searchInput = document.getElementById('drill-search');
  const clearBtn = document.getElementById('clear-filters');
  const tacheSections = document.querySelectorAll('.tache-section');
  let activeFilters = {};

  // Guard search and clear buttons
  if (!searchInput || !clearBtn) return;

  // Done button handling
  document.querySelectorAll('.drill-done-btn').forEach(btn => {
    const drillId = btn.dataset.drillId;
    if (!drillId) return;

    // Restore state from localStorage
    if (window.Progress.isDone(drillId)) {
      btn.classList.add('done');
      btn.setAttribute('aria-pressed', 'true');
    }

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const done = window.Progress.toggle(drillId);
      btn.classList.toggle('done', done);
      btn.setAttribute('aria-pressed', String(done));
      if (done) window.Progress.confetti(btn);
      updateDoneBadge();
      updateProgressDisplays();
      updateTacheProgress();
    });
  });

  // Update done badge with count (§5.2)
  function updateDoneBadge() {
    const count = window.Progress.count();
    const badge = document.getElementById('drills-done-badge');
    if (!badge) return;

    const lang = document.documentElement.getAttribute('data-lang') || 'en';
    const badgeSuffix = lang === 'fr' ? badge.dataset.badgeFr : badge.dataset.badgeEn;

    if (count > 0) {
      badge.textContent = `${count} ${badgeSuffix || 'done'}`;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  // Update progress displays (skill cards and home cube)
  function updateProgressDisplays() {
    const sections = ['co', 'ce', 'eo', 'ee'];
    const C = 2 * Math.PI * 18;  // circumference

    const lang = document.documentElement.getAttribute('data-lang') || 'en';
    const doneSuffix = lang === 'fr' ? list.dataset.doneFr : list.dataset.doneEn;

    sections.forEach(id => {
      const items = drillItems.filter(i => i.dataset.section === id);
      const done = items.filter(i => window.Progress.isDone(i.dataset.id)).length;
      const total = items.length;

      const label = document.getElementById(id + '-progress');
      const ring = document.querySelector(`[data-ring="${id}"]`);

      if (label) label.textContent = `${done} / ${total} ${doneSuffix || 'done'}`;
      if (ring) ring.setAttribute('stroke-dasharray',
        `${(C * done / Math.max(1, total)).toFixed(1)} ${C.toFixed(1)}`);
    });
  }

  // Update tâche progress bars
  function updateTacheProgress() {
    tacheSections.forEach(section => {
      const items = Array.from(section.querySelectorAll('.drill-item'));
      const done = items.filter(i => window.Progress.isDone(i.dataset.id)).length;
      const total = items.length;
      const percent = total > 0 ? (done / total) * 100 : 0;

      const label = section.querySelector('.tache-progress-label');
      const bar = section.querySelector('.tache-progress-bar');

      if (label) label.textContent = `${done} / ${total}`;
      if (bar) bar.style.width = `${percent}%`;
    });
  }

  // Filter handling
  filterTags.forEach(tag => {
    tag.addEventListener('click', function() {
      const filterType = this.dataset.filter;
      const filterValue = this.dataset.value;

      if (filterValue) {
        activeFilters[filterType] = filterValue;
      } else {
        delete activeFilters[filterType];
      }

      this.parentElement.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      filterDrills();
    });
  });

  // Skill card click handling
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', function() {
      const id = this.dataset.section;
      const on = activeFilters.section === id;
      if (on) delete activeFilters.section; else activeFilters.section = id;

      document.querySelectorAll('.skill-card').forEach(c =>
        c.setAttribute('aria-pressed', String(c.dataset.section === activeFilters.section)));

      syncSectionFilterTags();
      filterDrills();
    });
  });

  function syncSectionFilterTags() {
    const section = activeFilters.section;
    document.querySelectorAll('[data-filter="section"] .tag').forEach(tag => {
      tag.classList.toggle('active', tag.dataset.value === section);
    });
  }

  searchInput.addEventListener('input', filterDrills);
  clearBtn.addEventListener('click', function() {
    activeFilters = {};
    searchInput.value = '';
    document.querySelectorAll('.filter-tags .tag').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('[data-value=""] .tag').forEach(t => t.classList.add('active'));
    document.querySelectorAll('.skill-card').forEach(c => c.setAttribute('aria-pressed', 'false'));
    filterDrills();
  });

  // Accent folding for search (§5.8)
  const fold = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function filterDrills() {
    const query = fold(searchInput.value);
    let visibleCount = 0;

    drillItems.forEach(item => {
      let show = true;

      if (activeFilters.section && item.dataset.section !== activeFilters.section) show = false;
      if (activeFilters.level && item.dataset.level !== activeFilters.level) show = false;
      if (activeFilters.topic && item.dataset.topic !== activeFilters.topic) show = false;

      if (query) {
        const haystack = fold(
          (item.dataset.tache || '') + ' ' +
          (item.textContent || '')
        );
        show = show && haystack.includes(query);
      }

      item.classList.toggle('is-hidden', !show);
      if (show) visibleCount++;
    });

    // Update empty state (§5.7)
    const noResults = document.getElementById('no-results');
    if (noResults) noResults.style.display = visibleCount ? 'none' : 'block';

    // Hide empty tâche sections
    tacheSections.forEach(sec => {
      const any = Array.from(sec.querySelectorAll('.drill-item'))
        .some(i => !i.classList.contains('is-hidden'));
      sec.style.display = any ? '' : 'none';
    });
  }

  // Listen for language changes (§1.5)
  document.addEventListener('langchange', () => {
    updateDoneBadge();
    updateProgressDisplays();
    updateTacheProgress();
  });

  // Listen for progress changes from drill page or other tabs (§3.4)
  document.addEventListener('progresschange', () => {
    updateDoneBadge();
    updateProgressDisplays();
    updateTacheProgress();
  });

  // Initial state
  updateDoneBadge();
  updateProgressDisplays();
  updateTacheProgress();
});
