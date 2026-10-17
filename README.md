# X Cleanup

A Chrome extension (Manifest V3) for reviewing and managing your X posts, reposts, and replies.

**Current status: Phase 1 (UI foundation).** Everything shown is local sample data. The extension does not connect to X, read your account, or perform any actions.

## Setup

Requires Node.js 18+.

```bash
npm install
npm run build        # type-checks, then builds the extension into dist/
```

Load it in Chrome:

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the `dist/` folder.
4. Pin **X Cleanup** from the extensions menu, click it, then click **Open dashboard**.

After rebuilding, click the reload icon on the extension's card in `chrome://extensions`.

### Other scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server for fast UI iteration. Open `/dashboard.html` or `/popup.html`. Extension APIs are unavailable, so preferences fall back to `localStorage`. |
| `npm run typecheck` | TypeScript check only |
| `npm run icons` | Regenerate `public/icons/*.png` (no image dependencies) |

## Project structure

```
popup.html, dashboard.html     Vite entry points (one per extension page)
public/manifest.json           MV3 manifest; only the "storage" permission
public/icons/                  Extension icons
src/
  popup/                       Toolbar popup
  dashboard/                   Full-page app shell and hash routes
  pages/                       Overview, Posts, Reposts, Replies, Settings
  components/
    layout/                    Sidebar, mobile nav, page header
    content/                   Shared list page: table, selection bar, skeleton
    ui/                        Buttons, inputs, filters, empty/error states
  hooks/                       Routing, data loading, selection, preferences
  services/                    Data source (mock), chrome.storage, tab helpers
  mock/                        Sample posts, reposts, replies
  types/                       Content, filter, and settings types
  utils/                       Filtering, formatting
```

Pages read content through the `ContentSource` interface in `src/services/contentSource.ts`. Phase 1 ships only the mock implementation. A live implementation can replace it later without changes to UI code.
