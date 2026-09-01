# PATCH-INSTRUCTIONS-3 — Design-fidelity & bug closure

**Source of truth for all visuals:** `tcf-prep-and-blog-site-design/project/TCF Journey.dc.html` (referred to below as *the prototype*, line numbers cited as `proto:NNN`).

This document is the complete, unambiguous spec for closing 10 reported gaps. Each item lists: **Symptom → Root cause (verified in code) → Exact change**. Implement in the order given. Do not invent values not written here; every number/color is copied from the prototype or the existing token system.

Design tokens already available (do not redefine): `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-accent-400`, `--color-accent-600`, `--color-divider`, `--color-section`, `--color-section-kicker`, plus `$space-*`, `$radius-*`, `$font-*`, `$breakpoint-*` in `_sass/variables.scss`. Prototype accent ramp: `500=#9184d9 300=#b5abfc 200=#d2cefd 600=#796cbf`. Light theme accent = `#6f62b8`.

---

## Bug 1 — Tag/category colors ignore theme; layout too loose

**Symptom:** Category/tag colors don't follow dark/light; overall spacing is looser than the prototype (prototype is more compact).

**Root cause:**
- Tag variants (`.tag-neutral`, `.tag-accent`, `.tag-outline`, `.tag-primary`) in `_sass/components/tags.scss` are already token-based, but several page paddings exceed the prototype. The prototype uses tighter section paddings than the current SCSS.
- Spacing deltas (current → prototype):
  - Home hero: current `padding: 70px 40px 60px` matches `proto:117` (OK). Keep.
  - Home stats section: current `_sass/pages/home.scss` `.stats-section { padding: $space-2xl $space-3xl }` = `28px 40px`. Prototype `proto:148` = `46px 40px`. **Change to `46px 40px`** (it is currently too tight vertically — this is the opposite direction but must match).
  - Home tiles gap: current `.tiles-section { gap: $space-4xl }` = `52px`. Prototype `proto:158` gap = `58px`, and inner tile grid gap `proto:160` = `40px`. Set tiles-section `gap: 58px`, `.tiles-grid gap: 58px`, `.tile gap: 40px`.
  - TCF page main padding: current `.tcf-header { padding: 70px 40px 52px }`. Prototype `proto:179` main padding = `52px 40px 90px` and the intro block has `margin-bottom:36px` (`proto:180`). **Set `.tcf-header padding: 52px 40px` and intro `margin-bottom: 36px`.**
  - TCF skill-cards grid gap: current `$space-lg` (16px) matches `proto:187` `gap:14px`? No — set to **`14px`**. Margin-bottom of skill-cards: prototype `34px` (`proto:187`). Set `margin-bottom: 34px`.
  - TCF search block margin-bottom: prototype `16px` (`proto:218`). Facets block margin-bottom: prototype `30px` (`proto:226`). Drills list gap between tâche groups: prototype `36px` (`proto:242`). Current `.drills-list { gap: $space-5xl }` = `70px`. **Change to `36px`.**
  - Drill rows vertical padding: prototype `15px 6px` (`proto:253`). Current `.drill-item { padding: $space-lg $space-sm }` = `16px 8px`. **Change to `15px 6px`.**

**Exact change — tag theme correctness (verify, keep as-is if already true):** In `_sass/components/tags.scss` confirm:
- `.tag-neutral { background: transparent; border-color: var(--color-divider); color: var(--color-text-muted); }`
- `.tag-accent { background: var(--color-accent); color: var(--color-bg); border: none; }`
- `.tag-outline { background: color-mix(in srgb, var(--color-accent) 18%, transparent); border-color: var(--color-accent); color: var(--color-text); }`
- `.tag.active` already equals `.tag-outline` (correct — from prototype `proto:232`).

These already resolve per-theme via `var()`. No hard-coded hex allowed in tag rules.

**Files:** `_sass/pages/home.scss`, `_sass/pages/tcf.scss`, `_sass/components/tags.scss`.

---

## Bug 2 — "x / n done!" badge never appears / wrong format

**Symptom:** The animated `d / n done!` badge on the TCF header is absent.

**Root cause (verified):** `assets/js/tcf-drills.js:40-54` `updateDoneBadge()`:
1. Uses `window.Progress.count()` — the **global** done count across ALL drill types, not TCF-only, and has no total.
2. Renders `` `${count} ${badgeSuffix}` `` → e.g. `"3 done!"`, missing the `/ n` denominator required by the prototype.
3. Hidden entirely when `count === 0` (`display:none`), so a fresh visitor never sees `0 / 12 done!`.

Prototype (`proto:184`, `proto:454`) always renders `doneBadge = d + " / " + n + " done!"` and is always visible on desktop.

**Exact change** in `assets/js/tcf-drills.js`, rewrite `updateDoneBadge()`:
```js
function updateDoneBadge() {
  const badge = document.getElementById('drills-done-badge');
  if (!badge) return;
  const total = drillItems.length;                       // all TCF drills on page
  const done  = drillItems.filter(i => window.Progress.isDone(i.dataset.id)).length;
  const lang  = document.documentElement.getAttribute('data-lang') || 'en';
  const suffix = (lang === 'fr' ? badge.dataset.badgeFr : badge.dataset.badgeEn) || 'done!';
  badge.textContent = `${done} / ${total} ${suffix}`;
  badge.style.display = 'inline-block';                   // always visible (it is .d-only for mobile)
}
```
- Ensure `updateDoneBadge()` is called once on init (after `drillItems` is built) and on every `progresschange`. It is already called inside the toggle handler (`tcf-drills.js:33`); add an explicit call in the init sequence and a `document.addEventListener('progresschange', updateDoneBadge)` if not present.
- `drillItems` must be the array already collected in this file (the `.drill-item` NodeList → Array). Confirm it is in scope of `updateDoneBadge`.

**i18n suffix data:** `_data/i18n.yml` keys `tcf.badge_suffix` must read `done!` (en) / `faits !` (fr). Verify; if the current value is just `done` add the `!` to match `proto:454/481`.

**CSS:** `.done-badge` bobble animation already exists in `_sass/pages/tcf.scss:122-141`. No CSS change.

**Files:** `assets/js/tcf-drills.js`, `_data/i18n.yml` (verify suffix).

---

## Bug 3 — Search bar too short (doesn't fill the row)

**Symptom:** The TCF search input is narrow, floating left of the Reset button instead of filling the row.

**Root cause (verified):** In `_includes/sections/tcf.html:32-39` the `<input class="search-input">` sits inside a wrapper `<div>`. `_sass/pages/tcf.scss` makes `.tcf-search > div:first-child { flex:1 }` (the wrapper stretches) **but** `.search-input` has `flex:1; min-width:280px` — `flex` does nothing because the input is NOT a flex child of `.tcf-search` (the wrapper is). The input therefore uses its intrinsic width, not the wrapper's.

Prototype `proto:219-220`: wrapper `flex:1;min-width:250px`, input fills it, `min-height:44px`, `padding-left:34px`.

**Exact change** in `_sass/pages/tcf.scss` `.search-input`:
```scss
.search-input {
  width: 100%;          // fill the flex:1 wrapper — THE FIX
  min-height: 44px;
  padding: 0 $space-lg 0 34px;   // left room for the search glyph
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  border-radius: $radius-md;
  color: var(--color-text);
  font-size: 15px;
  &::placeholder { color: var(--color-text-light); }
}
```
Remove the now-meaningless `flex:1; min-width:280px` from `.search-input`. Keep `.tcf-search > div:first-child { position:relative; flex:1; min-width:250px }` and `.search-icon { left:11px; top:12px }` (`proto:221`).

**Files:** `_sass/pages/tcf.scss`.

---

## Bug 4 — Blog list section too narrow

**Symptom:** Blog list column feels cramped for the page.

**Root cause (verified):** `_sass/pages/blog.scss` `.blog-header` and `.posts-list` both `max-width: 820px`. Prototype blog main is `max-width:860px` (`proto:362`).

**Exact change** in `_sass/pages/blog.scss`: set both `.blog-header` and `.posts-list` `max-width: 860px`. (Matches prototype exactly; do not exceed 860px — the single-column reading measure is intentional.)

**Files:** `_sass/pages/blog.scss`.

---

## Bug 5 — EN/FR and light/dark toggle styling differs from prototype

**Symptom:** Header language and theme toggles look different from the design.

**Root cause (verified):** `_sass/components/header.scss`:
- Lang spans use `padding: $space-sm $space-md` (8px 12px); prototype `proto:88-89` uses `padding:6px 9px`.
- Active lang uses `box-shadow: inset 0 0 0 1px var(--color-accent)` + accent color (matches prototype) — keep, but inactive color should be `color-mix(in srgb, var(--color-text) 50%, transparent)` (`proto:89`), currently `--color-text-light`.
- Theme/menu toggles use `padding: $space-sm $space-xs` with no fixed square; prototype renders them as icon buttons (`btn btn-secondary btn-icon`). Approximate an icon button: fixed min size, centered glyph.

**Exact change** in `_sass/components/header.scss`:
```scss
.lang-toggle {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid var(--color-divider);
  border-radius: $radius-md;
  background: transparent;
  padding: 0;
  font-family: $font-heading;

  span {
    padding: 6px 9px;                 // proto:88
    font-size: 12px;
    color: color-mix(in srgb, var(--color-text) 50%, transparent);   // inactive
  }
}
html[data-lang="en"] .lang-toggle .lang-en,
html[data-lang="fr"] .lang-toggle .lang-fr {
  color: var(--color-accent);
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

.theme-toggle,
.menu-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  min-height: 34px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--color-divider);
  border-radius: $radius-md;
  color: var(--color-text);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  &:hover { background: var(--color-hover-bg); }
}
```
Header controls gap = `$space-sm` (8px, `proto:85`) — already correct.

**Files:** `_sass/components/header.scss`.

---

## Bug 6 — Drill page: "mark as done" has no visible change/animation; "next drill" does nothing useful

**Symptom:** On an individual drill page the done button barely changes and never animates; next-drill navigates randomly (feels broken).

**Root cause (verified):**
- `assets/js/drill-page.js:22-36` swaps inline `display` of `.done-text`/`.done-check` but never adds the `.done` class, so `_sass/pages/drill.scss` `.drill-done-btn-large.done` (which only re-states accent anyway) never engages. The prototype's done state is a **filled** primary button (`btn btn-primary`, `proto:305`) — an obvious visual flip, plus confetti. Current styling change is nearly invisible.
- `assets/js/drill-page.js:60-78` fetches `/tcf/` and picks `drills[Math.floor(Math.random()*…)]` — random, not sequential. Prototype `nextDrill` (`proto:310`) advances to the **next** drill in library order.

**Exact change — done button visual (proto:304-309):**
1. `drill-page.js` `updateButtonState()`: also `doneBtn.classList.toggle('done', isDone)`.
2. `_sass/pages/drill.scss` `.drill-done-btn-large.done` becomes a filled accent button:
```scss
.drill-done-btn-large.done {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg);
}
```
3. Add `.pop` interaction feel: give `.drill-done-btn-large` `transition: transform .28s cubic-bezier(.2,1.5,.4,1), background .2s, color .2s, border-color .2s;` and on `:active { transform: translateY(1px); }`. Confetti already fires via `window.Progress.confetti(doneBtn)` on mark-done (`drill-page.js:47-49`) — keep.
4. i18n label swap: the button already has `data-i18n`/`data-i18n-marked` attributes but `navbar.js` only handles `data-i18n-en/fr` (plain). Because the two states are two separate `<span>`s (`.done-text`, `.done-check`) each without i18n attributes, the French labels won't apply. **Add** `data-i18n-en/fr` to `.done-text` (mark_done) and to the text portion of `.done-check` (marked_done) in `_layouts/drill.html`, so language toggle updates both.

**Exact change — sequential next drill:**
Replace the random pick with deterministic order. Two acceptable approaches; use **A** (no network, robust):

**A. Embed an ordered id list on the drill page.** In `_layouts/drill.html`, before the closing wrapper, emit the full drill order and current index using the same collection order as the TCF list (`site.tcf | group_by:"tache" | sort:"name"` then items — must match `_includes/sections/tcf.html:74`). Simpler and guaranteed-consistent: iterate `site.tcf` in the site's default sort and output a JSON array of URLs:
```liquid
{%- assign ordered = site.tcf | sort: "date" -%}
<script type="application/json" id="drill-order">
[{% for d in ordered %}{{ d.url | relative_url | jsonify }}{% unless forloop.last %},{% endunless %}{% endfor %}]
</script>
```
Then `drill-page.js` next handler:
```js
nextBtn.addEventListener('click', function () {
  let order = [];
  try { order = JSON.parse(document.getElementById('drill-order').textContent); } catch (e) {}
  const here = document.querySelector('[data-drill-id]')?.dataset.drillId;
  const i = order.indexOf(here);
  const next = i >= 0 && order.length ? order[(i + 1) % order.length] : order[0];
  if (next) window.location.href = next;
});
```
- Wrap-around (`% order.length`) matches "keeps you moving through the library." Remove the `fetch`/DOMParser/random block entirely.
- **Order must equal the TCF list order.** If the TCF list is grouped by tâche then sorted, mirror that exact ordering in the `#drill-order` emission instead of `sort:"date"`. Decision: use `sort: "date"` for both the TCF list default AND here to keep them identical — if you change one, change both. (Confirm the TCF list's effective order and match it; do not leave them divergent.)

**Files:** `assets/js/drill-page.js`, `_sass/pages/drill.scss`, `_layouts/drill.html`.

---

## Bug 7 — Blog post page: needs "← previous post" (left) + "next post →" (right), greyed when absent

**Symptom:** Post footer has only one "next post →" button; navigation is random; no previous; no disabled state.

**Root cause (verified):**
- `_layouts/post.html:33-36` renders a single `#next-post-btn`.
- `assets/js/post-page.js:20-40` fetches `/blog/` and picks a **random** `.post-preview` link.
Prototype post footer (`proto:398`) shows a next button; the user requires the richer prev/next pattern with disabled endpoints.

**Exact change — markup** `_layouts/post.html`, replace `.post-footer`:
```html
<div class="post-footer">
  <a class="post-prev-btn" id="prev-post-btn" rel="prev"
     data-i18n-en="{{ site.data.i18n.en.blog.prev }}" data-i18n-fr="{{ site.data.i18n.fr.blog.prev }}">← {{ site.data.i18n.en.blog.prev }}</a>
  <a class="post-next-btn" id="next-post-btn" rel="next"
     data-i18n-en="{{ site.data.i18n.en.blog.next }}" data-i18n-fr="{{ site.data.i18n.fr.blog.next }}">{{ site.data.i18n.en.blog.next }} →</a>
</div>
```
- Note the arrow glyphs (`←`, `→`) are static and must sit OUTSIDE the i18n text node, but `navbar.js` sets `textContent` (wiping the arrow). To keep arrows, put arrow + label together in the i18n string is not possible (label is data-driven). **Solution:** wrap the label in an inner `<span data-i18n-*>` and keep the arrow as a sibling text node:
```html
<a class="post-prev-btn" id="prev-post-btn" rel="prev">← <span data-i18n-en="{{ site.data.i18n.en.blog.prev }}" data-i18n-fr="{{ site.data.i18n.fr.blog.prev }}">{{ site.data.i18n.en.blog.prev }}</span></a>
<a class="post-next-btn" id="next-post-btn" rel="next"><span data-i18n-en="{{ site.data.i18n.en.blog.next }}" data-i18n-fr="{{ site.data.i18n.fr.blog.next }}">{{ site.data.i18n.en.blog.next }}</span> →</a>
```

**Exact change — sequential prev/next (embed order, no network):** In `_layouts/post.html` emit ordered post URLs (blog order = reverse-chronological, Jekyll default for `site.blog`):
```liquid
<script type="application/json" id="post-order">
[{% for p in site.blog %}{{ p.url | relative_url | jsonify }}{% unless forloop.last %},{% endunless %}{% endfor %}]
</script>
```
Rewrite `assets/js/post-page.js` navigation:
```js
const here = document.querySelector('.post-page [data-post-here]')?.dataset.postHere
          || location.pathname;
let order = [];
try { order = JSON.parse(document.getElementById('post-order').textContent); } catch (e) {}
const i = order.indexOf(here);
const prevBtn = document.getElementById('prev-post-btn');
const nextBtn = document.getElementById('next-post-btn');
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
    btn.classList.add('is-disabled');           // greyed out — no navigation
  }
}
wire(prevBtn, prevUrl);
wire(nextBtn, nextUrl);
```
- Add `data-post-here="{{ page.url | relative_url }}"` to the `.post-page` root (or reuse the existing `.post-data[data-blog-url]` div by adding the attribute). The index compares the current URL against `#post-order`.
- Remove the old fetch/random block entirely.

**Exact change — CSS** in `_sass/pages/post.scss` (create the file if absent; it is imported via the pages glob — verify `main.scss`/`style.scss` `@use` list includes it, add if missing):
```scss
.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $space-lg;
  margin-top: $space-3xl;
  padding-top: $space-2xl;
  border-top: 1px solid var(--color-divider);
}
.post-prev-btn, .post-next-btn {
  display: inline-flex;
  align-items: center;
  gap: $space-sm;
  padding: $space-md $space-2xl;
  border: 1px solid var(--color-divider);
  border-radius: $radius-md;
  color: var(--color-text);
  text-decoration: none;
  font-size: 14px;
  transition: border-color 0.2s, color 0.2s, opacity 0.2s;
  &:hover { border-color: var(--color-accent); color: var(--color-accent); }
}
.post-next-btn { margin-left: auto; }
.is-disabled {
  opacity: 0.35;
  pointer-events: none;          // non-clickable when greyed
  cursor: default;
}
```
- If `_sass/pages/post.scss` doesn't exist, place these rules in the existing post stylesheet (grep for `.post-container` to find it) rather than creating a new orphan file.

**i18n:** add `blog.prev` to `_data/i18n.yml`: en `Previous post`, fr `Article précédent`. `blog.next` already exists.

**Files:** `_layouts/post.html`, `assets/js/post-page.js`, post SCSS, `_data/i18n.yml`.

---

## Bug 8 — French cards jump downward when clicked

**Symptom:** Clicking a card nudges it down; not a clean in-place flip.

**Root cause (verified):** `_sass/pages/french.scss:116-122` adds hover lift to the flipper:
```scss
.flip-card:hover .card-inner { transform: translateY(-4px); }
.flip-card.flipped:hover .card-inner { transform: rotateY(180deg) translateY(-4px); }
```
Sequence: pointer over card → `translateY(-4px)` (card sits 4px up). Click flips → still hovered, so `rotateY(180deg) translateY(-4px)`. When the pointer then leaves (or focus/settle), the `-4px` is dropped → the card **drops 4px downward**. The prototype flipper (`proto:47-48`, `proto:336`) has **no hover lift** — only `rotateY`. The lift is the artifact.

**Exact change** in `_sass/pages/french.scss`: **delete** both hover-lift rules (lines 116-122). Keep only:
```scss
.card-inner {
  position: relative; width: 100%; height: 100%;
  transition: transform 0.55s cubic-bezier(0.3, 1.4, 0.4, 1);   // match proto:47 .55s
  transform-style: preserve-3d;
}
.flip-card.flipped .card-inner { transform: rotateY(180deg); }
```
- No hover transform on `.card-inner` or `.flip-card`. Hover cursor stays `grab` (already set).
- Also verify the drag/throw JS (`assets/js/french-cards.js`) writes transforms to the **button** (`.flip-card`), never to `.card-inner`, so the flip and the throw don't fight. It currently sets `card.style.transform` on the button — correct; leave it. The reset button clears `card.style.transform` — correct.

**Files:** `_sass/pages/french.scss`.

---

## Bug 9 — French "reset thrown cards" button disappears

**Symptom:** The `↻` reset button vanishes (after load or language switch).

**Root cause (verified — this is the key finding):** `assets/js/navbar.js:15-18`:
```js
document.querySelectorAll('[data-i18n-en]').forEach(el => {
  const v = el.dataset['i18n' + suffix];
  if (v != null) el.textContent = v;      // wipes ALL children
});
```
The container `.french-hint` (in `_includes/sections/french.html:37-43`) carries `data-i18n-en/fr` **and** contains the `<button id="reset-cards">` as a child. Setting `el.textContent = v` replaces every child (including the button) with a single text node. So the button is destroyed on the first i18n pass (runs on load and on every language toggle).

**Exact change — restructure markup so the translated text and the button are siblings, and only a leaf node carries `data-i18n`.** In `_includes/sections/french.html` replace the hint block:
```html
<div class="french-hint">
  <span class="hand"
        data-i18n-en="{{ site.data.i18n.en.french.hint }}"
        data-i18n-fr="{{ site.data.i18n.fr.french.hint }}">{{ site.data.i18n.en.french.hint }}</span>
  <button id="reset-cards" class="reset-btn" type="button" aria-label="Reset cards"
          data-i18n-aria-en="{{ site.data.i18n.en.french.reset }}"
          data-i18n-aria-fr="{{ site.data.i18n.fr.french.reset }}">↻</button>
</div>
```
- The `data-i18n-en/fr` now lives on the inner `<span>` (a leaf → safe to have its `textContent` replaced). The button is a sibling, untouched. `.french-hint` itself no longer has `data-i18n`.
- `_sass/pages/french.scss` `.french-hint` already `display:flex; align-items:center; gap:$space-md` — keep. Move the `.hand` font onto the inner span (add `.french-hint .hand` or the span already has class `hand`).

**General hardening (recommended, prevents recurrence):** `navbar.js` `textContent` assignment is unsafe for any element that also has children. Either (a) only ever put `data-i18n-en/fr` on leaf elements (enforced by this fix), or (b) change navbar.js to write into a dedicated text node. **This patch uses (a)** — but audit all templates: grep for `data-i18n-en` on elements that contain child elements and give each its own leaf span. Known offender fixed here; verify drill done button spans (Bug 6) and post prev/next (Bug 7) follow the leaf rule.

**Files:** `_includes/sections/french.html`; audit others.

---

## Bug 10 — Blog list: number & title/summary positioning wrong

**Symptom:** The post number and the title/summary are positioned differently from the design.

**Root cause (verified):** Prototype row (`proto:368-377`) is a 2-column grid `1fr auto`: **left** = meta (date · read) + title (28px) + summary (14px); **right** = the number, `d-only`, `font-size:44px`, `color: color-mix(in srgb, var(--color-accent) 26%, transparent)`, `letter-spacing:-.04em`. Current impl (`_includes/sections/blog.html:11-24` + `_sass/pages/blog.scss`) puts a **92px** number on the **left** (flex order-first, `color-mix(text 8%)`, `width:120px`), and injects a `post-thumb` image that the prototype's list does not use.

**Exact change — markup** `_includes/sections/blog.html`, the `.post-preview` becomes a grid with number on the right:
```html
<a class="post-preview rowlink" data-reveal href="{{ post.url | relative_url }}" data-post-id="{{ post.url | relative_url }}">
  <span class="post-body">
    <span class="post-meta">
      <span class="post-date">{{ post.date | date: "%d %b %Y" }}</span>
      <span class="meta-divider">·</span>
      {%- assign words = post.content | number_of_words -%}
      {%- assign mins = words | divided_by: 200.0 | ceil -%}
      <span class="post-read">{{ post.minutes | default: mins }} min</span>
    </span>
    <span class="post-title" data-i18n-en="{{ post.title | escape }}" data-i18n-fr="{{ post.title_fr | default: post.title | escape }}">{{ post.title }}</span>
    <span class="post-summary">{{ post.summary }}</span>
  </span>
  <span class="post-number d-only" aria-hidden="true">{{ forloop.index | prepend: "0" | slice: -2, 2 }}</span>
</a>
```
- The whole row is a single `<a>` (matches `proto:368`), no nested `<a>`, no image in the list (drop the `post-thumb` include from the list rows to match the design — thumbnails belong to the post page, not the list). If keeping thumbnails is desired later, that is a separate decision; the prototype list has none.
- Title/summary are `<span>` leaves so i18n is safe (Bug 9 rule).

**Exact change — CSS** `_sass/pages/blog.scss`:
```scss
.posts-list { max-width: 860px; margin: 0 auto; padding: 0 $space-3xl $space-4xl; display: flex; flex-direction: column; }

.post-preview {
  display: grid;
  grid-template-columns: 1fr auto;      // proto:368
  gap: 20px;
  align-items: center;
  padding: 22px 6px;                     // proto:368
  border-bottom: 1px solid var(--color-divider);
  text-decoration: none;
  color: inherit;
  // .rowlink hover (background + padding-left) comes from base.scss
}
.post-body { display: flex; flex-direction: column; }
.post-meta { display: flex; gap: 10px; align-items: baseline; font-size: 11px; color: color-mix(in srgb, var(--color-text) 45%, transparent); }
.post-title { display: block; font-family: $font-heading; font-size: 28px; letter-spacing: -0.025em; line-height: 1.18; margin: 8px 0 6px; }
.post-summary { display: block; font-size: 14px; color: color-mix(in srgb, var(--color-text) 66%, transparent); max-width: 580px; text-wrap: pretty; margin: 0; }
.post-number {                            // proto:376 — RIGHT side, small, accent-tinted
  font-family: $font-heading;
  font-size: 44px;
  letter-spacing: -0.04em;
  line-height: 1;
  color: color-mix(in srgb, var(--color-accent) 26%, transparent);
}
```
- Delete the old left-number rules (`92px`, `width:120px`, `text 8%`) and the `.post-preview a { flex:1 }` / `.post-preview h2` / `.post-thumb` list rules that no longer apply.
- `.rowlink` hover (`background: color-mix(text 5%); padding-left:14px`) is inherited from `base.scss` — do not duplicate.

**Files:** `_includes/sections/blog.html`, `_sass/pages/blog.scss`.

---

## Cross-cutting rule (applies to Bugs 6, 7, 9, 10)

**i18n leaf rule:** any element with `data-i18n-en/fr` MUST be a leaf (no element children), because `navbar.js` overwrites its `textContent`. When a design element mixes a translated label with a static glyph or a sibling control, wrap the label in its own `<span data-i18n-*>` and keep glyphs/controls as siblings.

---

## Verification (run after implementing all)

1. `docker compose exec jekyll jekyll build` → must finish with no SCSS/Liquid errors.
2. Serve and check each page returns 200: `/`, `/tcf/`, `/french/`, `/blog/`, one drill URL, one post URL.
3. Manual/DOM checks:
   - **B2:** `/tcf/` header shows `0 / N done!` on first load (no localStorage), animates (bobble), updates to `1 / N done!` after ticking a drill.
   - **B3:** search input spans the full row up to the Reset button at ≥1024px.
   - **B4:** blog list column is 860px wide.
   - **B5:** lang toggle spans `6px 9px`; active span has accent inset ring; theme/menu are 34px square icon buttons.
   - **B6:** drill done button flips to filled accent + confetti; label switches EN/FR; "next drill" advances to the sequentially next drill (and wraps at the end).
   - **B7:** post footer shows `← Previous post` left, `Next post →` right; first post greys the prev button, last post greys the next button; greyed buttons don't navigate.
   - **B8:** clicking a French card flips in place with zero vertical shift.
   - **B9:** `↻` reset button present on load AND after toggling EN⇄FR; clicking it returns thrown cards home.
   - **B10:** blog rows show number on the right (44px, accent-tinted, desktop only); meta/title/summary stacked on the left.
   - **B1:** switch to light theme — tags, active tags, kickers, section backgrounds all recolor via tokens (no stuck dark colors); section paddings match the tightened values.
