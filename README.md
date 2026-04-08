# Hexoden Portfolio

Static portfolio website for Hexoden.dev, focused on:
- Full stack/software project showcase
- Game development and visual work
- Homelab and digital sovereignty notes
- Accessibility-first reading mode support

## Project Type

This is a static multi-page site (HTML/CSS/JS) with no build step required.

## Pages

- `index.html`: Main portfolio hub (sections for artwork, about, skills, toolkit, notes, projects, contact)
- `christopher-ai-project.html`: Detailed project page for Christopher AI
- `commanddb-project.html`: Detailed project page for CommandDB
- `homelab-report.html`: Homelab architecture/report page
- `digital-sovereignty-report.html`: Notes/report page
- `accessibility.html`: User-facing accessibility settings page

## Core Scripts

- `accessibility.js`
	- Applies site-wide accessibility modes (theme, text mode, font scale, line-height)
	- Persists settings in localStorage
	- Dynamically adapts media/toolkit display for accessibility contexts
	- Routes local media links through the same-origin `media-viewer.html` page

- `sw.js`
	- Service worker for offline/performance caching
	- Uses targeted caches for runtime, static assets, and media
	- Pre-caches key pages and core media

- `media-viewer.html`
	- Lightweight local viewer for images, video, and audio
	- Used by accessibility mode to avoid direct navigation to `/Media/*`

- `code-snippets.js`
	- Provides rotating code-line snippets for the hero overlay effect

## Assets

- `Media/Pictures/`: Main visual assets (optimized `.webp` images)
- `Media/Projects/`: Project screenshots (optimized `.webp` images)
- `Media/Icons/`: Local icon pack (`.png`) for toolkit/homelab logo tiles
- `Media/Videos/`: Video content used in visual sections

## Performance and Local-First Notes

- External media/icon dependencies have been moved to local assets
- Key screenshots were converted from PNG to WebP for reduced payload
- Service worker caches are aligned with current local asset paths

## Accessibility Notes

- Dedicated settings page: `accessibility.html`
- Toggleable reading/plain-text mode
- Theme palettes: paper, sepia, contrast, dusk
- Adjustable font scaling and line-height
- Local media links in accessibility mode open through `media-viewer.html`

## Local Development

Because this is static HTML, you can run any local server from repo root.

Examples:

PowerShell with Python:

```powershell
python -m http.server 8080
```

Then open:

`http://localhost:8080/index.html`

## Deployment

Designed to be deployable on static hosting (for example GitHub Pages).

## Repository Notes

- `.venv/` and local machine artifacts are ignored via `.gitignore`

