// TCF drills list - filtering, progress tracking, reading time
document.addEventListener('DOMContentLoaded', function() {
  const filterTags = document.querySelectorAll('.filter-tags .tag');
  const searchInput = document.getElementById('drill-search');
  const drillItems = document.querySelectorAll('.drill-item');
  const doneBtns = document.querySelectorAll('.drill-done-btn');
  const tacheSections = document.querySelectorAll('.tache-section');
  let activeFilters = {};

  // Calculate reading time for each drill
  function calculateReadingTime(drillId) {
    const timeEl = document.querySelector(`[data-drill-id="${drillId}"].drill-time`);
    if (!timeEl) return;

    fetch(drillId + '/')
      .then(r => r.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.querySelector('.drill-content') || doc.querySelector('article');
        if (content) {
          const text = content.innerText;
          const wordsPerMinute = 200;
          const words = text.split(/\s+/).length;
          const minutes = Math.ceil(words / wordsPerMinute);
          timeEl.textContent = `— ${minutes} min`;
        }
      })
      .catch(() => {});
  }

  drillItems.forEach(item => {
    const drillId = item.dataset.id;
    if (drillId) {
      calculateReadingTime(drillId);
    }
  });

  // Done button handling
  doneBtns.forEach(btn => {
    const drillId = btn.dataset.drillId;

    // Restore state from localStorage
    const progress = JSON.parse(localStorage.getItem('tcf-journey-progress') || '{}');
    if (progress[drillId]) {
      btn.classList.add('done');
      btn.style.background = 'var(--color-accent)';
      btn.style.color = 'var(--color-bg)';
      btn.style.borderColor = 'var(--color-accent)';
    }

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const progress = JSON.parse(localStorage.getItem('tcf-journey-progress') || '{}');
      progress[drillId] = !progress[drillId];
      localStorage.setItem('tcf-journey-progress', JSON.stringify(progress));

      this.classList.toggle('done');
      if (this.classList.contains('done')) {
        this.style.background = 'var(--color-accent)';
        this.style.color = 'var(--color-bg)';
        this.style.borderColor = 'var(--color-accent)';
      } else {
        this.style.background = 'transparent';
        this.style.color = 'transparent';
        this.style.borderColor = 'var(--color-divider)';
      }
      updateDoneBadge();
      updateProgressDisplays();
      updateTacheProgress();
    });
  });

  // Update done badge with count
  function updateDoneBadge() {
    const progress = JSON.parse(localStorage.getItem('tcf-journey-progress') || '{}');
    const count = Object.values(progress).filter(Boolean).length;
    const badge = document.getElementById('drills-done-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = `${count} done`;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // Update progress displays (skill cards)
  function updateProgressDisplays() {
    const progress = JSON.parse(localStorage.getItem('tcf-journey-progress') || '{}');
    const sections = ['co', 'ce', 'eo', 'ee'];

    sections.forEach(section => {
      const total = drillItems.filter(item => item.dataset.section === section).length;
      const done = Array.from(drillItems)
        .filter(item => item.dataset.section === section)
        .filter(item => progress[item.dataset.id])
        .length;

      const progressEl = document.getElementById(`${section}-progress`);
      if (progressEl) {
        progressEl.textContent = `${done}/${total}`;
      }
    });
  }

  // Update tâche progress bars
  function updateTacheProgress() {
    const progress = JSON.parse(localStorage.getItem('tcf-journey-progress') || '{}');

    tacheSections.forEach(section => {
      const items = section.querySelectorAll('.drill-item');
      const done = Array.from(items).filter(item => progress[item.dataset.id]).length;
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

      filterDrills();
    });
  });

  // Skill card click handling
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', function() {
      const section = this.dataset.section;
      if (activeFilters.section === section) {
        delete activeFilters.section;
      } else {
        activeFilters.section = section;
      }
      filterDrills();
    });
  });

  searchInput.addEventListener('input', filterDrills);

  document.getElementById('clear-filters').addEventListener('click', function() {
    activeFilters = {};
    searchInput.value = '';
    filterDrills();
  });

  function filterDrills() {
    const query = searchInput.value.toLowerCase();

    drillItems.forEach(item => {
      let show = true;

      if (activeFilters.section && item.dataset.section !== activeFilters.section) {
        show = false;
      }
      if (activeFilters.level && item.dataset.level !== activeFilters.level) {
        show = false;
      }
      if (activeFilters.topic && item.dataset.topic !== activeFilters.topic) {
        show = false;
      }

      if (query && !item.textContent.toLowerCase().includes(query)) {
        show = false;
      }

      item.style.display = show ? 'grid' : 'none';
    });
  }

  // Initial state
  updateDoneBadge();
  updateProgressDisplays();
  updateTacheProgress();
});
