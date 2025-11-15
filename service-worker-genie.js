// service-worker-genie.js
const CACHE_NAME = "gcore-genie-v1";

const ASSETS_TO_CACHE = [
  "/",
  "/genie-host.html",                     // dein Genie Host
  "/manifest_genie.webmanifest",
  "/assets_icons/genie-softglow-192.png",
  "/assets_icons/genie-softglow-512.png"
];

// INSTALL: Basis-Dateien cachen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// ACTIVATE: alte Caches aufräumen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH:
// - API Calls zu /genie NICHT anfassen
// - HTML: network-first mit Fallback
// - Rest: cache-first
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;

  // API zum Router nie cachen
  if (url.pathname.startsWith("/genie")) return;

  // Navigationsanfragen (HTML)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            (cached) => cached || caches.match("/genie-host.html")
          )
        )
    );
    return;
  }

  // Sonstige Assets
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
