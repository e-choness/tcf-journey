// Main functionality
document.addEventListener('DOMContentLoaded', function() {
  // Calculate days left to exam
  const examDate = new Date('2026-11-14');
  const today = new Date();
  const daysLeft = Math.max(0, Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)));

  const daysElement = document.getElementById('days-left');
  if (daysElement) {
    daysElement.textContent = daysLeft;
  }

  // Load progress from localStorage
  loadProgress();
});

// Progress tracking
function loadProgress() {
  const stored = localStorage.getItem('tcf-journey-progress');
  if (stored) {
    try {
      const progress = JSON.parse(stored);
      const drillsDone = document.getElementById('drills-done');
      if (drillsDone) {
        drillsDone.textContent = Object.keys(progress).length;
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
  }
}

function saveProgress() {
  const progress = {};
  document.querySelectorAll('.drill-item.done').forEach(item => {
    progress[item.dataset.id] = true;
  });
  localStorage.setItem('tcf-journey-progress', JSON.stringify(progress));
  loadProgress();
}

function markDone(button) {
  const drillId = document.querySelector('[data-drill-id]')?.dataset.drillId;
  if (!drillId) return;

  const progress = JSON.parse(localStorage.getItem('tcf-journey-progress') || '{}');
  progress[drillId] = !progress[drillId];
  localStorage.setItem('tcf-journey-progress', JSON.stringify(progress));

  button.textContent = progress[drillId] ? '✓ Done' : 'Mark as done';
  button.classList.toggle('done');
  loadProgress();
}

function nextDrill() {
  const drills = Array.from(document.querySelectorAll('.drill-item'));
  if (drills.length > 1) {
    const randomDrill = drills[Math.floor(Math.random() * drills.length)];
    randomDrill.querySelector('.drill-link').click();
  }
}

function nextPost() {
  const posts = Array.from(document.querySelectorAll('.post-preview'));
  if (posts.length > 1) {
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    randomPost.querySelector('a').click();
  }
}

// Reading time estimation
function readingTime() {
  const content = document.querySelector('.post-content') || document.querySelector('article');
  if (!content) return 0;

  const text = content.innerText;
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Cursor spotlight effect
window.addEventListener('pointermove', (e) => {
  const spotlight = document.getElementById('spotlight');
  if (spotlight) {
    spotlight.style.transform = `translate(${e.clientX - 260}px, ${e.clientY - 260}px)`;
  }
});

// Intersection Observer for data-reveal animations
window.addEventListener('load', () => {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '-40px 0px -10% 0px' }
  );

  document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => io.observe(el));
});

// 3D Cube interaction
(() => {
  const cubeRef = document.querySelector('[data-cube]');
  if (!cubeRef) return;

  let rotation = { x: -14, y: 22, vy: 0.14, drag: false, lastX: 0, lastY: 0 };

  const tick = () => {
    if (!rotation.drag) {
      rotation.y += rotation.vy;
    }
    const inner = cubeRef.querySelector('[data-cube-inner]');
    if (inner) {
      inner.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
    }
    requestAnimationFrame(tick);
  };
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
