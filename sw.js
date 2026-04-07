const CACHE_VERSION = "hexoden-cache-v10";
const RUNTIME_CACHE = "hexoden-runtime-v10";
const ASSET_CACHE = "hexoden-assets-v10";
const MEDIA_CACHE = "hexoden-media-v10";

const PRECACHE_URLS = [
    "./",
    "./index.html",
    "./accessibility.html",
    "./accessibility.js",
    "./christopher-ai-project.html",
    "./commanddb-project.html",
    "./homelab-report.html",
    "./digital-sovereignty-report.html",
    "./code-snippets.js",
    "./christopher-ai-logo.svg",
    "./Media/Pictures/selfportrait-pixel.png",
    "./Media/Pictures/game-screenshot.png",
    "./Media/Pictures/statemachine-screenshot.png",
    "./Media/Pictures/remote-mapping.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_VERSION)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_VERSION && key !== RUNTIME_CACHE && key !== ASSET_CACHE && key !== MEDIA_CACHE)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => {
                if ("navigationPreload" in self.registration) {
                    return self.registration.navigationPreload.enable();
                }

                return undefined;
            })
            .then(() => self.clients.claim())
    );
});

function isCacheableRequest(request) {
    return request.method === "GET" && request.url.startsWith("http");
}

function isMediaRequest(request) {
    return request.destination === "image" || request.destination === "video";
}

function isStaticRequest(request) {
    return request.destination === "script" || request.destination === "style" || request.destination === "font";
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const networkFetch = fetch(request)
        .then((response) => {
            if (response && (response.ok || response.type === "opaque")) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cached);

    return cached || networkFetch;
}

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (!isCacheableRequest(request)) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            (async () => {
                const cache = await caches.open(RUNTIME_CACHE);
                const preloadResponse = await event.preloadResponse;

                if (preloadResponse) {
                    cache.put(request, preloadResponse.clone());
                    return preloadResponse;
                }

                try {
                    const response = await fetch(request);
                    cache.put(request, response.clone());
                    return response;
                } catch {
                    const cached = await caches.match(request);
                    return cached || caches.match("./index.html");
                }
            })()
        );
        return;
    }

    if (isMediaRequest(request)) {
        event.respondWith(staleWhileRevalidate(request, MEDIA_CACHE));
        return;
    }

    if (isStaticRequest(request)) {
        event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const networkFetch = fetch(request)
                .then((response) => {
                    if (response && (response.status === 200 || response.type === "opaque")) {
                        const copy = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => cached);

            return cached || networkFetch;
        })
    );
});
