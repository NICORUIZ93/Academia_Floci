const CACHE = 'academia-lab-shell-v1';
self.addEventListener('install', (event) => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  const response = await fetch('/index.html');
  const html = await response.text();
  const assets = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((m) => m[1]).filter((p) => p.startsWith('/assets/'));
  await cache.addAll(['/', '/index.html', ...assets]);
})()));
self.addEventListener('activate', (event) => event.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('academia-lab-shell-') && key !== CACHE).map((key) => caches.delete(key))))
));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(async () =>
    (await caches.match(event.request)) ?? new Response('Sin conexión; recurso no disponible', { status: 503 })));
});
