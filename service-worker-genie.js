// service-worker-genie.js – stabile Minimalversion für G-Core Genie

// Install: wird ausgeführt, wenn der Service Worker registriert wird
self.addEventListener("install", (event) => {
  console.log("[Genie-SW] Install");
  // sofort aktiv werden, ohne auf alte Versionen zu warten
  self.skipWaiting();
});

// Activate: übernimmt sofort alle Clients (Tabs)
self.addEventListener("activate", (event) => {
  console.log("[Genie-SW] Activate");
  self.clients.claim();
});

// Fetch: wir lassen ALLES normal durchs Netz laufen
// (kein Cache, kein Risiko für Fehler)
self.addEventListener("fetch", (event) => {
  // Hier könnte später Cache-Logik rein,
  // aktuell tun wir bewusst NICHTS.
});
