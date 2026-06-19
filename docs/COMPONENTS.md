# Components

All components live in `src/components/`. This document covers the shared components used across the site. Page-specific components (PostEditor, PostsTable, etc.) are covered in [ADMIN.md](ADMIN.md).

---

## ThemeProvider

**File**: `src/components/ThemeProvider.tsx`  
**Type**: Client Component  
**Used in**: `src/app/layout.tsx` (wraps entire site)

Manages dark/light theme state. On first mount, reads `nepse_theme` from `localStorage` (defaults to `"dark"`). Sets `data-theme` attribute on `document.documentElement` which CSS custom properties key off.

Exports `ThemeCtx` context and `useTheme()` hook.

```typescript
import { useTheme } from '@/components/ThemeProvider'

const { theme, toggle } = useTheme()
// theme: 'dark' | 'light'
// toggle: () => void
```

**Storage key**: `nepse_theme`  
**HTML attribute**: `data-theme="dark"` or `data-theme="light"` on `<html>`

---

## ThemeToggle

**File**: `src/components/ThemeToggle.tsx`  
**Type**: Client Component  
**Used in**: `SiteHeader`, admin sidebar

A small icon button that calls `toggle()` from `useTheme()`. Shows a sun icon in dark mode (click → switch to light), moon icon in light mode (click → switch to dark).

No props required. Can be placed anywhere inside `<ThemeProvider>`.

---

## DisclaimerGate

**File**: `src/components/DisclaimerGate.tsx`  
**Type**: Client Component  
**Used in**: `src/app/layout.tsx` (wraps site content inside ThemeProvider)

Shows a full-screen modal on first visit. Blocks interaction with the page until the user clicks "I Understand, Enter →".

- **Storage key**: `nepsewrite_disclaimer_v1`
- **Accepts**: returns `null` until localStorage is read (avoids hydration flash)
- **Content**: Nepali heading "लगानी जोखिम सूचना", SEBON mention, risk warning
- **Design**: semi-transparent blur overlay using `color-mix(in srgb, var(--bg) 60%, #000 40%)`

To reset the disclaimer (force it to reappear):
```javascript
// In browser console
localStorage.removeItem('nepsewrite_disclaimer_v1')
```

---

## SiteHeader

**File**: `src/components/layout/SiteHeader.tsx`  
**Type**: Client Component (needs `usePathname()` for active link)  
**Used in**: all public layout pages

Structure (top to bottom):
1. Nav bar: Logo (◆ NepseWrite) | Blog | Terms | ThemeToggle | Hamburger (mobile)
2. NepseTickerStrip (below nav)

Active nav link is highlighted using `usePathname()`. Mobile: hamburger opens a dropdown menu.

**Nav items**: Blog (`/blog`), Terms (`/terms`)  
**Removed**: "Learn" and "About" links were removed per user request.

---

## SiteFooter

**File**: `src/components/layout/SiteFooter.tsx`  
**Type**: Server Component  
**Used in**: all public layout pages

Contains:
- Brand column (logo, tagline)
- Quick links column
- Newsletter signup form (client action)
- Bottom bar: "Not financial advice · NEPSE, Nepal" disclaimer

Uses CSS custom properties (`var(--surface)`, `var(--text)`, etc.) for theme support.

---

## NepseTickerStrip

**File**: `src/components/layout/NepseTickerStrip.tsx`  
**Type**: Client Component  
**Used in**: `SiteHeader`

Live scrolling stock ticker showing NEPSE stocks. Fetches from `/api/nepse` every 5 minutes.

**Layout** (critical — overlap was a past bug):
```
[LIVE · 14:32 NPT | border] [scrolling ticker items .......................... →]
     static pill                      flex-1 overflow-hidden
```

The static time pill sits on the left with a `border-right` divider. The scrolling section is in a `flex-1 overflow-hidden` container so it never overlaps the pill. The ticker items are duplicated (original + copy) to create a seamless loop.

**States**:
- Loading: skeleton shimmer
- Error / empty: shows "Live data unavailable" fallback
- Loaded: scrolling items with symbol, price, and +/-% change (green/red)

**Scroll speed**: `ticker-normal` (25s per full loop) when 6+ stocks, `ticker-slow` (40s) when fewer.

**Data refresh**: `setInterval(fetch, 5 * 60 * 1000)` — also refreshes on window focus.

---

## TiptapEditor

**File**: `src/components/editor/TiptapEditor.tsx`  
**Type**: Client Component  
**Used in**: `PostEditor` (dynamic import with `ssr: false`)

Full-featured rich text editor built on Tiptap v2.

**Props**:
```typescript
interface Props {
  content: string        // HTML string (initial content)
  onChange: (html: string) => void  // called on every keystroke
}
```

**Extensions loaded**:
- `StarterKit` — paragraphs, headings, bold, italic, code, lists, blockquote, HR
- `Underline` — underline mark
- `TextAlign` — left / center / right alignment on blocks
- `Link` — hyperlinks (open in new tab by default)
- `Image` — inline images via URL
- `Youtube` — embeds YouTube videos as iframes
- `Placeholder` — grey hint text when editor is empty

**Important**: Always import this component with `dynamic(() => import(...), { ssr: false })`. Tiptap uses browser APIs and will crash during server-side rendering.

```typescript
const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), { ssr: false })
```

---

## Page-specific admin components

These live inside their respective `_components/` folders and are not shared:

| Component | Location | Purpose |
|---|---|---|
| `PostEditor` | `src/app/admin/posts/_components/` | Full article edit form + TiptapEditor |
| `PostsTable` | `src/app/admin/posts/_components/` | Filterable, searchable article list |
| `CategoriesManager` | `src/app/admin/categories/_components/` | Inline CRUD for categories |
| `NavLink` | `src/app/admin/_components/` | Sidebar nav with active state |
