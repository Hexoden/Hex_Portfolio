# Hexoden Portfolio - Internal Technical Walkthrough

This is a high-level technical explanation of how the site is structured and what each major area is doing.

## 1) Overall Architecture

The project is a static multi-page portfolio with progressive enhancement:
- HTML provides content and section structure.
- CSS handles branding, layout, and visual presentation.
- JavaScript adds behavior (reveal animations, media modal, toast messaging, accessibility controls).
- A service worker (`sw.js`) adds caching and resilience.

The homepage (`index.html`) is the primary entry point, with dedicated detail pages for major projects and reports.

## 2) Main Page (`index.html`) Structure

The page is intentionally sectioned with clear IDs so nav links and deep links stay stable:
- `#artwork`: game visuals/media stack
- `#about`: personal/professional context
- `#profile`: broader interests and strengths
- `#medtech`: healthcare-tech direction
- `#journey`: visual progress monitor
- `#skills`: capability categories
- `#toolkit`: concrete technologies and platform logos
- `#labs`: coming-soon focus tracks
- `#notes`: report/article cards
- `#projects`: featured project cards linking to dedicated pages
- `#contact`: outbound contact links

A fixed nav links to these sections and to `accessibility.html`.

### Hero and overlays
The top of the page includes:
- `grid-overlay` for ambient visual texture.
- `code-overlay` for animated floating code lines.
- A hero card with profile image, CTA links, and metrics.

### Reveal behavior
Sections carry class `reveal`. A JavaScript `IntersectionObserver` watches them and adds `visible` once they cross threshold (~20%).

## 3) Homepage JavaScript Behavior (inline in `index.html`)

### 3.1 Intersection observer
A single observer instance adds `visible` to `.reveal` nodes. This keeps animations declarative and avoids scroll-heavy handlers.

### 3.2 Code overlay engine
The code overlay effect is a controlled mini runtime:
- Pulls snippets from `window.CODE_SNIPPETS` (from `code-snippets.js`) or uses fallback snippets.
- Spawns animated lines on random cadence.
- Computes non-overlapping slots so lines do not stack on top of each other.
- Types out text character-by-character, pauses, then fades out.
- Caps simultaneous lines (`maxCodeLines`) based on viewport size.
- Includes burst scheduling for occasional clusters.
- Dials overlay opacity based on scroll progress for readability.

The animation is disabled automatically when `prefers-reduced-motion: reduce` is active.

### 3.3 Image modal and enlargements
Any image with `.js-enlarge` opens in modal:
- Uses `data-fullsrc` when present.
- Updates modal `aria-hidden` state.
- Supports close via button, backdrop click, and Escape key.

### 3.4 Coming-soon interactions
Elements marked `.coming-soon-trigger`:
- Show a temporary status toast (`#soon-toast`).
- Include keyboard support for Enter and Space.

### 3.5 Service worker registration
On `load`, if supported, `./sw.js` is registered silently.

## 4) Accessibility System (`accessibility.js` + `accessibility.html`)

This is one of the most important systems in the codebase.

### 4.1 Persistence and defaults
Settings are stored in localStorage under:
- `hexoden-accessibility-settings`

Defaults:
- `enabled: false`
- `plainText: true`
- `theme: "paper"`
- `fontScale: 1`
- `lineHeight: 1.75`

Values are clamped (guardrails) to avoid invalid UI state.

### 4.2 Theming model
Theme palettes (`paper`, `contrast`, `sepia`, `dusk`) map to CSS custom properties (`--bg`, `--text`, etc.).

When enabled:
- Root dataset flags are set (`data-accessibility-mode`, `data-accessibility-theme`, etc.).
- Theme variables are applied to the document root.
- Classes toggle (`accessibility-mode`, `accessibility-plain-text`).

When disabled:
- Injected overrides are removed and normal visual theme returns.

### 4.3 Runtime stylesheet injection
`ensureStyleTag()` creates a large style block (`#hexoden-accessibility-style`) that:
- Removes visual noise (shadows/animations/background textures).
- Simplifies layout into linear reading order.
- Hides decorative/interactive visual components where appropriate.
- Forces consistent typographic behavior and spacing.
- Improves readability and screen-reader/tts compatibility.

### 4.4 Media link fallback behavior
In enabled + non-plain-text site mode:
- Visual media can be hidden from layout.
- Script creates a generated "Media Links" section with links to the same-origin `media-viewer.html` page for local assets.
- That viewer fetches the underlying asset and renders it as an image, video, or audio element.
- This preserves content access while avoiding direct navigation to `/Media/*` assets.

### 4.5 Toolkit textual fallback
`syncToolkitList()` extracts toolkit names from tile labels and generates a plain list.
This avoids icon-only dependence in accessibility modes.

### 4.6 Control wiring
`accessibility.html` provides the controls UI:
- Enable mode
- Reading/text mode
- Theme selector
- Font scale slider
- Line-height slider
- Reset button

All controls call `updateSettings()`, which saves + reapplies + resyncs derived accessibility DOM.

## 5) Caching and Offline Strategy (`sw.js`)

The service worker uses four cache namespaces:
- `hexoden-cache-v12` (precache)
- `hexoden-runtime-v12` (runtime navigation/doc fetches)
- `hexoden-assets-v12` (scripts/styles/fonts)
- `hexoden-media-v12` (images/videos)

### 5.1 Install
On install:
- Opens the precache.
- Adds a curated list (`PRECACHE_URLS`) including key pages, scripts, and representative media.
- Calls `skipWaiting()` to activate promptly.

### 5.2 Activate
On activate:
- Deletes old cache keys not matching current versions.
- Enables navigation preload where supported.
- Calls `clients.claim()`.

### 5.3 Fetch routing
- Non-GET or non-http requests are ignored.
- Navigation requests use network-first with preload support and offline fallback to cached `index.html`.
- Media/static assets use stale-while-revalidate.
- General requests try cache first, then network, then cached fallback.

This gives:
- Fast repeat loads.
- Better resiliency when offline/spotty.
- Controlled freshness over time.

## 6) Media and Asset Pipeline

Recent migration priorities were local-first and payload reduction.

### 6.1 Image optimization
Major visual PNGs were replaced by `.webp` equivalents and references updated.
This reduced transfer size while preserving quality for gallery/project media.

### 6.2 Local iconization strategy
Toolkit and homelab logo tiles now use local PNG icon assets in `Media/Icons/`.

Toolkit icon set includes local files such as:
- `toolkit-html.png`, `toolkit-css.png`, `toolkit-js.png`, `toolkit-ts.png`, `toolkit-react.png`
- plus infrastructure/dev icons (Docker, Linux, Proxmox, GitHub, etc.)

Homelab icon set includes local files such as:
- `homelab-proxmox.png`, `homelab-docker.png`, `homelab-raspberrypi.png`, `homelab-samba.png`, etc.

### 6.3 Why this matters
- No runtime dependency on remote icon CDNs.
- More deterministic rendering.
- Better cache behavior through service worker.
- Better privacy and fewer third-party calls.

### 6.4 Accessibility media handling
- Accessibility mode no longer depends on direct browser navigation to binary media files.
- Local `/Media/` links open the same-origin `media-viewer.html` wrapper instead.
- This avoids the service-worker/navigation edge cases that were breaking non-reader mode links.

## 7) Project/Report Pages

### 7.1 `christopher-ai-project.html`
Project-focused narrative page with screenshots now served from local `.webp` media.

### 7.2 `commanddb-project.html`
Companion project page with local `.webp` screenshots for launcher/dashboard/harvester flows.

### 7.3 `homelab-report.html`
Infrastructure report with deployment map, architecture table, and service chips using local homelab icon assets.
- Notable wording update: SMB service is explicitly labeled "SMB File Sharing".

### 7.4 `digital-sovereignty-report.html`
Narrative report linked from homepage Notes section.

## 8) Content and UX Patterns

### 8.1 Card-based composition
Most sections use a card/panel model, which keeps visual rhythm consistent and easier to degrade for accessibility mode.

### 8.2 Progressive enhancement
Core content remains in semantic HTML. JS enhances interaction but does not own core information architecture.

### 8.3 ARIA and keyboard support
- Modal and toast include relevant ARIA state usage.
- Coming-soon cards support keyboard activation.
- Image interaction and close behavior include keyboard escape route.

## 9) Deployment and Ops Notes

- Static-site friendly; no runtime backend is required to serve the portfolio.
- Works on local static server and static hosts (e.g., GitHub Pages).
- Service worker requires HTTPS or localhost context in browsers.

## 10) Practical Maintenance Checklist

When updating the site:
1. Keep media local and optimized (`.webp` where suitable).
2. Update service worker precache list if core assets/pages change materially.
3. Preserve alt text and keyboard interaction on new interactive components.
4. Keep icon assets local under `Media/Icons/` (avoid remote runtime dependencies).
5. Re-check accessibility mode rendering after layout changes.

## 11) Notes on Private/Internal File

This file is intentionally local-only and listed in `.gitignore` as `myreadme.md`.
It is meant for deep technical context, architecture memory, and future refactor planning.
