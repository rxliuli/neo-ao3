# NeoAO3

A browser extension that replaces AO3 (Archive of Our Own) with a modern React-based interface, inspired by OldTwitter for Twitter/X.

## Goal

AO3's server-rendered UI is functional but dated. NeoAO3 intercepts AO3 pages at `document_start`, hides the original HTML, and mounts a modern React app that parses the same HTML for data. The result is a faster, cleaner reading experience with SPA navigation.

## Tech Stack

- **WXT** — browser extension framework (built on Vite)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** — styling and UI components
- **@tanstack/react-virtual** — virtualized lists (fandom pages)
- **Vitest** + **Playwright** browser mode — testing
- **Multi-browser**: Chrome, Firefox, Safari

## Architecture

### How it works

1. Content script runs at `document_start` on `archiveofourown.org`
2. Calls `window.stop()` to prevent original page resources from loading
3. Replaces `<html>` with a minimal shell and injects styles
4. `fetch()`es the same URL to get the original HTML
5. Parses the HTML with `DOMParser` to extract structured data
6. Mounts React app with the parsed data

### SPA Navigation

Once the React app is mounted, all internal navigation is handled as a SPA:

- **Global click interceptor** on `document` captures `<a>` clicks to known routes
- `fetch()` + `DOMParser` in the background, then `history.pushState()`
- **popstate** listener handles browser back/forward
- Navigation ID ref prevents race conditions (stale responses discarded)
- Unmatched routes (e.g. author pages) fall through to normal browser navigation
- Modifier keys (Ctrl/Cmd+click) still open in new tab

### Cloudflare 403 Handling

When AO3 returns a Cloudflare challenge (403), the extension renders the challenge HTML via `document.write()` so the Turnstile scripts execute and the user can complete verification.

### "Show Original" Escape Hatch

Appends `?neo-ao3-original` to the URL, which `matchRoute()` returns `null` for, so the content script skips interception and AO3's original page loads normally.

## Pages

| Page | URL Pattern | Description |
|------|-------------|-------------|
| Home | `/` | Search box + fandom category grid |
| Work List | `/tags/*/works`, `/works/search` | Work cards with sort, filters, pagination |
| Work Detail | `/works/{id}`, `/works/{id}/chapters/*` | Full work with metadata, tags, chapters |
| Fandom List | `/media/*/fandoms` | Virtualized list with filter + dropdown sort |

## Project Structure

```
entrypoints/
  content/
    index.tsx              # Entry: intercept page, fetch HTML, mount React
    App.tsx                # Root component: route/doc state, SPA nav, loading
    router.ts              # matchRoute() — URL -> Route mapping
    navigation.tsx         # NavigationContext + useNavigate() hook
    components/
      AppHeader.tsx        # Sticky header: logo, search, theme toggle, show original
    pages/
      HomePage.tsx         # Landing page with search + fandom categories
      WorkListPage.tsx     # Work listings with sort/filter/pagination
      WorkDetailPage.tsx   # Full work view with chapters
      FandomListPage.tsx   # Virtualized fandom list
  background.ts            # Background script (minimal)
lib/
  ao3/
    types.ts               # Data types (WorkBlurb, WorkDetail, Chapter, etc.)
    parseWorkList.ts       # Parse work listing HTML
    parseWorkDetail.ts     # Parse work detail HTML
    parseFandomList.ts     # Parse fandom listing HTML
    parseFilterParams.ts   # Parse/build filter URL params
    __fixtures__/          # HTML test fixtures
components/ui/             # shadcn/ui components (button, badge, input, etc.)
integrations/theme/        # Dark/light theme provider + toggle
```

## Development

```bash
pnpm install
pnpm dev          # Start dev server with HMR
pnpm build        # Build for production
pnpm test         # Run tests (49 parser tests)
```

After running `pnpm dev`, load the extension from `.output/chrome-mv3-dev` in `chrome://extensions` (Developer mode).

### Build & Package

```bash
pnpm zip              # Chrome/Edge zip
pnpm zip:firefox      # Firefox zip
pnpm build:safari     # Safari (requires macOS + Xcode)
```

## AO3 HTML Parsing Notes

AO3 has no public JSON API. All data is extracted by parsing server-rendered HTML:

- **Work list**: `ol.work.index.group > li.work.blurb` (id=`work_{id}`)
- **Required tags**: `.required-tags li span` (rating/warning/category/completion via class+title)
- **Tags**: `ul.tags.commas li.{type} a.tag` (type: warnings/relationships/characters/freeforms)
- **Stats**: `dl.stats dd.{stat}` — comments/kudos/bookmarks only present when > 0
- **Work detail metadata**: `dl.work.meta.group` with nested `dd.{type} a.tag`
- **Chapters**: `#chapters > .chapter` (multi) or `#chapters > .userstuff` (single)
- **Series**: `dd.series span.position` — last `<a>` is series name, first is part link
