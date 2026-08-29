/**
 * SERVICE WORKER FOR MUSHAF AL-QUR'AN INDONESIA
 * Full Offline PWA Cache & Dynamic Audio Offline Caching
 */

const CACHE_NAME = 'quran-mushaf-v2';
const AUDIO_CACHE = 'quran-audio-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './favicon.ico',
  './manifest.json',
  './css/tailwind.css',
  './css/mushaf.css',
  './js/app.js',
  './js/data/chapters.js',
  './js/data/juzs.js',
  './js/data/pages_index.js',
  './js/data/doas.js',
  './js/data/tajwid_rules.js',
  './js/services/api.js',
  './js/services/audio.js',
  './js/components/HeaderNav.js',
  './js/components/MushafPage.js',
  './js/components/TwoPageView.js',
  './js/components/HDScanView.js',
  './js/components/AyahListView.js',
  './js/components/AudioBar.js',
  './js/components/Modals.js',
  './assets/fonts/lpmq_misbah.ttf',
  './assets/fonts/kfgqpc_hafs.woff2',
  './assets/fonts/amiri_0.woff2',
  './assets/fonts/amiri_1.woff2',
  './assets/fonts/jakarta_2.woff2',
  './assets/fonts/jakarta_4.woff2',
  './assets/fonts/jakarta_5.woff2',
  './assets/fonts/scheherazade_6.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== AUDIO_CACHE)
            .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Audio Cache Strategy (Cache & Stream)
  if (url.hostname.includes('verses.quran.com') || url.hostname.includes('everyayah.com') || url.hostname.includes('qurancdn.com')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (e) {
          return new Response('', { status: 408 });
        }
      })
    );
    return;
  }

  // 2. Local Assets Cache Strategy (Cache-First)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
