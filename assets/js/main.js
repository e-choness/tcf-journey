// Main functionality
document.addEventListener('DOMContentLoaded', function() {
  // Calculate days left to exam
  const daysElement = document.getElementById('days-left');
  if (daysElement) {
    // Try to get exam date from data attribute
    const examDateStr = daysElement.dataset.examDate || daysElement.getAttribute('data-exam-date');

    if (examDateStr && examDateStr !== 'TBD' && examDateStr !== '') {
      try {
        const examDate = new Date(examDateStr);
        const today = new Date();
        const daysLeft = Math.max(0, Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)));
        daysElement.textContent = daysLeft;
      } catch (e) {
        // If date parsing fails, show placeholder
        daysElement.textContent = '—';
      }
    } else {
      // Date is TBD or not available
      daysElement.textContent = '—';
    }
  }

  // Initialize progress display
  updateProgressDisplay();
});

// Progress display (read-only, updated on progresschange events and load)
function updateProgressDisplay() {
  const drillsDone = document.getElementById('drills-done');
  if (drillsDone) {
    drillsDone.textContent = window.Progress.count();
  }

  // Update cube face counts by section
  const sections = ['co', 'ce', 'eo', 'ee'];
  sections.forEach(section => {
    updateSectionProgress(section);
  });
}

function updateSectionProgress(section) {
  const cubeCountEl = document.getElementById(`cube-${section}-count`);
  const skillProgressEl = document.getElementById(`${section}-progress`);
  if (cubeCountEl || skillProgressEl) {
    const allDrills = Array.from(document.querySelectorAll(`[data-section="${section}"]`));
    const done = allDrills.filter(drill => window.Progress.isDone(drill.dataset.id)).length;
    const total = allDrills.length;
    const text = `${done}/${total}`;
    if (cubeCountEl) cubeCountEl.textContent = text;
    if (skillProgressEl) skillProgressEl.textContent = text;
  }
}

// Listen for progress changes
document.addEventListener('progresschange', (e) => {
  updateProgressDisplay();
});

// Cursor spotlight effect and data-reveal observer (§3.7, §7.5)
let spotlightObserver;

function initSpotlightAndReveal() {
  const spotlight = document.getElementById('spotlight');

  // Single pointermove handler for both spotlight and cube
  window.addEventListener('pointermove', (e) => {
    if (spotlight) {
      spotlight.style.transform = `translate(${e.clientX - 260}px, ${e.clientY - 260}px)`;
    }
  });

  // Initialize data-reveal observer
  if (!spotlightObserver) {
    spotlightObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            spotlightObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '-40px 0px -10% 0px' }
    );
  }

  document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => {
    spotlightObserver.observe(el);
  });
}

// Run on load and on pageshow (for bfcache restoration)
window.addEventListener('load', initSpotlightAndReveal);
window.addEventListener('pageshow', initSpotlightAndReveal);

// 3D Cube interaction (§7.4 – gated RAF loop)
(() => {
  const cubeRef = document.querySelector('[data-cube]');
  if (!cubeRef) return;

  let rotation = { x: -14, y: 22, vy: 0.14, drag: false, lastX: 0, lastY: 0 };
  let rafId = null;
  let isVisible = true;

  const tick = () => {
    if (isVisible && !rotation.drag) {
      rotation.y += rotation.vy;
    }
    const inner = cubeRef.querySelector('[data-cube-inner]');
    if (inner) {
      inner.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
    }
    rafId = requestAnimationFrame(tick);
  };

  // Gate: only run tick while visible
  const visibilityHandler = () => {
    isVisible = document.visibilityState === 'visible';
  };
  document.addEventListener('visibilitychange', visibilityHandler);

  // Gate: only run tick while in viewport
  const cubeObserver = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  });
  cubeObserver.observe(cubeRef);

  tick();

  cubeRef.addEventListener('pointerdown', (e) => {
    rotation.drag = true;
    rotation.lastX = e.clientX;
    rotation.lastY = e.clientY;
  });

  document.addEventListener('pointermove', (e) => {
    if (!rotation.drag) return;
    rotation.y += (e.clientX - rotation.lastX) * 0.5;
    rotation.x = Math.max(-45, Math.min(45, rotation.x - (e.clientY - rotation.lastY) * 0.35));
    rotation.lastX = e.clientX;
    rotation.lastY = e.clientY;
  });

  document.addEventListener('pointerup', () => {
    rotation.drag = false;
  });
})();
