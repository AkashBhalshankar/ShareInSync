const CACHE = 'shareinsync-shell-v6';
const SHELL = ['./', './index.html', './sw.js'];

self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const url = new URL(event.request.url); const isShell = event.request.mode === 'navigate' || /\/(?:index\.html|sw\.js)$/u.test(url.pathname);
  if (!isShell) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok && event.request.mode === 'navigate') caches.open(CACHE).then((cache) => cache.put('./index.html', response.clone()));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
