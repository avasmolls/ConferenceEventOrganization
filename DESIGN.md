# CONVERGE '26 — Design System

**Section owner:** Chetan Konathala — CSS & Visual Design
**Course:** IST 256, Penn State · Conference Event Organizing / Attendee Management
**Deliverable:** [`css/styles.css`](css/styles.css) — 1,790 lines, 23 documented layers

---

## 1. The brief, and the decision

The team's starting `index.html` already carried a real point of view: Inter,
uppercase display type, tight negative tracking, and a signal orange
`#ff4d00`. That is a legitimate Swiss-editorial system, so the work here
**extends it rather than replacing it** — the orange is inherited unchanged and
is still the only accent in the palette.

Three things changed:

| Before | After | Why |
|---|---|---|
| CSS inline in `<style>` on each page | One external `css/styles.css` | Two pages were already drifting apart. One stylesheet, one source of truth. |
| `#d9d9d9` placeholder boxes | CSS-drawn hero badge, gradient avatars, typographic wordmarks | Grey rectangles read as unfinished. Nothing here depends on an image file that can 404. |
| Light-only, single theme | Dark-default with a light theme and a toggle | A dark canvas with one hot accent is how premium event brands present; light remains available and respects the OS setting. |

---

## 2. Tokens

Everything is a CSS custom property on `:root`. No hard-coded hex values appear
below the token block, so retheming the entire site is a single-block edit.

### Colour

| Token | Dark (default) | Light | Role |
|---|---|---|---|
| `--c-canvas` | `#08080a` | `#faf8f5` | Page background — warm-shifted, never dead `#000` |
| `--c-surface` | `#0e0e13` | `#ffffff` | Cards, panels |
| `--c-text` | `#f6f4f1` | `#0a0a0c` | Body ink — warm paper white, softer than `#fff` |
| `--c-text-muted` | `#a1a1ae` | `#55555f` | Secondary copy |
| `--c-line` | `rgba(255,255,255,.10)` | `rgba(10,10,12,.12)` | **The hairline** — primary structural device |
| `--c-signal` | `#ff4d00` | `#ff4d00` | The one accent, inherited from the team |
| `--c-signal-ink` | `#0a0a0a` | `#0a0a0a` | Text on orange — 8.9:1 contrast |

**Palette discipline:** one accent, plus neutrals. No second hue was
introduced. A single hot colour against a tight neutral ramp is what makes the
orange read as *signal* rather than decoration.

### Type

Three faces, each with one job:

- **Inter Tight** — display. Set at `-0.045em` tracking, uppercase, `0.92` line-height.
- **Inter** — body copy, `1.6` line-height, capped at `62ch` (`--measure`).
- **JetBrains Mono** — eyebrows, labels, numerals, timestamps. Technical precision as a texture.

The scale is fluid, so nothing needs a breakpoint to resize:

```css
--t-display: clamp(2.75rem, 9vw, 7.5rem);
--t-h1:      clamp(2.25rem, 6vw, 4.5rem);
--t-h2:      clamp(1.75rem, 4vw,   3rem);
```

### Space, radius, motion

8px-based spacing (`--s-1` … `--s-10`), plus `--s-section: clamp(4rem, 9vw, 8.5rem)`
for vertical rhythm. Radii stay tight (2–14px) — sharp corners read editorial.
Motion uses two shared easings, `--e-out` for entrances and `--e-inout` for loops.

---

## 3. Signature devices

What makes the site look like one designed system rather than Bootstrap defaults:

1. **The hairline.** A 1px `--c-line` divides every band, every table row, every
   form group. Structure is drawn, not implied by shadow.
2. **Numbered eyebrows.** `01 / AGENDA ————` in mono, with a rule that runs to
   the edge. Orients the reader and carries the Swiss grid reference.
3. **Film grain.** A 220×220 SVG `feTurbulence` tile at 3.5% opacity, fixed over
   the viewport in `overlay` blend. Four lines of CSS; it is the single biggest
   contributor to the page not feeling flat.
4. **Aurora bloom.** Blurred orange radial gradients bleeding off-canvas behind
   the hero.
5. **Outlined type.** The hero's third line uses `-webkit-text-stroke` instead of
   a fill — contrast within a single headline, no extra colour needed.
6. **The badge.** The hero visual is an attendee credential built entirely in
   CSS: lanyard slot via `::before`, and a QR code faked with a
   `repeating-conic-gradient`. On-theme, and zero image requests.
7. **Wipe-fill buttons.** `::before` scales from `scaleY(0)` on the Y axis —
   fills orange on hover, inverts to ink for the primary variant.
8. **Gradient-initial avatars.** Hue derived deterministically from the
   attendee's name, so a given person's colour never changes between renders.

---

## 4. Form system (`signup.html`)

The registration form was the focus of this section's work.

**Integration contract.** Validation styling is bound to **Bootstrap's own
classes**, not a bespoke API:

```
.is-invalid  →  reveals the sibling .invalid-feedback, red border, tinted fill
.is-valid    →  green border, reveals .valid-feedback
```

The JavaScript owner toggles those two classes and every visual state appears.
The original field ids — `tbEmail`, `tbName`, `tbAge`, `tbAddress` — are
preserved exactly, and `validateData()` is still the global submit entry point,
so logic written against the earlier sketch keeps working.

**States covered:** rest · hover · focus (3px orange halo) · filled · invalid ·
valid · disabled · read-only · adornment (`+1` phone prefix) · textarea ·
custom select caret · checkbox · radio-as-card (tier picker).

**Two wrapping edge cases.** The phone input sits inside `.input-group-x` and
the consent box inside a `<label>`, so in neither case is the error message a
DOM sibling of the control, and `.is-invalid ~ .invalid-feedback` cannot reach
it. Solved with `:has()`, with a `.field.has-error` class toggled in JS as the
fallback for browsers that lack it.

**Supporting patterns:** a completion meter driven by the required-field rules,
an error summary that takes focus on a failed submit, a motion-safe `shake`,
toasts, and an empty state for the register.

---

## 5. Responsive behaviour

Mobile-first, with Bootstrap's grid for columns and custom CSS for components.

| Width | Behaviour |
|---|---|
| < 576px | Single column; 16px gutter; stats compress |
| < 768px | **The attendee table becomes stacked cards** — `thead` hides and each cell draws its own label from `data-label`, so no horizontal scroll |
| < 992px | Nav collapses to a custom hamburger that animates to an X; the menu is a fixed sheet |
| ≥ 1320px | `--shell` caps and centres |

Fluid `clamp()` type means text scales continuously between those points rather
than jumping at each one.

---

## 6. Accessibility

Treated as part of the design, not a retrofit.

- **Contrast:** body text 15.8:1 on dark, 17.4:1 on light. `--c-signal-ink` on
  `--c-signal` is 8.9:1. All exceed WCAG AA.
- **Focus:** one `:focus-visible` ring everywhere — 2px orange, 3px offset.
  Never removed; keyboard-only so it does not fire on mouse clicks.
- **Skip link** on both pages, revealed on focus.
- **Errors** are announced: `role="alert"` on the summary, `aria-invalid` and
  `aria-describedby` per field, and focus moves to the first bad control.
- **`prefers-reduced-motion`** collapses every animation to 0.01ms, stops the
  marquee, and un-rotates the badge.
- **`prefers-contrast: more`** strengthens hairlines and mutes.
- **`.no-js`** guard means `.reveal` content is visible if JS fails — content is
  never hidden behind an animation that might not run.
- **Print styles** drop the chrome and invert to ink-on-white, so the pages
  export cleanly into the PDF report.

---

## 7. Bootstrap integration

Bootstrap 5.3 does the grid, reboot and utilities. Custom CSS loads **after** it
and owns the look. Rather than fight it, the system feeds it tokens:

```css
:root {
  --bs-body-bg:      var(--c-canvas);
  --bs-body-color:   var(--c-text);
  --bs-border-color: var(--c-line);
  --bs-primary:      var(--c-signal);
}
```

`data-bs-theme` is kept in sync with `data-theme` by the toggle, so Bootstrap's
own dark mode follows the site instead of diverging from it. No `!important`
appears anywhere except the reduced-motion block, where overriding is the point.

---

## 8. File map

```
css/styles.css     ← design system (this document's deliverable)
js/app.js          ← theme toggle, nav, reveal, counters, toasts
js/signup.js       ← validation, JSON storage, CRUD rendering
data/attendees.json← sample attendee register
index.html         ← homepage
signup.html        ← attendee registration
```
