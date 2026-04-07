(function () {
    const STORAGE_KEY = "hexoden-accessibility-settings";
    const STYLE_ID = "hexoden-accessibility-style";

    const defaultSettings = {
        enabled: false,
        plainText: true,
        theme: "paper",
        fontScale: 1,
        lineHeight: 1.75,
    };

    const themes = {
        paper: {
            bg: "#ffffff",
            bgSoft: "#f5f5f5",
            surface: "#ffffff",
            surfaceTwo: "#fafafa",
            line: "#c9c9c9",
            text: "#111111",
            muted: "#333333",
            cyan: "#0b5cab",
            amber: "#8a5a00",
            amberBurn: "#7a1e00",
            magenta: "#7a004f",
            violet: "#5b2ca0",
            teal: "#0f766e",
            electricGreen: "#0f5f3b",
            mutedTeal: "rgba(0, 0, 0, 0.05)",
            shadow: "none",
        },
        contrast: {
            bg: "#000000",
            bgSoft: "#0a0a0a",
            surface: "#111111",
            surfaceTwo: "#151515",
            line: "#f0f0f0",
            text: "#ffffff",
            muted: "#f0f0f0",
            cyan: "#00e5ff",
            amber: "#ffd166",
            amberBurn: "#ff7b72",
            magenta: "#ff7bd5",
            violet: "#b388ff",
            teal: "#7fffd4",
            electricGreen: "#8bffb0",
            mutedTeal: "rgba(255, 255, 255, 0.08)",
            shadow: "none",
        },
        sepia: {
            bg: "#fbf4e8",
            bgSoft: "#f3ead8",
            surface: "#fffaf0",
            surfaceTwo: "#f7efe1",
            line: "#cbb89b",
            text: "#1b1308",
            muted: "#463623",
            cyan: "#005b96",
            amber: "#8a5a00",
            amberBurn: "#8f3a1f",
            magenta: "#8a004f",
            violet: "#5f3ea8",
            teal: "#0f766e",
            electricGreen: "#2f6b3f",
            mutedTeal: "rgba(0, 0, 0, 0.05)",
            shadow: "none",
        },
        dusk: {
            bg: "#101418",
            bgSoft: "#151b22",
            surface: "#181f29",
            surfaceTwo: "#1d2430",
            line: "#4e5d73",
            text: "#f6f7fb",
            muted: "#c7cfdd",
            cyan: "#8ad8ff",
            amber: "#ffca80",
            amberBurn: "#ff8f6b",
            magenta: "#ff9de2",
            violet: "#bca7ff",
            teal: "#8ff3dd",
            electricGreen: "#9ef7a2",
            mutedTeal: "rgba(255, 255, 255, 0.07)",
            shadow: "none",
        },
    };

    const controlIds = {
        enabled: "accessibility-enabled",
        plainText: "accessibility-plain-text",
        theme: "accessibility-theme",
        fontScale: "accessibility-font-size",
        lineHeight: "accessibility-line-height",
        fontScaleValue: "accessibility-font-size-value",
        lineHeightValue: "accessibility-line-height-value",
        reset: "accessibility-reset",
    };

    function readSettings() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return { ...defaultSettings };
            }

            const parsed = JSON.parse(raw);
            return {
                ...defaultSettings,
                ...parsed,
                enabled: Boolean(parsed.enabled),
                plainText: parsed.plainText !== false,
                theme: themes[parsed.theme] ? parsed.theme : defaultSettings.theme,
                fontScale: clampNumber(parsed.fontScale, 0.9, 1.7, defaultSettings.fontScale),
                lineHeight: clampNumber(parsed.lineHeight, 1.35, 2.1, defaultSettings.lineHeight),
            };
        } catch {
            return { ...defaultSettings };
        }
    }

    function saveSettings(settings) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    function clampNumber(value, min, max, fallback) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return fallback;
        }

        return Math.min(max, Math.max(min, numeric));
    }

    function getThemePalette(themeName) {
        return themes[themeName] || themes[defaultSettings.theme];
    }

    function applyPalette(settings) {
        const palette = getThemePalette(settings.theme);
        const root = document.documentElement;
        const active = settings.enabled;
        const pageType = document.body?.dataset.accessibilityPage || (location.pathname.endsWith("accessibility.html") ? "settings" : "site");

        root.classList.toggle("accessibility-mode", active);
        root.classList.toggle("accessibility-plain-text", active && settings.plainText);
        root.dataset.accessibilityMode = active ? "true" : "false";
        root.dataset.accessibilityPlainText = active && settings.plainText ? "true" : "false";
        root.dataset.accessibilityPage = pageType;
        root.dataset.accessibilityTheme = settings.theme;
        root.style.setProperty("--accessibility-font-scale", String(settings.fontScale));
        root.style.setProperty("--accessibility-line-height", String(settings.lineHeight));

        if (active) {
            root.style.setProperty("--bg", palette.bg);
            root.style.setProperty("--bg-soft", palette.bgSoft);
            root.style.setProperty("--surface", palette.surface);
            root.style.setProperty("--surface-2", palette.surfaceTwo);
            root.style.setProperty("--line", palette.line);
            root.style.setProperty("--text", palette.text);
            root.style.setProperty("--muted", palette.muted);
            root.style.setProperty("--cyan", palette.cyan);
            root.style.setProperty("--amber", palette.amber);
            root.style.setProperty("--amber-burn", palette.amberBurn);
            root.style.setProperty("--magenta", palette.magenta);
            root.style.setProperty("--violet", palette.violet);
            root.style.setProperty("--teal", palette.teal);
            root.style.setProperty("--electric-green", palette.electricGreen);
            root.style.setProperty("--muted-teal", palette.mutedTeal);
            root.style.setProperty("--shadow", palette.shadow);
        } else {
            [
                "--bg",
                "--bg-soft",
                "--surface",
                "--surface-2",
                "--line",
                "--text",
                "--muted",
                "--cyan",
                "--amber",
                "--amber-burn",
                "--magenta",
                "--violet",
                "--teal",
                "--electric-green",
                "--muted-teal",
                "--shadow",
            ].forEach((property) => root.style.removeProperty(property));
        }

        if (document.body) {
            document.body.classList.toggle("accessibility-mode", active);
        }
    }

    function ensureStyleTag() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
html.accessibility-mode {
    scroll-behavior: auto;
    font-size: calc(100% * var(--accessibility-font-scale, 1));
    color-scheme: light;
    background: var(--bg) !important;
}

html.accessibility-mode body {
    background: var(--bg) !important;
    color: var(--text) !important;
    line-height: var(--accessibility-line-height, 1.75) !important;
    font-family: Arial, Helvetica, sans-serif !important;
}

html.accessibility-mode body * {
    background-image: none !important;
    background-attachment: scroll !important;
    border-radius: 0 !important;
    filter: none !important;
    backdrop-filter: none !important;
    text-shadow: none !important;
    box-shadow: none !important;
}

html.accessibility-mode body,
html.accessibility-mode body * {
    scroll-behavior: auto !important;
}

html.accessibility-mode body * {
    transition: none !important;
    animation: none !important;
}

html.accessibility-mode[data-accessibility-page="site"] nav {
    display: none !important;
}

html.accessibility-mode[data-accessibility-page="site"] {
    background: var(--bg) !important;
}

html.accessibility-mode[data-accessibility-page="site"] body {
    background: var(--bg) !important;
    color: var(--text) !important;
}

html.accessibility-mode[data-accessibility-page="site"] main,
html.accessibility-mode[data-accessibility-page="site"] header,
html.accessibility-mode[data-accessibility-page="site"] section,
html.accessibility-mode[data-accessibility-page="site"] article,
html.accessibility-mode[data-accessibility-page="site"] aside,
html.accessibility-mode[data-accessibility-page="site"] div,
html.accessibility-mode[data-accessibility-page="site"] p,
html.accessibility-mode[data-accessibility-page="site"] ul,
html.accessibility-mode[data-accessibility-page="site"] ol,
html.accessibility-mode[data-accessibility-page="site"] li,
html.accessibility-mode[data-accessibility-page="site"] h1,
html.accessibility-mode[data-accessibility-page="site"] h2,
html.accessibility-mode[data-accessibility-page="site"] h3,
html.accessibility-mode[data-accessibility-page="site"] h4,
html.accessibility-mode[data-accessibility-page="site"] h5,
html.accessibility-mode[data-accessibility-page="site"] h6 {
    display: block !important;
    width: auto !important;
    max-width: none !important;
}

html.accessibility-mode[data-accessibility-page="site"] .wrap,
html.accessibility-mode[data-accessibility-page="site"] .nav-inner,
html.accessibility-mode[data-accessibility-page="site"] .hero,
html.accessibility-mode[data-accessibility-page="site"] .panel,
html.accessibility-mode[data-accessibility-page="site"] .story-card,
html.accessibility-mode[data-accessibility-page="site"] .subpanel,
html.accessibility-mode[data-accessibility-page="site"] .deploy-node,
html.accessibility-mode[data-accessibility-page="site"] .metric,
html.accessibility-mode[data-accessibility-page="site"] .card,
html.accessibility-mode[data-accessibility-page="site"] .note,
html.accessibility-mode[data-accessibility-page="site"] .project-card,
html.accessibility-mode[data-accessibility-page="site"] .route-card,
html.accessibility-mode[data-accessibility-page="site"] .detail-card,
html.accessibility-mode[data-accessibility-page="site"] .timeline-item,
html.accessibility-mode[data-accessibility-page="site"] .tool,
html.accessibility-mode[data-accessibility-page="site"] .tool-card,
html.accessibility-mode[data-accessibility-page="site"] .visual-card,
html.accessibility-mode[data-accessibility-page="site"] .skill-card,
html.accessibility-mode[data-accessibility-page="site"] .journey-node,
html.accessibility-mode[data-accessibility-page="site"] .journey-frame,
html.accessibility-mode[data-accessibility-page="site"] .feature-card,
html.accessibility-mode[data-accessibility-page="site"] .report-card,
html.accessibility-mode[data-accessibility-page="site"] .pill,
html.accessibility-mode[data-accessibility-page="site"] .chip,
html.accessibility-mode[data-accessibility-page="site"] .journey-grid,
html.accessibility-mode[data-accessibility-page="site"] .medtech-grid,
html.accessibility-mode[data-accessibility-page="site"] .labs-grid,
html.accessibility-mode[data-accessibility-page="site"] .notes-grid,
html.accessibility-mode[data-accessibility-page="site"] .grid,
html.accessibility-mode[data-accessibility-page="site"] .grid-two,
html.accessibility-mode[data-accessibility-page="site"] .detail-grid,
html.accessibility-mode[data-accessibility-page="site"] .hero-layout {
    display: block !important;
}

html.accessibility-mode[data-accessibility-page="site"] .hero,
html.accessibility-mode[data-accessibility-page="site"] .panel,
html.accessibility-mode[data-accessibility-page="site"] .story-card,
html.accessibility-mode[data-accessibility-page="site"] .subpanel,
html.accessibility-mode[data-accessibility-page="site"] .deploy-node,
html.accessibility-mode[data-accessibility-page="site"] .metric,
html.accessibility-mode[data-accessibility-page="site"] .card,
html.accessibility-mode[data-accessibility-page="site"] .note,
html.accessibility-mode[data-accessibility-page="site"] .project-card,
html.accessibility-mode[data-accessibility-page="site"] .route-card,
html.accessibility-mode[data-accessibility-page="site"] .detail-card,
html.accessibility-mode[data-accessibility-page="site"] .timeline-item,
html.accessibility-mode[data-accessibility-page="site"] .tool,
html.accessibility-mode[data-accessibility-page="site"] .tool-card,
html.accessibility-mode[data-accessibility-page="site"] .visual-card,
html.accessibility-mode[data-accessibility-page="site"] .skill-card,
html.accessibility-mode[data-accessibility-page="site"] .journey-node,
html.accessibility-mode[data-accessibility-page="site"] .journey-frame,
html.accessibility-mode[data-accessibility-page="site"] .feature-card,
html.accessibility-mode[data-accessibility-page="site"] .report-card,
html.accessibility-mode[data-accessibility-page="site"] .pill,
html.accessibility-mode[data-accessibility-page="site"] .chip {
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
}

html.accessibility-mode[data-accessibility-page="site"] *,
html.accessibility-mode[data-accessibility-page="site"] *::before,
html.accessibility-mode[data-accessibility-page="site"] *::after {
    color: var(--text) !important;
    background: transparent !important;
    background-color: transparent !important;
    border-color: transparent !important;
    opacity: 1 !important;
}

html.accessibility-mode[data-accessibility-page="site"] a,
html.accessibility-mode[data-accessibility-page="site"] a:visited,
html.accessibility-mode[data-accessibility-page="site"] a:hover,
html.accessibility-mode[data-accessibility-page="site"] a:focus-visible {
    color: var(--text) !important;
    text-decoration: underline !important;
}

html.accessibility-mode[data-accessibility-page="site"] p,
html.accessibility-mode[data-accessibility-page="site"] li,
html.accessibility-mode[data-accessibility-page="site"] a,
html.accessibility-mode[data-accessibility-page="site"] span,
html.accessibility-mode[data-accessibility-page="site"] small,
html.accessibility-mode[data-accessibility-page="site"] strong,
html.accessibility-mode[data-accessibility-page="site"] em,
html.accessibility-mode[data-accessibility-page="site"] td,
html.accessibility-mode[data-accessibility-page="site"] th,
html.accessibility-mode[data-accessibility-page="site"] figcaption {
    font-size: 1.08em !important;
}

html.accessibility-mode nav,
html.accessibility-mode header,
html.accessibility-mode section,
html.accessibility-mode main,
html.accessibility-mode .wrap,
html.accessibility-mode .nav-inner,
html.accessibility-mode .hero,
html.accessibility-mode .panel,
html.accessibility-mode .story-card,
html.accessibility-mode .subpanel,
html.accessibility-mode .deploy-node,
html.accessibility-mode .metric,
html.accessibility-mode .card,
html.accessibility-mode .note,
html.accessibility-mode .project-card,
html.accessibility-mode .route-card,
html.accessibility-mode .detail-card,
html.accessibility-mode .timeline-item,
html.accessibility-mode .tool,
html.accessibility-mode .tool-card,
html.accessibility-mode .visual-card,
html.accessibility-mode .skill-card,
html.accessibility-mode .journey-node,
html.accessibility-mode .journey-frame,
html.accessibility-mode .feature-card,
html.accessibility-mode .report-card,
html.accessibility-mode .pill,
html.accessibility-mode .chip {
    background: transparent !important;
    border-color: var(--line) !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
}

html.accessibility-mode .hero::before,
html.accessibility-mode .hero::after,
html.accessibility-mode .grid-overlay,
html.accessibility-mode .code-overlay,
html.accessibility-mode .soon-toast,
html.accessibility-mode .image-modal,
html.accessibility-mode .image-modal *,
html.accessibility-mode .code-line {
    display: none !important;
}

html.accessibility-mode.accessibility-plain-text img,
html.accessibility-mode.accessibility-plain-text video,
html.accessibility-mode.accessibility-plain-text canvas,
html.accessibility-mode.accessibility-plain-text svg,
html.accessibility-mode.accessibility-plain-text iframe,
html.accessibility-mode.accessibility-plain-text picture,
html.accessibility-mode.accessibility-plain-text source {
    display: none !important;
}

html.accessibility-mode.accessibility-plain-text .hero-profile,
html.accessibility-mode.accessibility-plain-text .media-stack,
html.accessibility-mode.accessibility-plain-text .visual-media,
html.accessibility-mode.accessibility-plain-text .artwork-grid,
html.accessibility-mode.accessibility-plain-text .screens,
html.accessibility-mode.accessibility-plain-text .toolkit-grid,
html.accessibility-mode.accessibility-plain-text .project-gallery,
html.accessibility-mode.accessibility-plain-text .journey-monitor,
html.accessibility-mode.accessibility-plain-text .journey-histogram,
html.accessibility-mode.accessibility-plain-text .journey-markers,
html.accessibility-mode.accessibility-plain-text .hero-cta,
html.accessibility-mode.accessibility-plain-text .metrics,
html.accessibility-mode.accessibility-plain-text .visual-canvas,
html.accessibility-mode.accessibility-plain-text .visual-stack,
html.accessibility-mode.accessibility-plain-text .artwork-stack,
html.accessibility-mode.accessibility-plain-text .hero figure,
html.accessibility-mode.accessibility-plain-text .labs-grid .media-card,
html.accessibility-mode.accessibility-plain-text .notes-grid .media-card {
    display: none !important;
}

html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .btn,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .hero-cta,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .metrics,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .nav-links,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .brand,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .hero-kicker,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .toolkit-grid,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .visual-stack,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .visual-canvas,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .artwork-stack,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .artwork-grid,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .code-overlay,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .grid-overlay,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .image-modal,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .soon-toast,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .hero-profile,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .hero figure,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .journey-monitor,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .journey-histogram,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .journey-markers,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .media-stack,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .visual-media,
html.accessibility-mode.accessibility-plain-text[data-accessibility-page="site"] .screens {
    display: none !important;
}

html.accessibility-mode:not(.accessibility-plain-text)[data-accessibility-page="site"] img,
html.accessibility-mode:not(.accessibility-plain-text)[data-accessibility-page="site"] video {
    display: block !important;
    max-width: min(100%, 560px) !important;
    width: auto !important;
    height: auto !important;
    margin: 0.5rem 0 1rem !important;
    border: 1px solid var(--line) !important;
}

html.accessibility-mode:not(.accessibility-plain-text)[data-accessibility-page="site"] figure {
    display: block !important;
    margin: 0 0 1rem !important;
    padding: 0 !important;
    background: transparent !important;
    border: 0 !important;
}

html.accessibility-mode.accessibility-plain-text .hero,
html.accessibility-mode.accessibility-plain-text .panel,
html.accessibility-mode.accessibility-plain-text .story-card,
html.accessibility-mode.accessibility-plain-text .subpanel,
html.accessibility-mode.accessibility-plain-text .deploy-node,
html.accessibility-mode.accessibility-plain-text .metric,
html.accessibility-mode.accessibility-plain-text .card,
html.accessibility-mode.accessibility-plain-text .note,
html.accessibility-mode.accessibility-plain-text .project-card,
html.accessibility-mode.accessibility-plain-text .route-card,
html.accessibility-mode.accessibility-plain-text .detail-card,
html.accessibility-mode.accessibility-plain-text .timeline-item,
html.accessibility-mode.accessibility-plain-text .tool,
html.accessibility-mode.accessibility-plain-text .tool-card,
html.accessibility-mode.accessibility-plain-text .visual-card,
html.accessibility-mode.accessibility-plain-text .skill-card,
html.accessibility-mode.accessibility-plain-text .journey-node,
html.accessibility-mode.accessibility-plain-text .journey-frame,
html.accessibility-mode.accessibility-plain-text .feature-card,
html.accessibility-mode.accessibility-plain-text .report-card,
html.accessibility-mode.accessibility-plain-text .pill,
html.accessibility-mode.accessibility-plain-text .chip {
    border: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

html.accessibility-mode h1,
html.accessibility-mode h2,
html.accessibility-mode h3,
html.accessibility-mode h4,
html.accessibility-mode h5,
html.accessibility-mode h6,
html.accessibility-mode .brand,
html.accessibility-mode .hero-kicker,
html.accessibility-mode .badge,
html.accessibility-mode .chip,
html.accessibility-mode .metric strong,
html.accessibility-mode .nav-links,
html.accessibility-mode .topbar {
    font-family: Arial, Helvetica, sans-serif !important;
    letter-spacing: normal !important;
    text-transform: none !important;
}

html.accessibility-mode a {
    color: var(--cyan) !important;
    text-decoration: underline !important;
}

html.accessibility-mode a:hover,
html.accessibility-mode a:focus-visible {
    background: transparent !important;
}

html.accessibility-mode .btn,
html.accessibility-mode .peer-link,
html.accessibility-mode .back-link,
html.accessibility-mode .nav-links a {
    background: transparent !important;
    border-color: var(--line) !important;
    color: var(--text) !important;
}

html.accessibility-mode .nav-links,
html.accessibility-mode .hero-layout,
html.accessibility-mode .grid,
html.accessibility-mode .detail-grid,
html.accessibility-mode .grid-two,
html.accessibility-mode .tool-grid,
html.accessibility-mode .journey-layout,
html.accessibility-mode .labs-grid,
html.accessibility-mode .notes-grid,
html.accessibility-mode .screen-grid,
html.accessibility-mode .section-stack {
    gap: 1rem !important;
}

html.accessibility-mode .nav-links,
html.accessibility-mode .topbar {
    flex-wrap: wrap !important;
}

html.accessibility-mode .nav-links,
html.accessibility-mode .hero-layout,
html.accessibility-mode .grid,
html.accessibility-mode .detail-grid,
html.accessibility-mode .grid-two,
html.accessibility-mode .tool-grid,
html.accessibility-mode .journey-layout,
html.accessibility-mode .labs-grid,
html.accessibility-mode .notes-grid,
html.accessibility-mode .screen-grid,
html.accessibility-mode .section-stack,
html.accessibility-mode .medtech-grid {
    display: block !important;
}

html.accessibility-mode .nav-links a,
html.accessibility-mode .back-link,
html.accessibility-mode .peer-link,
html.accessibility-mode .repo-link,
html.accessibility-mode .btn,
html.accessibility-mode .chip,
html.accessibility-mode .metric,
html.accessibility-mode .story-card,
html.accessibility-mode .panel,
html.accessibility-mode .hero,
html.accessibility-mode .subpanel,
html.accessibility-mode .deploy-node,
html.accessibility-mode .card,
html.accessibility-mode .route-card,
html.accessibility-mode .detail-card,
html.accessibility-mode .timeline-item,
html.accessibility-mode .tool,
html.accessibility-mode .tool-card,
html.accessibility-mode .visual-card,
html.accessibility-mode .skill-card,
html.accessibility-mode .journey-card,
html.accessibility-mode .feature-card,
html.accessibility-mode .report-card {
    display: block !important;
    width: auto !important;
}

html.accessibility-mode .wrap,
html.accessibility-mode .nav-inner,
html.accessibility-mode .topbar {
    width: min(1120px, 94vw) !important;
}

html.accessibility-mode nav {
    position: static !important;
    border-bottom: 1px solid var(--line) !important;
}

html.accessibility-mode section {
    padding: 0 0 1rem !important;
}

html.accessibility-mode .hero,
html.accessibility-mode .panel,
html.accessibility-mode .story-card,
html.accessibility-mode .subpanel,
html.accessibility-mode .deploy-node,
html.accessibility-mode .metric,
html.accessibility-mode .card,
html.accessibility-mode .note,
html.accessibility-mode .project-card,
html.accessibility-mode .route-card,
html.accessibility-mode .detail-card,
html.accessibility-mode .timeline-item,
html.accessibility-mode .tool,
html.accessibility-mode .tool-card,
html.accessibility-mode .visual-card,
html.accessibility-mode .skill-card,
html.accessibility-mode .journey-card,
html.accessibility-mode .feature-card,
html.accessibility-mode .report-card {
    padding: 0 0 0.8rem !important;
    margin: 0 0 1rem !important;
}

html.accessibility-mode .nav-links a,
html.accessibility-mode .back-link,
html.accessibility-mode .peer-link,
html.accessibility-mode .repo-link,
html.accessibility-mode .btn {
    padding: 0 !important;
    border: 0 !important;
    text-decoration: underline !important;
}

html.accessibility-mode[data-accessibility-page="site"] .hero,
html.accessibility-mode[data-accessibility-page="site"] .panel,
html.accessibility-mode[data-accessibility-page="site"] .story-card,
html.accessibility-mode[data-accessibility-page="site"] .subpanel,
html.accessibility-mode[data-accessibility-page="site"] .deploy-node,
html.accessibility-mode[data-accessibility-page="site"] .metric,
html.accessibility-mode[data-accessibility-page="site"] .card,
html.accessibility-mode[data-accessibility-page="site"] .note,
html.accessibility-mode[data-accessibility-page="site"] .project-card,
html.accessibility-mode[data-accessibility-page="site"] .route-card,
html.accessibility-mode[data-accessibility-page="site"] .detail-card,
html.accessibility-mode[data-accessibility-page="site"] .timeline-item,
html.accessibility-mode[data-accessibility-page="site"] .tool,
html.accessibility-mode[data-accessibility-page="site"] .tool-card,
html.accessibility-mode[data-accessibility-page="site"] .visual-card,
html.accessibility-mode[data-accessibility-page="site"] .skill-card,
html.accessibility-mode[data-accessibility-page="site"] .journey-node,
html.accessibility-mode[data-accessibility-page="site"] .journey-frame,
html.accessibility-mode[data-accessibility-page="site"] .feature-card,
html.accessibility-mode[data-accessibility-page="site"] .report-card,
html.accessibility-mode[data-accessibility-page="site"] .pill,
html.accessibility-mode[data-accessibility-page="site"] .chip {
    color: var(--text) !important;
}
`;
        document.head.appendChild(style);
    }

    function reflectControls(settings) {
        const enabled = document.getElementById(controlIds.enabled);
        const plainText = document.getElementById(controlIds.plainText);
        const theme = document.getElementById(controlIds.theme);
        const fontScale = document.getElementById(controlIds.fontScale);
        const lineHeight = document.getElementById(controlIds.lineHeight);
        const fontScaleValue = document.getElementById(controlIds.fontScaleValue);
        const lineHeightValue = document.getElementById(controlIds.lineHeightValue);

        if (enabled) {
            enabled.checked = settings.enabled;
        }
        if (plainText) {
            plainText.checked = settings.plainText;
        }
        if (theme) {
            theme.value = settings.theme;
        }
        if (fontScale) {
            fontScale.value = String(settings.fontScale);
        }
        if (lineHeight) {
            lineHeight.value = String(settings.lineHeight);
        }
        if (fontScaleValue) {
            fontScaleValue.textContent = `${Math.round(settings.fontScale * 100)}%`;
        }
        if (lineHeightValue) {
            lineHeightValue.textContent = settings.lineHeight.toFixed(2);
        }
    }

    function updateSettings(partial) {
        const next = {
            ...readSettings(),
            ...partial,
        };

        next.enabled = Boolean(next.enabled);
        next.plainText = Boolean(next.plainText);
        next.theme = themes[next.theme] ? next.theme : defaultSettings.theme;
        next.fontScale = clampNumber(next.fontScale, 0.9, 1.7, defaultSettings.fontScale);
        next.lineHeight = clampNumber(next.lineHeight, 1.35, 2.1, defaultSettings.lineHeight);

        saveSettings(next);
        applyPalette(next);
        reflectControls(next);
        return next;
    }

    function bindControls() {
        const enabled = document.getElementById(controlIds.enabled);
        const plainText = document.getElementById(controlIds.plainText);
        const theme = document.getElementById(controlIds.theme);
        const fontScale = document.getElementById(controlIds.fontScale);
        const lineHeight = document.getElementById(controlIds.lineHeight);
        const reset = document.getElementById(controlIds.reset);

        if (!enabled && !plainText && !theme && !fontScale && !lineHeight && !reset) {
            return;
        }

        enabled?.addEventListener("change", () => {
            updateSettings({ enabled: enabled.checked });
        });

        plainText?.addEventListener("change", () => {
            updateSettings({ plainText: plainText.checked });
        });

        theme?.addEventListener("change", () => {
            updateSettings({ theme: theme.value });
        });

        fontScale?.addEventListener("input", () => {
            const value = clampNumber(fontScale.value, 0.9, 1.7, defaultSettings.fontScale);
            updateSettings({ fontScale: value });
        });

        lineHeight?.addEventListener("input", () => {
            const value = clampNumber(lineHeight.value, 1.35, 2.1, defaultSettings.lineHeight);
            updateSettings({ lineHeight: value });
        });

        reset?.addEventListener("click", () => {
            updateSettings({ ...defaultSettings });
        });
    }

    function init() {
        ensureStyleTag();
        applyPalette(readSettings());
        reflectControls(readSettings());
        bindControls();
    }

    window.HexodenAccessibility = {
        getSettings: readSettings,
        setSettings: updateSettings,
        reset: () => updateSettings({ ...defaultSettings }),
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
