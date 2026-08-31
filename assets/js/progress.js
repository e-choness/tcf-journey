// Centralized progress tracking (§3.4, §3.5)
window.Progress = (function () {
  const KEY = 'tcf-journey-progress';

  function all() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function isDone(id) {
    return !!all()[id];
  }

  function toggle(id) {
    const p = all();
    if (p[id]) delete p[id]; else p[id] = true;  // delete, never store false
    localStorage.setItem(KEY, JSON.stringify(p));
    document.dispatchEvent(new CustomEvent('progresschange', { detail: { id, done: !!p[id] } }));
    return !!p[id];
  }

  function count() {
    return Object.values(all()).filter(Boolean).length;
  }

  // Confetti burst from a given element (§3.5)
  function confetti(el) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const r = el.getBoundingClientRect();
    const cols = ['#9184d9', '#b5abfc', '#d2cefd', '#796cbf'];  // accent ramp 500/300/200/600
    for (let i = 0; i < 16; i++) {
      const d = document.createElement('span');
      d.style.cssText = 'position:fixed;z-index:99;width:7px;height:7px;border-radius:2px;' +
        'pointer-events:none;background:' + cols[i % 4] +
        ';left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 2) + 'px';
      document.body.appendChild(d);

      const a = (Math.PI * 2 * i) / 16 + Math.random() * 0.4;
      const dist = 60 + Math.random() * 70;

      d.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        {
          transform: 'translate(' + Math.cos(a) * dist + 'px,' + (Math.sin(a) * dist + 40) +
            'px) rotate(' + (Math.random() * 540) + 'deg) scale(.4)',
          opacity: 0
        }
      ], { duration: 750 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.3,1)' })
        .onfinish = () => d.remove();
    }
  }

  return { all, isDone, toggle, count, confetti };
})();
