// service-worker-genie.js
// G-CORE LAUNCHPAD · Shell-Caching ohne API-Störung

const CACHE_NAME = "gcore-launchpad-v1";

// Alles, was zur Shell gehört und offline verfügbar sein soll.
// Pfade ggf. anpassen, falls dein Repo anders strukturiert ist.
const SHELL_ASSETS = [
  "/",
  "/genie-host.html",
  "/manifest_genie.webmanifest",
  "/assets_icons/gcore-icon-192.png",
  "/assets_icons/gcore-icon-512.png",
  "/assets_icons/gcore_launchpad_maskable_192.png"
];

// INSTALL: Shell-Dateien cachen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        console.warn("[SW] Fehler beim Vorab-Cachen:", err);
      });
    })
  );
  self.skipWaiting();
});

// ACTIVATE: Alte Caches aufräumen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith("gcore-launchpad-") && key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH: 
// - Navigationsanfragen -> Shell aus Cache, Fallback Network
// - Statische Assets -> Cache first, sonst Network
// - API-Calls & Fremd-Domains -> NICHT anfassen (direkt durchlassen)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Nur GET behandeln
  if (req.method !== "GET") {
    return;
  }

  // 2) Fremde Domains (z.B. https://api.g-core-systems.com) nicht anfassen
  if (url.origin !== self.location.origin) {
    return;
  }

  // 3) Navigationsanfragen (App öffnen / reload)
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("/genie-host.html").then((cached) => {
        if (cached) return cached;
        return fetch(req).catch(() => {
          // Fallback: wenn offline und nichts im Cache
          return caches.match("/genie-host.html");
        });
      })
    );
    return;
  }

  // 4) Sonstige Shell-Assets: Cache first
  if (SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            // Ergebnis für die Zukunft cachen
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, resClone);
            });
            return res;
          })
          .catch(() => cached);
      })
    );
  }

  // Alles andere läuft einfach normal durch (kein respondWith)
});
