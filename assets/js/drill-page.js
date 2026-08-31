// Drill page - reading time, done button, next drill navigation
document.addEventListener('DOMContentLoaded', function() {
  const drillId = document.querySelector('[data-drill-id]')?.dataset.drillId;
  const doneBtn = document.getElementById('drill-done-btn');
  const nextBtn = document.getElementById('next-drill-btn');
  const readingTimeEl = document.getElementById('drill-reading-time');

  // Calculate reading time
  const content = document.querySelector('.drill-content');
  if (content) {
    const text = content.innerText;
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    if (readingTimeEl) {
      readingTimeEl.textContent = `${minutes} min read`;
    }
  }

  if (!drillId) return;

  // Restore done state
  const progress = JSON.parse(localStorage.getItem('tcf-journey-progress') || '{}');
  if (progress[drillId]) {
    doneBtn.classList.add('done');
    doneBtn.querySelector('.done-text').style.display = 'none';
    doneBtn.querySelector('.done-check').style.display = 'inline';
  }

  // Done button handler
  doneBtn.addEventListener('click', function() {
    const progress = JSON.parse(localStorage.getItem('tcf-journey-progress') || '{}');
    progress[drillId] = !progress[drillId];
    localStorage.setItem('tcf-journey-progress', JSON.stringify(progress));

    this.classList.toggle('done');
    if (progress[drillId]) {
      this.querySelector('.done-text').style.display = 'none';
      this.querySelector('.done-check').style.display = 'inline';
    } else {
      this.querySelector('.done-text').style.display = 'inline';
      this.querySelector('.done-check').style.display = 'none';
    }
  });

  // Next drill button
  nextBtn.addEventListener('click', function() {
    fetch(document.querySelector('[data-tcf-url]')?.dataset.tcfUrl || '/tcf/')
      .then(r => r.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const drills = Array.from(doc.querySelectorAll('.drill-item'));
        if (drills.length > 0) {
          const randomDrill = drills[Math.floor(Math.random() * drills.length)];
          const link = randomDrill.querySelector('a');
          if (link) {
            window.location.href = link.href;
          }
        }
      })
      .catch(() => {
        alert('Could not load drill list');
      });
  });
});
