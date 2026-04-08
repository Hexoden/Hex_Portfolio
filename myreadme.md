# Hexoden Portfolio - Internal Technical Walkthrough

This note tracks how the site is structured and which parts matter for performance.

## Architecture

The project is a static portfolio built with HTML, CSS, and JavaScript.
- `index.html` is the landing page.
- `styles.css` holds the shared visual system.
- `main.js` contains homepage behavior.
- `accessibility.js` handles reading-mode and accessibility settings.
- `sw.js` adds caching for repeat visits.

## Homepage

The homepage is organized into stable sections so deep links and navigation stay predictable.
- `#artwork`: visual work and gameplay media
- `#about`: summary and profile content
- `#skills` / `#toolkit`: capabilities and local icons
- `#labs`: future work areas
- `#notes` and `#projects`: supporting pages and featured projects
- `#contact`: outbound links

### Visual treatment

The top of the page uses a fixed grid texture and a floating code overlay.
- Reveal sections use `IntersectionObserver` instead of scroll polling.
- The hero overlay now runs at a lower cadence so it stays lighter on CPU.
- Images open in a modal when marked with `.js-enlarge`.

### Video behavior

The hero video keeps a poster image and loads the MP4 on demand instead of requesting it immediately.
That is the biggest repo-level win for first-load speed.

## Accessibility

The accessibility system is script-driven and stored in localStorage.
- It toggles reading/plain-text mode.
- It applies theme, font scale, and line-height settings.
- It generates accessible media links when visual media should be reduced.

## Asset strategy

The repo keeps assets local and optimized where possible.
- Images are served as WebP where practical.
- Toolkit and homelab icons are local files.
- The current setup favors simple static hosting over remote dependencies.

## Performance checklist

- External CSS and JS are used for better caching.
- Non-critical scripts are deferred.
- Below-the-fold images use lazy loading and async decoding.
- The code overlay is capped and throttled.
- The hero video is not fetched until the user interacts with it.

## Local run

Run a simple static server from the repo root:

```powershell
c:/Users/Hayde/Documents/Hexoden-Portfolio/.venv/Scripts/python.exe -m http.server 8080
```

Open `http://localhost:8080/index.html`.
