const CACHE_NAME = 'habit-tracker-v5';
const APP_SHELL = ['/', '/login', '/signup', '/dashboard'];

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(
    APP_SHELL.map(url =>
      fetch(url, { cache: 'reload' })
        .then(res => { if (res.ok || res.type === 'opaqueredirect') cache.put(url, res); })
        .catch(() => {})
    )
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res.ok && APP_SHELL.includes(new URL(event.request.url).pathname)) {
          caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
        }
        return res;
      });
    }).catch(() => caches.match('/'))
  );
});
