/* Service worker: precache the shell, then serve it cache-first so the app
   opens instantly and works with no signal in the gym basement.
   Bump CACHE whenever you ship changes. */
const CACHE = 'gym-v5';
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
  './img/demo/ball-back-extension-0.jpg',
  './img/demo/ball-back-extension-1.jpg',
  './img/demo/barbell-pullover-0.jpg',
  './img/demo/barbell-pullover-1.jpg',
  './img/demo/barbell-rear-delt-row-0.jpg',
  './img/demo/barbell-rear-delt-row-1.jpg',
  './img/demo/bent-over-barbell-row-0.jpg',
  './img/demo/bent-over-barbell-row-1.jpg',
  './img/demo/bent-over-dumbbell-row-0.jpg',
  './img/demo/bent-over-dumbbell-row-1.jpg',
  './img/demo/bent-over-reverse-fly-0.jpg',
  './img/demo/bent-over-reverse-fly-1.jpg',
  './img/demo/cable-face-pull-0.jpg',
  './img/demo/cable-face-pull-1.jpg',
  './img/demo/cable-rear-delt-fly-0.jpg',
  './img/demo/cable-rear-delt-fly-1.jpg',
  './img/demo/cable-rear-lateral-0.jpg',
  './img/demo/cable-rear-lateral-1.jpg',
  './img/demo/chest-supported-barbell-row-0.jpg',
  './img/demo/chest-supported-barbell-row-1.jpg',
  './img/demo/chest-supported-dumbbell-row-0.jpg',
  './img/demo/chest-supported-dumbbell-row-1.jpg',
  './img/demo/chin-up-0.jpg',
  './img/demo/chin-up-1.jpg',
  './img/demo/close-grip-pulldown-0.jpg',
  './img/demo/close-grip-pulldown-1.jpg',
  './img/demo/deadlift-0.jpg',
  './img/demo/deadlift-1.jpg',
  './img/demo/deficit-deadlift-0.jpg',
  './img/demo/deficit-deadlift-1.jpg',
  './img/demo/floor-back-extension-0.jpg',
  './img/demo/floor-back-extension-1.jpg',
  './img/demo/good-morning-0.jpg',
  './img/demo/good-morning-1.jpg',
  './img/demo/head-supported-rear-delt-raise-0.jpg',
  './img/demo/head-supported-rear-delt-raise-1.jpg',
  './img/demo/inverted-row-0.jpg',
  './img/demo/inverted-row-1.jpg',
  './img/demo/iso-lateral-machine-row-0.jpg',
  './img/demo/iso-lateral-machine-row-1.jpg',
  './img/demo/lying-rear-delt-raise-0.jpg',
  './img/demo/lying-rear-delt-raise-1.jpg',
  './img/demo/machine-high-row-0.jpg',
  './img/demo/machine-high-row-1.jpg',
  './img/demo/one-arm-cable-row-0.jpg',
  './img/demo/one-arm-cable-row-1.jpg',
  './img/demo/one-arm-dumbbell-row-0.jpg',
  './img/demo/one-arm-dumbbell-row-1.jpg',
  './img/demo/one-arm-landmine-row-0.jpg',
  './img/demo/one-arm-landmine-row-1.jpg',
  './img/demo/one-arm-pulldown-0.jpg',
  './img/demo/one-arm-pulldown-1.jpg',
  './img/demo/pull-up-0.jpg',
  './img/demo/pull-up-1.jpg',
  './img/demo/rack-pull-0.jpg',
  './img/demo/rack-pull-1.jpg',
  './img/demo/reverse-fly-with-rotation-0.jpg',
  './img/demo/reverse-fly-with-rotation-1.jpg',
  './img/demo/reverse-grip-barbell-row-0.jpg',
  './img/demo/reverse-grip-barbell-row-1.jpg',
  './img/demo/reverse-machine-fly-0.jpg',
  './img/demo/reverse-machine-fly-1.jpg',
  './img/demo/seated-cable-row-0.jpg',
  './img/demo/seated-cable-row-1.jpg',
  './img/demo/seated-good-morning-0.jpg',
  './img/demo/seated-good-morning-1.jpg',
  './img/demo/seated-rear-delt-raise-0.jpg',
  './img/demo/seated-rear-delt-raise-1.jpg',
  './img/demo/smith-machine-row-0.jpg',
  './img/demo/smith-machine-row-1.jpg',
  './img/demo/stiff-leg-good-morning-0.jpg',
  './img/demo/stiff-leg-good-morning-1.jpg',
  './img/demo/straight-arm-pulldown-0.jpg',
  './img/demo/straight-arm-pulldown-1.jpg',
  './img/demo/superman-0.jpg',
  './img/demo/superman-1.jpg',
  './img/demo/t-bar-row-0.jpg',
  './img/demo/t-bar-row-1.jpg',
  './img/demo/underhand-pulldown-0.jpg',
  './img/demo/underhand-pulldown-1.jpg',
  './img/demo/v-bar-pull-up-0.jpg',
  './img/demo/v-bar-pull-up-1.jpg',
  './img/demo/v-bar-pulldown-0.jpg',
  './img/demo/v-bar-pulldown-1.jpg',
  './img/demo/weighted-pull-up-0.jpg',
  './img/demo/weighted-pull-up-1.jpg',
  './img/demo/wide-grip-lat-pulldown-0.jpg',
  './img/demo/wide-grip-lat-pulldown-1.jpg',
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
