# Patch Instructions 4 — Three Remaining Bugs

---

## Bug A: French card flip does not respond to click (card "stays in place")

### Symptom
Clicking a flip card on the French page sometimes does nothing — the card does not rotate. On touch devices or with minor unintentional pointer movement during click, the flip is blocked entirely.

### Root cause — `assets/js/french-cards.js`

The `handlePointerMove` listener checks:
```js
if (movementX > 5 || movementY > 5) {
  isClickOnly = false;
  card.style.transform = `translate(...)`;
}
```

The threshold of `5px` is too small. Any pointer movement exceeding 5px during the pointerdown→pointerup window sets `isClickOnly = false`. The `click` event handler then checks:
```js
card.addEventListener('click', () => {
  if (isClickOnly) { ... }  // ← NEVER fires when isClickOnly=false
});
```

On a trackpad, touch screen, or even a normal mouse click with slight tremor, the pointer can easily move 5-9px. The card never flips.

The previous fix (removing hover `translateY(-4px)` from CSS) was correct but addressed a *different* symptom. This JS threshold is the actual blocker.

### Exact change — `assets/js/french-cards.js`

**One line change**, line where movement is compared:

```js
// BEFORE (line ~67):
if (movementX > 5 || movementY > 5) {

// AFTER:
if (movementX > 10 || movementY > 10) {
```

Change `5` → `10` in BOTH the `movementX` and `movementY` comparisons (they are in a single `||` expression on the same line).

10px is still well below any intentional drag gesture (users typically move 30–100px when dragging), but forgiving enough for clean taps and clicks that have micro-movement.

No other changes to `french-cards.js`.

---

## Bug B: Hamburger menu icon visible on desktop (should be mobile-only)

### Symptom
On desktop viewport (> 860px), the hamburger `☰` button appears in the header alongside the desktop nav links. It should only appear on mobile.

### Root cause — CSS specificity conflict between `base.scss` and `header.scss`

`header.html` correctly marks the button with `.m-only`:
```html
<button class="menu-toggle m-only" id="menu-toggle" ...>☰</button>
```

`base.scss` defines:
```css
.m-only { display: none; }           /* ← no !important */
@media (max-width: 860px) {
  .m-only { display: flex !important; }  /* ← has !important */
}
```

`header.scss` defines:
```css
.theme-toggle,
.menu-toggle {
  display: inline-flex;   /* ← same specificity [0,1,0], declared later */
  ...
}
```

Both `.m-only` and `.menu-toggle` are class selectors (specificity `[0,1,0]`). `header.scss` is compiled after `base.scss`, so **`.menu-toggle { display: inline-flex }` wins over `.m-only { display: none }`** on desktop.

On mobile, the `!important` on `.m-only { display: flex !important }` saves it. But the default desktop rule has no `!important`, so it loses the cascade war.

### Exact change — `_sass/base.scss`

Add `!important` to the desktop `.m-only` rule to match the pattern already used on mobile:

```scss
// BEFORE:
.m-only {
  display: none;
}

// AFTER:
.m-only {
  display: none !important;
}
```

Only the one `.m-only` declaration at the top level needs `!important`. The breakpoint rule already has it. Do not touch `.d-only` or any other rule.

---

## Bug C: Mobile nav menu is too large / not compact

### Symptom
On mobile (≤ 860px), opening the hamburger menu reveals navigation links at `34px` font size with generous padding, making the menu visually overwhelming and requiring scrolling to see all items on small screens.

### Root cause — `_sass/components/header.scss`

The `.mobile-nav a` rule uses an editorial "big dramatic menu" style:
```scss
.mobile-nav {
  padding: $space-sm $space-xl $space-lg;   // container padding
  gap: 2px;

  a {
    padding: $space-lg $space-sm;   // $space-lg = 16px vertical
    font-size: 34px;                // very large
    letter-spacing: -.03em;
  }
}

.mobile-nav-foot {
  padding: $space-lg $space-sm;   // $space-lg = 16px top
}
```

This makes each nav item ~50-60px tall. With 5 items + footer, the menu is ~300px+ of height just for links.

### Exact change — `_sass/components/header.scss`

Inside the `.mobile-nav` block, change:
1. Container `padding`: `$space-sm $space-xl $space-lg` → `$space-xs $space-xl $space-sm`
2. Link `font-size`: `34px` → `18px`
3. Link `padding`: `$space-lg $space-sm` → `$space-sm $space-sm` (reduce vertical padding per item from 16px to 8px)
4. Link `letter-spacing`: remove the `-0.03em` (was part of the large-header aesthetic; at 18px it's unnecessary)
5. `.mobile-nav-foot` `padding`: `$space-lg $space-sm` → `$space-sm $space-sm`

The `.mobile-nav-num` size (11px, accent color) is correct — leave it.
The `.mobile-nav { gap: 2px }` is fine — leave it.
The `border-bottom: 1px solid var(--color-divider)` on each link provides good visual separation at the smaller size — leave it.

Full resulting block (for clarity):
```scss
.mobile-nav {
  display: none;
  flex-direction: column;
  gap: 2px;
  padding: $space-xs $space-xl $space-sm;     // tightened
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-divider);

  a {
    display: flex;
    align-items: baseline;
    gap: $space-md;
    padding: $space-sm $space-sm;             // tightened
    text-decoration: none;
    color: inherit;
    font-family: $font-heading;
    font-size: 18px;                          // reduced from 34px
    border-bottom: 1px solid var(--color-divider);

    &.active {
      color: var(--color-accent);
    }
  }

  &.open {
    display: flex;
  }
}

.mobile-nav-num {
  font-size: 11px;
  color: var(--color-accent);
}

.mobile-nav-foot {
  font-family: $font-hand;
  padding: $space-sm $space-sm;              // tightened from $space-lg
  color: var(--color-text-light);
}
```

---

## Verification checklist

- [ ] Build passes: `docker compose exec jekyll jekyll build` — no errors
- [ ] Bug A: Click a French card with a clean click → card flips 180deg smoothly. Click it again → flips back. Dragging > 10px throws the card (does NOT flip).
- [ ] Bug B: On desktop (> 860px): hamburger `☰` is invisible. Resize to < 860px: hamburger appears. Click hamburger: mobile nav opens.
- [ ] Bug C: On mobile (< 860px): opening the menu shows compact 18px links with tight padding. All 5 nav items visible without scrolling on a 375px-wide screen.
