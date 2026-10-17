// ============================================================
// SERVICE WORKER — Media Pembelajaran Mesin Bubut
// Strategi: Cache First untuk aset sendiri, Stale-While-Revalidate untuk CDN
// ============================================================

const CACHE_NAME = 'bubut-v1';

// Semua file INTI yang wajib tersedia offline
const CORE_ASSETS = [
  './',
  './index.html',
  './materi.html',
  './video.html',
  './simulasi.html',
  './kuiz.html',
  './profil.html',
  './login.html',
  './guru.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png'
];

// ============================================================
// INSTALL — simpan aset inti
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.error('SW install gagal:', err))
  );
});

// ============================================================
// ACTIVATE — bersihkan cache versi lama
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ============================================================
// FETCH — strategi caching berdasarkan asal request
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ---------- 1. SUPABASE: selalu network, fallback JSON error ----------
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: 'Offline — data server tidak tersedia' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // ---------- 2. ORIGIN SENDIRI (HTML, CSS, JS, ikon): Cache First ----------
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          // Saat offline + belum ada di cache
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // ---------- 3. CDN EKSTERNAL (Three.js, Font Awesome, Google Fonts, YouTube): SWR ----------
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok || response.type === 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
