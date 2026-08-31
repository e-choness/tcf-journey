// French flip cards - flip on click, drag to throw
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.flip-card');
  let activeFilters = { category: '', level: '' };

  // Category and level filtering (§9.2)
  document.querySelectorAll('[data-filter="category"] .tag').forEach(button => {
    button.addEventListener('click', function() {
      activeFilters.category = this.dataset.category || '';
      document.querySelectorAll('[data-filter="category"] .tag').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      applyFilters();
    });
  });

  document.querySelectorAll('[data-filter="level"] .tag').forEach(button => {
    button.addEventListener('click', function() {
      activeFilters.level = this.dataset.level || '';
      document.querySelectorAll('[data-filter="level"] .tag').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      applyFilters();
    });
  });

  // Apply both filters simultaneously
  function applyFilters() {
    cards.forEach(card => {
      const matchesCategory = !activeFilters.category || card.dataset.category === activeFilters.category;
      const matchesLevel = !activeFilters.level || card.dataset.level === activeFilters.level;
      card.style.display = (matchesCategory && matchesLevel) ? 'block' : 'none';
    });
  }

  // Flip and drag interaction
  cards.forEach(card => {
    let isClickOnly = true;
    let startX = 0;
    let startY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;

    const handlePointerMove = (e) => {
      if (!(e.buttons & 1)) return; // Check if primary button is held down

      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      const deltaTime = Date.now() - lastTime;

      if (deltaTime > 0) {
        velocityX = deltaX / deltaTime;
        velocityY = deltaY / deltaTime;
      }

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = Date.now();

      const movementX = Math.abs(e.clientX - startX);
      const movementY = Math.abs(e.clientY - startY);

      if (movementX > 5 || movementY > 5) {
        isClickOnly = false;
        card.style.transform = `translate(${e.clientX - startX}px, ${e.clientY - startY}px) rotate(${(e.clientX - startX) * 0.02}deg)`;
      }
    };

    const handlePointerUp = () => {
      card.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);

      if (!isClickOnly) {
        // Animate throw
        let x = 0;
        let y = 0;
        let vx = velocityX * 100;
        let vy = velocityY * 100;
        const friction = 0.96;
        let done = false;

        const animate = () => {
          x += vx;
          y += vy;
          vx *= friction;
          vy *= friction;

          if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
            card.style.transform = '';
            card.style.opacity = '1';
            done = true;
          } else {
            card.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.02}deg)`;
            card.style.opacity = Math.max(0, 1 - (Math.abs(x) + Math.abs(y)) / 500);
            requestAnimationFrame(animate);
          }
        };

        if (!done) animate();
      }
    };

    card.addEventListener('pointerdown', (e) => {
      isClickOnly = true;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = Date.now();
      card.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    });

    card.addEventListener('click', (e) => {
      if (isClickOnly) {
        card.classList.toggle('flipped');
      }
    });
  });

  // Reset cards button
  const resetBtn = document.getElementById('reset-cards');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      cards.forEach(card => {
        card.style.transform = '';
        card.style.opacity = '1';
      });
    });
  }
});
