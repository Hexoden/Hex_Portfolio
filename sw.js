const CACHE_VERSION = "hexoden-cache-v12";
const RUNTIME_CACHE = "hexoden-runtime-v12";
const ASSET_CACHE = "hexoden-assets-v12";
const MEDIA_CACHE = "hexoden-media-v12";

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
    "./Media/Pictures/selfportrait-pixel.webp",
    "./Media/Pictures/game-screenshot.webp",
    "./Media/Pictures/statemachine-screenshot.webp",
    "./Media/Pictures/remote-mapping.webp"
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

function isStreamingMediaRequest(request) {
    const url = new URL(request.url);
    const mediaPath = /\.(mp4|webm|ogg|mp3|wav|m4a)$/i.test(url.pathname);
    return request.headers.has("range") || request.destination === "video" || request.destination === "audio" || mediaPath;
}

function isStaticRequest(request) {
    return request.destination === "script" || request.destination === "style" || request.destination === "font";
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Range requests (common for media scrubbing/streaming) should bypass Cache API writes.
    if (request.headers.has("range")) {
        try {
            return await fetch(request);
        } catch {
            return cached || Response.error();
        }
    }

    const networkFetch = fetch(request)
        .then((response) => {
            if (response && (response.ok || response.type === "opaque")) {
                try {
                    cache.put(request, response.clone());
                } catch {
                    // Ignore cache write failures and still return network response.
                }
            }
            return response;
        })
        .catch(() => cached || Response.error());

    return cached || networkFetch;
}

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (!isCacheableRequest(request)) {
        return;
    }

    // Streaming media is fetched directly to avoid Cache API edge cases.
    if (isStreamingMediaRequest(request)) {
        event.respondWith(
            fetch(request).catch(async () => {
                const cached = await caches.match(request);
                return cached || Response.error();
            })
        );
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
                    cache.put(request, response.clone()).catch(() => {});
                    return response;
                } catch {
                    const cached = await caches.match(request);
                    const fallback = await caches.match("./index.html");
                    return cached || fallback || Response.error();
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
                        caches
                            .open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(request, copy).catch(() => {});
                            })
                            .catch(() => {});
                    }
                    return response;
                })
                .catch(() => cached || Response.error());

            return cached || networkFetch;
        })
    );
});
