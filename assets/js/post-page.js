// Blog post page - reading time, next post navigation
document.addEventListener('DOMContentLoaded', function() {
  const readingTimeEl = document.getElementById('post-reading-time');
  const nextBtn = document.getElementById('next-post-btn');
  const blogUrl = document.querySelector('[data-blog-url]')?.dataset.blogUrl || '/blog/';

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

  // Next post button
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      fetch(blogUrl)
        .then(r => r.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const posts = Array.from(doc.querySelectorAll('.post-preview'));
          if (posts.length > 0) {
            const randomPost = posts[Math.floor(Math.random() * posts.length)];
            const link = randomPost.querySelector('a');
            if (link) {
              window.location.href = link.href;
            }
          }
        })
        .catch(() => {
          alert('Could not load blog posts');
        });
    });
  }
});
