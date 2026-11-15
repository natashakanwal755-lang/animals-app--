const V = 'animal-fun-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => {
      if (r && r.ok && new URL(e.request.url).origin === location.origin) {
        const copy = r.clone();
        caches.open(V).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => hit || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error()));
    return hit || net;
  }));
});
