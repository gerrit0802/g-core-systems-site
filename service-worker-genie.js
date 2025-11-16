// G-CORE LAUNCHPAD – Minimaler Service Worker

const CACHE_NAME = "gcore-launchpad-v1";
const APP_SHELL = [
  "/",
  "/genie-host.html",
  "/manifest_genie.webmanifest",
  "/assets_icons/gcore_logo_192.png",
  "/assets_icons/gcore_logo_512.png"
];

// Installation – Shell in Cache legen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn("[G-CORE SW] Konnte nicht alle Dateien cachen:", err);
      });
    })
  );
});

// Aktivierung – alte Caches aufräumen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// Fetch – Network first, Fallback Cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
