// service-worker-genie.js – stabile Cache-Version für G-Core Genie

const CACHE_NAME = "gcore-genie-cache-v2";

// ⚠️ WICHTIG: Nur Dateien eintragen, von denen du SICHER weißt, dass sie existieren.
const STATIC_ASSETS = [
  "/genie-host.html",                 // deine Hauptseite
  "/manifest_genie.webmanifest",      // dein Manifest
  "/assets_icons/genie-softglow-192.png",
  "/assets_icons/genie-softglow-512.png"
];

// INSTALL – Basis-Assets cachen (ohne Absturz bei Fehlpfad)
self.addEventListener("install", (event) => {
  console.log("[Genie-SW] Install v2");

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(STATIC_ASSETS);
        console.log("[Genie-SW] Static assets gecacht");
      } catch (err) {
        // Wenn hier ein Pfad falsch ist, stürzt der SW NICHT ab.
        console.warn("[Genie-SW] Fehler beim Cachen, SW bleibt trotzdem aktiv:", err);
      }
      self.skipWaiting();
    })()
  );
});

// ACTIVATE – alte Caches aufräumen
self.addEventListener("activate", (event) => {
  console.log("[Genie-SW] Activate v2");
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Genie-SW] Lösche alten Cache:", key);
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// FETCH – Routing-Strategie:
// - HTML/Navigationsanfragen: network-first mit Fallback
// - andere Assets (Icons etc.): cache-first mit Netzwerk-Fallback
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Nur GET-Requests anfassen
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // API-Calls zum Backend NICHT cachen
  if (url.origin === self.location.origin && url.pathname.startsWith("/genie")) {
    return; // Router-Anfragen direkt durchlassen
  }

  // Navigationsanfragen (Seitenaufrufe)
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkRes.clone());
          return networkRes;
        } catch (err) {
          // Offline-Fallback
          const cached = await caches.match("/genie-host.html");
          if (cached) return cached;
          // Wenn selbst das nicht da ist, einfach normalen Fehler werfen
          throw err;
        }
      })()
    );
    return;
  }

  // Alle anderen GET-Requests: cache-first
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const networkRes = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, networkRes.clone());
        return networkRes;
      } catch (err) {
        // Wenn Netzwerk weg und nicht im Cache: Pech, dann Fehler
        throw err;
      }
    })()
  );
});
