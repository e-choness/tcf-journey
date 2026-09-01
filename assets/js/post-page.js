// Blog post page - reading time, next post navigation
document.addEventListener('DOMContentLoaded', function() {
  const readingTimeEl = document.getElementById('post-reading-time');
  const nextBtn = document.getElementById('next-post-btn');

  // Calculate reading time
  const content = document.querySelector('.post-content');
  if (content) {
    const text = content.innerText;
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    if (readingTimeEl) {
      readingTimeEl.textContent = `${minutes} min read`;
    }
  }

  // Sequential prev/next post navigation with greyed-out endpoints
  const prevBtn = document.getElementById('prev-post-btn');
  const here = document.querySelector('[data-post-here]')?.dataset.postHere || location.pathname;

  let order = [];
  try {
    order = JSON.parse(document.getElementById('post-order').textContent);
  } catch (e) {}

  const i = order.indexOf(here);
  const prevUrl = i > 0 ? order[i - 1] : null;
  const nextUrl = i >= 0 && i < order.length - 1 ? order[i + 1] : null;

  function wire(btn, url) {
    if (!btn) return;
    if (url) {
      btn.setAttribute('href', url);
      btn.removeAttribute('aria-disabled');
      btn.classList.remove('is-disabled');
    } else {
      btn.removeAttribute('href');
      btn.setAttribute('aria-disabled', 'true');
      btn.classList.add('is-disabled');
    }
  }

  wire(prevBtn, prevUrl);
  wire(nextBtn, nextUrl);
});
