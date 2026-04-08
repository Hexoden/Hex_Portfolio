// Intersection Observer for reveal animations
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    },
    {
        threshold: 0.2,
    }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Code overlay configuration
const codeOverlay = document.querySelector(".code-overlay");
const fallbackCodeSnippets = [
    "const app = initPortfolio();",
    "if (idea) build(idea);",
    "fetch('/api/projects').then(render);",
    "for (const bug of bugs) { solve(bug); }",
    "deploy('github-pages', { branch: 'main' });",
    "while (learning) { keepBuilding(); }",
    "npm run test && npm run lint",
    "const yoloDeploy = false;"
];
const codeSnippets = Array.isArray(window.CODE_SNIPPETS) && window.CODE_SNIPPETS.length > 0
    ? window.CODE_SNIPPETS
    : fallbackCodeSnippets;

const isCompactViewport = window.matchMedia("(max-width: 720px)").matches;
const maxCodeLines = isCompactViewport ? 12 : 22;
let activeCodeLines = 0;
const activeOverlaySlots = [];
let overlayStrengthFrame = 0;

// Utility functions
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateCodeOverlayStrength() {
    if (!codeOverlay || overlayStrengthFrame) {
        return;
    }

    overlayStrengthFrame = window.requestAnimationFrame(() => {
        overlayStrengthFrame = 0;

        const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const progress = Math.min(window.scrollY / maxScroll, 1);
        const strength = 0.82 - progress * 0.35;
        codeOverlay.style.opacity = strength.toFixed(2);
    });
}

function pruneOverlaySlots() {
    for (let i = activeOverlaySlots.length - 1; i >= 0; i -= 1) {
        if (!activeOverlaySlots[i].element.isConnected) {
            activeOverlaySlots.splice(i, 1);
        }
    }
}

function boxesOverlap(a, b, padding = 14) {
    return !(
        a.right + padding < b.left ||
        a.left > b.right + padding ||
        a.bottom + padding < b.top ||
        a.top > b.bottom + padding
    );
}

function estimateSnippetWidth(snippet) {
    const charWidth = isCompactViewport ? 7.2 : 8.4;
    return Math.min(window.innerWidth * 0.72, snippet.length * charWidth + 24);
}

function findOverlaySlot(snippet, zone) {
    pruneOverlaySlots();

    const minTopPx = Math.floor(((zone?.minTop ?? 6) / 100) * window.innerHeight);
    const maxTopPx = Math.floor(((zone?.maxTop ?? 92) / 100) * window.innerHeight);
    const minLeftPx = Math.floor(((zone?.minLeft ?? 4) / 100) * window.innerWidth);
    const maxLeftPxRaw = Math.floor(((zone?.maxLeft ?? 82) / 100) * window.innerWidth);

    const width = estimateSnippetWidth(snippet);
    const height = 24;
    const maxLeftPx = Math.min(maxLeftPxRaw, Math.floor(window.innerWidth - width - 12));

    if (maxLeftPx <= minLeftPx || maxTopPx <= minTopPx) {
        return null;
    }

    const attempts = 18;
    for (let i = 0; i < attempts; i += 1) {
        const top = randomBetween(minTopPx, maxTopPx);
        const left = randomBetween(minLeftPx, maxLeftPx);
        const candidate = {
            top,
            left,
            right: left + width,
            bottom: top + height,
        };

        const collides = activeOverlaySlots.some((slot) => boxesOverlap(candidate, slot.box));
        if (!collides) {
            return candidate;
        }
    }

    return null;
}

function scheduleCodeLine() {
    const nextDelay = randomBetween(420, 1600);
    window.setTimeout(() => {
        if (activeCodeLines < maxCodeLines) {
            spawnCodeLine();
        }
        scheduleCodeLine();
    }, nextDelay);
}

function scheduleBurst() {
    const burstDelay = randomBetween(5600, 11000);
    window.setTimeout(() => {
        if (activeCodeLines < maxCodeLines) {
            const burstSize = randomBetween(2, 3);
            const heroRect = {
                minTop: 10,
                maxTop: 58,
                minLeft: 8,
                maxLeft: 84,
            };

            for (let i = 0; i < burstSize; i += 1) {
                const delay = i * randomBetween(140, 260);
                window.setTimeout(() => {
                    if (activeCodeLines < maxCodeLines) {
                        spawnCodeLine(heroRect);
                    }
                }, delay);
            }
        }

        scheduleBurst();
    }, burstDelay);
}

function spawnCodeLine(zone) {
    if (!codeOverlay || codeSnippets.length === 0) {
        return;
    }

    const snippet = codeSnippets[randomBetween(0, codeSnippets.length - 1)];
    const slot = findOverlaySlot(snippet, zone);
    if (!slot) {
        return;
    }

    const line = document.createElement("span");

    line.className = "code-line";
    line.style.top = slot.top + "px";
    line.style.left = slot.left + "px";
    line.textContent = "";
    codeOverlay.appendChild(line);
    activeCodeLines += 1;
    activeOverlaySlots.push({
        element: line,
        box: slot,
    });

    requestAnimationFrame(() => line.classList.add("visible"));

    let idx = 0;
    const typingSpeed = randomBetween(28, 64);
    const typeTimer = window.setInterval(() => {
        idx += 1;
        line.textContent = snippet.slice(0, idx);

        if (idx >= snippet.length) {
            window.clearInterval(typeTimer);
            const holdMs = randomBetween(700, 2200);
            window.setTimeout(() => {
                line.classList.add("fading");
                window.setTimeout(() => {
                    line.remove();
                    const idx = activeOverlaySlots.findIndex((slotItem) => slotItem.element === line);
                    if (idx !== -1) {
                        activeOverlaySlots.splice(idx, 1);
                    }
                    activeCodeLines = Math.max(0, activeCodeLines - 1);
                }, 420);
            }, holdMs);
        }
    }, typingSpeed);
}

// Image modal functionality
const imageModal = document.getElementById("image-modal");
const imageModalImg = document.getElementById("image-modal-img");
const imageModalClose = document.getElementById("image-modal-close");
const soonToast = document.getElementById("soon-toast");
const soonTriggers = document.querySelectorAll(".coming-soon-trigger");
let soonToastTimer;

function showSoonToast() {
    if (!soonToast) {
        return;
    }

    soonToast.textContent = "Coming soon";
    soonToast.classList.add("show");
    window.clearTimeout(soonToastTimer);
    soonToastTimer = window.setTimeout(() => {
        soonToast.classList.remove("show");
    }, 1300);
}

soonTriggers.forEach((card) => {
    card.addEventListener("click", showSoonToast);
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            showSoonToast();
        }
    });
});

function openImageModal(src, alt) {
    if (!imageModal || !imageModalImg) {
        return;
    }

    imageModalImg.src = src;
    imageModalImg.alt = alt;
    imageModal.classList.add("open");
    imageModal.setAttribute("aria-hidden", "false");
}

function closeImageModal() {
    if (!imageModal || !imageModalImg) {
        return;
    }

    imageModal.classList.remove("open");
    imageModal.setAttribute("aria-hidden", "true");
    imageModalImg.src = "";
}

document.querySelectorAll(".js-enlarge").forEach((img) => {
    img.addEventListener("click", () => {
        const src = img.dataset.fullsrc || img.src;
        openImageModal(src, img.alt || "Enlarged screenshot");
    });
});

if (imageModalClose) {
    imageModalClose.addEventListener("click", closeImageModal);
}

if (imageModal) {
    imageModal.addEventListener("click", (event) => {
        if (event.target === imageModal) {
            closeImageModal();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && imageModal?.classList.contains("open")) {
        closeImageModal();
    }
});

// Initialize animations and effects
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    updateCodeOverlayStrength();
    window.addEventListener("scroll", updateCodeOverlayStrength, { passive: true });
    window.addEventListener("resize", updateCodeOverlayStrength);
    scheduleCodeLine();
    scheduleBurst();
}

// Service Worker registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
}
