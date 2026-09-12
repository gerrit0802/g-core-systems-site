// Stilllegung 2026-09-12: kein Offline-Host und keine API-Anbindung mehr.
// Diese kleine Datei bleibt erreichbar, damit alte Installationen aufräumen.
const RETIRED_CACHES = ['gcore-launchpad-v1', 'gcore-mobile-host-v1'];

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await Promise.all(RETIRED_CACHES.map((name) => caches.delete(name)));
    await self.registration.unregister();
  })());
});
