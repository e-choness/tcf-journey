// Blog list - calculate reading time for each post
document.addEventListener('DOMContentLoaded', function() {
  const posts = document.querySelectorAll('.post-preview');

  posts.forEach((post, index) => {
    const postUrl = post.dataset.postId;
    const readTimeEl = document.getElementById(`read-time-${index + 1}`);

    if (postUrl && readTimeEl) {
      fetch(postUrl)
        .then(r => r.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const content = doc.querySelector('.post-content');
          if (content) {
            const text = content.innerText;
            const wordsPerMinute = 200;
            const words = text.split(/\s+/).length;
            const minutes = Math.ceil(words / wordsPerMinute);
            readTimeEl.textContent = `${minutes} min`;
          }
        })
        .catch(() => {});
    }
  });
});
