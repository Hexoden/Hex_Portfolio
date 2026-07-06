# Hexoden Portfolio

Static portfolio site for Hexoden.dev.

## What’s in the repo

- `index.html`: Main portfolio landing page
- `christopher-ai-project.html`: Christopher AI project page
- `commanddb-project.html`: CommandDB project page
- `styles.css`: Shared site styling
- `main.js`: Homepage interactions and overlay animation
- `accessibility.js`: Accessibility controls and reading-mode behavior
- `code-snippets.js`: Text snippets for the code overlay
- `sw.js`: Service worker for caching

## Media

- `Media/Pictures/`: Optimized screenshots and artwork in WebP
- `Media/Projects/`: Project screenshots in WebP
- `Media/Icons/`: Local icon tiles for the toolkit and homelab sections
- `Media/Videos/`: Video assets used in the visual work section

## Performance notes

- Homepage styling and behavior are split into external files for better caching.
- Non-critical scripts are deferred.
- Below-the-fold images use lazy loading and async decoding.
- The hero video is loaded on demand instead of prefetching the MP4 immediately.
- The code overlay runs at a lower cadence to reduce CPU work on long pages.

## Run locally

Use any static server from the repo root. For example:

```powershell
c:/PATH .venv/Scripts/python.exe -m http.server 8080
```

Open `http://localhost:8080/index.html`.

## Deployment

The site is ready for static hosting such as GitHub Pages.

