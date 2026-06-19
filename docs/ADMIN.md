# Admin Panel

The admin panel lives at `/admin`. Only authenticated users can access it (any other visitor is redirected to `/login`).

---

## Navigation

The left sidebar has five sections:

| Section | URL | Purpose |
|---|---|---|
| Dashboard | `/admin` | Stats overview + recent articles |
| Articles | `/admin/posts` | Write, edit, delete, publish articles |
| Categories | `/admin/categories` | Create and manage post categories |
| Pages | `/admin/pages` | Block-based page builder |
| Settings | `/admin/settings` | Site configuration |

The theme toggle (sun/moon) sits in the sidebar header. Sign-out button is at the bottom.

---

## Dashboard

Shows four stat cards at the top:

- **Total Articles** — count of all posts (drafts + published)
- **Total Views** — sum of `viewCount` across all posts
- **Subscribers** — count of newsletter_subscribers rows
- **Categories** — count of categories rows

Below the cards: a **Recent Articles** table showing the 10 latest posts with title, category (colour-coded badge), view count, status (Published / Draft), publish date, and an Edit link.

---

## Articles

### Article List (`/admin/posts`)

- Filter tabs: **All / Published / Draft**
- Search box filters by title
- Each row shows: title + excerpt, category badge, view count, status, date
- Hover a row to reveal action buttons: **Edit**, **Toggle Publish**, **Delete**

### Writing an Article (`/admin/posts/new` or `/admin/posts/[id]/edit`)

The editor (`PostEditor`) has:

1. **Title** — large transparent input at the top
2. **Excerpt** — one-line summary shown in listings and SEO
3. **Category** — dropdown populated from the categories table
4. **Rich text editor** — full Tiptap editor (see below)
5. **Action buttons** (top-right):
   - **Save** — saves without publishing
   - **Publish / Unpublish** — toggles live status
   - **Delete** — permanent, with confirmation
   - **View live** — opens the published post in a new tab (only when published)

#### Tiptap Editor Toolbar

| Button | What it does |
|---|---|
| ↩ / ↪ | Undo / Redo |
| H1 / H2 / H3 | Heading levels |
| **B** / *I* / U / ~~S~~ | Bold / Italic / Underline / Strikethrough |
| `<>` | Inline code |
| ≡ left / center / right | Text alignment |
| • / 1. | Bullet / Ordered list |
| " | Blockquote |
| — | Horizontal rule |
| 🔗 | Insert/edit a hyperlink |
| 🖼 | Insert image by URL |
| ▶ YouTube | Paste YouTube URL → embedded video |

#### Embedding YouTube Videos

1. Click the **YouTube** button in the toolbar
2. Paste the full YouTube URL (e.g. `https://www.youtube.com/watch?v=xxx`)
3. Click **Embed**
4. The video appears inline in the article — it will be rendered as a responsive iframe on the public blog post page

#### Slug

The URL slug is auto-generated from the title when you first create an article. It can be edited in the editor. Once published, changing the slug will break existing links.

---

## Categories

(`/admin/categories`)

Categories give articles a label and a colour badge.

### Creating a category

Click **+** (top-right). A new row appears in edit mode. Fill in:
- **Name** — display name (e.g. `IPO/FPO`)
- **Slug** — auto-generated, URL-safe (e.g. `ipo-fpo`)
- **Color** — pick from 8 presets or enter a custom hex value
- **Description** — optional

Click **Save** to confirm.

### Editing a category

Click the **Edit** (pencil) icon on any row. All fields become editable inline.

### Deleting a category

Click **Delete** on the row. This removes the category row but does **not** update posts that reference it — those posts will still show the old category name as plain text.

### Default categories shipped

| Name | Purpose |
|---|---|
| Stocks | General stock analysis |
| IPO/FPO | New listings, applications |
| Mutual Funds | Fund reviews and updates |
| Bonus Share | Dividend / bonus share news |
| Economy | Nepal macroeconomics |
| Tutorial | How-to guides for new investors |
| General | Anything else |

---

## Pages

(`/admin/pages`)

The page builder lets you create custom pages with drag-and-drop content blocks. These pages are separate from the hardcoded public pages (`/`, `/blog`, `/terms`).

### Page list

Each row shows: status badge, title + URL slug, block count, last updated, Edit button.

Hover actions: **View live**, **Publish/Unpublish**, **Delete**.

### Block types

| Block | Description |
|---|---|
| Hero | Full-width banner with heading, subheading, and CTA button |
| Rich Text | Formatted text content (headings, lists, etc.) |
| Image | Full-width or contained image with optional caption |
| CTA | Call-to-action section with button |
| Divider | Horizontal rule for visual separation |

### Page editor

1. Go to `/admin/pages` → click **Edit**
2. Drag blocks from the right panel onto the canvas
3. Click a block to edit its content
4. Drag blocks on the canvas to reorder
5. Click **Save** (auto-saves) or **Publish** to make it live

A published page is accessible at `yourdomain.com/[slug]` on the public site.

---

## Settings

(`/admin/settings`)

Configuration options for the site. Currently includes:
- Site name
- Site description / tagline
- Contact email
- Social media links (Twitter/X, Facebook, etc.)

Changes are saved to the database and reflected site-wide.

---

## Sign Out

Click **Sign out** at the bottom of the sidebar. This clears the session cookie and redirects to `/login`.
