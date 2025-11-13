const CACHE_NAME = "gcore-mobile-host-v1";

const CACHE_URLS = [
  "/gcore_host.html",
  "/genie_test.html",
  "/manifest.webmanifest"
];

// Install: Basisdateien cachen
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS);
    })
  );
});

// Activate: Alte Caches aufräumen
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch: Erst Netzwerk, bei Fehler Cache nutzen
self.addEventListener("fetch", event => {
  const req = event.request;

  // Nur GET-Requests behandeln
  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req)
      .then(res => {
        // Erfolgreiche Antworten optional cachen
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, resClone);
        });
        return res;
      })
      .catch(() => {
        // Fallback auf Cache
        return caches.match(req).then(cached => {
          if (cached) return cached;
          // Wenn nichts im Cache: Notfall-Placeholder
          if (req.destination === "document") {
            return new Response(
              "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Offline</title></head><body style='background:#111214;color:#f5f5f7;font-family:system-ui;padding:24px;'><h1>G-CORE Host</h1><p>Es besteht gerade keine Verbindung zum Netzwerk.</p><p>Versuche es später noch einmal oder stelle die Internetverbindung wieder her.</p></body></html>",
              { headers: { "Content-Type": "text/html; charset=utf-8" } }
            );
          }
        });
      })
  );
});
