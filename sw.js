/* SaraGym — funciona sin conexión. La página se pide siempre a la red primero (para recibir mejoras) y si no hay red se usa la copia guardada. */
const C = 'saragym-v10';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', 'https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate' || (u.origin === location.origin && /\/(index\.html)?$/.test(u.pathname))) {
    e.respondWith(fetch(new Request(u.origin + u.pathname, { cache: 'no-cache', credentials: 'same-origin' })).then((res) => { const cp = res.clone(); caches.open(C).then((c) => c.put('./index.html', cp)); return res; }).catch(() => caches.match('./index.html').then((m) => m || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); } return res; })));
});
