const CACHE_VERSION = "hexoden-cache-v4";
const RUNTIME_CACHE = "hexoden-runtime-v4";

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
                        .filter((key) => key !== CACHE_VERSION && key !== RUNTIME_CACHE)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

function isCacheableRequest(request) {
    return request.method === "GET" && request.url.startsWith("http");
}

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (!isCacheableRequest(request)) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    return cached || caches.match("./index.html");
                })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const networkFetch = fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
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
