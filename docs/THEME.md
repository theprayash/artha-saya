# Theme System

NepseWrite supports dark and light themes. The theme is toggled by the user and persisted between visits.

---

## How It Works

1. `ThemeProvider` reads `localStorage('nepse_theme')` on mount (defaults to `"dark"`)
2. Sets `data-theme="dark"` or `data-theme="light"` on `<html>`
3. CSS custom properties (variables) in `globals.css` key off `[data-theme]`
4. All components read these variables — no Tailwind dark: prefix needed

---

## CSS Custom Properties

Defined in `src/app/globals.css`:

```css
/* Dark theme (default) */
:root, [data-theme="dark"] {
  --bg:         #0A0A0A;   /* page background */
  --surface:    #111111;   /* cards, panels */
  --surface2:   #161616;   /* inputs, secondary surfaces */
  --border:     #1E1E1E;   /* default borders */
  --border2:    #2A2A2A;   /* stronger borders / dividers */
  --text:       #F5F5F5;   /* primary text */
  --text-muted: #888888;   /* secondary text, body copy */
  --text-faint: #555555;   /* timestamps, captions, hints */
}

/* Light theme (warm parchment — not pure white) */
[data-theme="light"] {
  --bg:         #F5F2EE;   /* warm parchment */
  --surface:    #EDE9E3;   /* card surfaces */
  --surface2:   #E3DDD5;   /* inputs */
  --border:     #D6CFC5;   /* borders */
  --border2:    #C8BFB3;   /* strong borders */
  --text:       #1E1A16;   /* near-black */
  --text-muted: #5C5248;   /* body text */
  --text-faint: #8C8074;   /* captions */
}
```

**Global tokens** (same in both themes, defined via `@theme`):

| Token | Value | Usage |
|---|---|---|
| `--color-accent` | `#00FF88` | Buttons, links, active states, brand green |
| `--color-danger` | `#FF4545` | Errors, delete buttons |
| `--color-warning` | `#F59E0B` | Warnings, dev mode banners |
| `--font-display` | Bricolage Grotesque | Headings, logo |
| `--font-mono` | JetBrains Mono | Code, labels, slugs |

---

## Using Theme Variables in Components

### Server Components

```tsx
// Use inline style — Tailwind cannot know the variable at build time
<div style={{ background: 'var(--surface)', color: 'var(--text)' }}>
  Content
</div>
```

### Client Components

Same approach:
```tsx
<button
  style={{
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)'
  }}
>
  Button
</button>
```

### Conditional styles in Tailwind

For theme-aware borders/backgrounds, avoid Tailwind's `dark:` prefix — it conflicts with the `data-theme` attribute approach. Use inline styles or `[data-theme=light] .my-class` in globals.css.

---

## Adding a New Themed Component

1. Use `var(--bg)`, `var(--surface)`, `var(--text)` etc. for all colors
2. Test in both themes by toggling the sun/moon button
3. Never hardcode `#0A0A0A`, `#F5F2EE`, or other theme-specific values in component code

If you need a new token that doesn't exist yet, add it to **both** theme blocks in `globals.css`:

```css
:root, [data-theme="dark"] {
  --my-new-token: #somevalue;
}
[data-theme="light"] {
  --my-new-token: #othervalue;
}
```

---

## Accent Color

The brand green `#00FF88` (referenced as `bg-accent` / `text-accent` / `border-accent` in Tailwind, or `var(--color-accent)` in CSS) is **not** changed between themes — it appears the same in both dark and light mode.

If the green becomes hard to read on the light parchment background, add opacity:
```css
color: color-mix(in srgb, #00FF88 80%, var(--text) 20%);
```

---

## Theme Toggle Location

The theme toggle button (`ThemeToggle.tsx`) appears in two places:
1. `SiteHeader` — visible on all public pages (Home, Blog, Terms)
2. Admin sidebar header — visible on all admin pages

---

## Disclaimer Gate Overlay

The `DisclaimerGate` overlay uses a custom blend to work in both themes:
```css
background: color-mix(in srgb, var(--bg) 60%, #000 40%)
```
In dark mode: `#0A0A0A` mixed with black → very dark.  
In light mode: `#F5F2EE` (parchment) mixed with black → warm dark overlay.

---

## localStorage Key

`nepse_theme` — stores `"dark"` or `"light"`. Deleting this key resets to dark theme on next visit.
