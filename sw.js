/* Service worker: precache the shell, then serve it cache-first so the app
   opens instantly and works with no signal in the gym basement.
   Bump CACHE whenever you ship changes. */
const CACHE = 'gym-v4';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/app.js',
  './js/anatomy.js',
  './js/data/back.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './img/demo/back-extension-0.jpg',
  './img/demo/back-extension-1.jpg',
  './img/demo/barbell-shrug-0.jpg',
  './img/demo/barbell-shrug-1.jpg',
  './img/demo/bent-over-barbell-row-0.jpg',
  './img/demo/bent-over-barbell-row-1.jpg',
  './img/demo/cable-rear-delt-fly-0.jpg',
  './img/demo/cable-rear-delt-fly-1.jpg',
  './img/demo/cable-upright-row-0.jpg',
  './img/demo/cable-upright-row-1.jpg',
  './img/demo/deadlift-0.jpg',
  './img/demo/deadlift-1.jpg',
  './img/demo/dumbbell-pullover-0.jpg',
  './img/demo/dumbbell-pullover-1.jpg',
  './img/demo/dumbbell-shrug-0.jpg',
  './img/demo/dumbbell-shrug-1.jpg',
  './img/demo/face-pull-0.jpg',
  './img/demo/face-pull-1.jpg',
  './img/demo/farmers-carry-0.jpg',
  './img/demo/farmers-carry-1.jpg',
  './img/demo/good-morning-0.jpg',
  './img/demo/good-morning-1.jpg',
  './img/demo/lat-pulldown-0.jpg',
  './img/demo/lat-pulldown-1.jpg',
  './img/demo/machine-high-row-0.jpg',
  './img/demo/machine-high-row-1.jpg',
  './img/demo/meadows-row-0.jpg',
  './img/demo/meadows-row-1.jpg',
  './img/demo/neutral-grip-pulldown-0.jpg',
  './img/demo/neutral-grip-pulldown-1.jpg',
  './img/demo/pull-up-0.jpg',
  './img/demo/pull-up-1.jpg',
  './img/demo/rack-pull-0.jpg',
  './img/demo/rack-pull-1.jpg',
  './img/demo/rear-delt-raise-0.jpg',
  './img/demo/rear-delt-raise-1.jpg',
  './img/demo/reverse-machine-fly-0.jpg',
  './img/demo/reverse-machine-fly-1.jpg',
  './img/demo/seated-cable-row-0.jpg',
  './img/demo/seated-cable-row-1.jpg',
  './img/demo/single-arm-dumbbell-row-0.jpg',
  './img/demo/single-arm-dumbbell-row-1.jpg',
  './img/demo/straight-arm-pulldown-0.jpg',
  './img/demo/straight-arm-pulldown-1.jpg',
  './img/demo/t-bar-row-0.jpg',
  './img/demo/t-bar-row-1.jpg',
  './img/demo/v-bar-pullup-0.jpg',
  './img/demo/v-bar-pullup-1.jpg',
];

self.addEventListener('install', (e) => {
  // `cache: 'reload'` forces every precache fetch past the HTTP cache. GitHub
  // Pages serves assets with max-age=600, so a plain addAll right after a
  // deploy can bake stale files into a fresh cache — and half-old, half-new
  // ES modules break in confusing ways.
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((url) =>
        fetch(new Request(url, { cache: 'reload' }))
          .then((res) => (res.ok ? c.put(url, res) : null))
          .catch(() => null))))
      .then(() => self.skipWaiting()),
  );
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
