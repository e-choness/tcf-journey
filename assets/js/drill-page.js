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

  function updateButtonState() {
    const isDone = window.Progress.isDone(drillId);
    doneBtn.setAttribute('aria-pressed', isDone ? 'true' : 'false');
    doneBtn.classList.toggle('done', isDone);

    const doneText = doneBtn.querySelector('.done-text');
    const doneCheck = doneBtn.querySelector('.done-check');

    if (isDone) {
      doneText.style.display = 'none';
      doneCheck.style.display = 'inline';
    } else {
      doneText.style.display = 'inline';
      doneCheck.style.display = 'none';
    }
  }

  // Set initial state
  updateButtonState();

  // Done button handler
  doneBtn.addEventListener('click', function() {
    const isDone = window.Progress.toggle(drillId);
    updateButtonState();

    // Fire confetti on mark done
    if (isDone) {
      window.Progress.confetti(doneBtn);
    }
  });

  // Update on progress change from other tabs
  document.addEventListener('progresschange', (e) => {
    if (e.detail.id === drillId) {
      updateButtonState();
    }
  });

  // Next drill button - sequential navigation through the library (wraps at end)
  nextBtn.addEventListener('click', function() {
    let order = [];
    try {
      order = JSON.parse(document.getElementById('drill-order').textContent);
    } catch (e) {}
    if (!order.length) return;
    const i = order.indexOf(drillId);
    const next = i >= 0 ? order[(i + 1) % order.length] : order[0];
    if (next) window.location.href = next;
  });
});
