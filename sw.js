/* ===================================================
   Colton's Reading App — Service Worker (network-first strategy)
   =================================================== */

const CACHE_NAME = 'coltons-reading-app-v11';

const APP_SHELL = [
  'index.html',
  'styles.css',
  'app.js',
  'words.js',
  'lessons.js',
  'passages.js',
  'storage.js',
  'ai.js',
  'badges.js',
  'sound.js',
  'manifest.json'
];

/* ----------------------------------------------------
   Install — pre-cache every file in the app shell
   ---------------------------------------------------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ----------------------------------------------------
   Activate — remove any outdated caches
   ---------------------------------------------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ----------------------------------------------------
   Fetch — network first, fall back to cache
   ---------------------------------------------------- */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Clone the response so we can store a copy in the cache
        // while still returning the original to the page.
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
