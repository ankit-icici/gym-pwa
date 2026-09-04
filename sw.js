/* Service worker: precache the shell, then serve it cache-first so the app
   opens instantly and works with no signal in the gym basement.
   Bump CACHE whenever you ship changes. */
const CACHE = 'gym-v3';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/app.js',
  './js/rig.js',
  './js/anatomy.js',
  './js/equipment.js',
  './js/data/back.js',
  './js/data/back3d.js',
  './js/three/figure.js',
  './js/three/kit3d.js',
  './js/three/viewer.js',
  './vendor/three.module.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  // Navigations: try the network first so a fresh deploy is picked up, and
  // fall back to the cached shell when there is no signal.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }

  // Everything else: stale-while-revalidate. The cached copy answers straight
  // away (fast, and works offline) while a fresh copy is fetched for next time.
  // Plain cache-first would pin the app to whatever shipped first.
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    }),
  );
});
