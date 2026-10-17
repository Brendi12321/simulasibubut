// ============================================================
// SERVICE WORKER — Media Pembelajaran Mesin Bubut
// Strategi: Cache First untuk aset sendiri, Stale-While-Revalidate untuk CDN
// ============================================================

const CACHE_NAME = 'bubut-v1';

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
// INSTALL
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
// ACTIVATE
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
// FETCH
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ---------- 1. SUPABASE ----------
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

  // ---------- 2. ORIGIN SENDIRI ----------
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
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // ---------- 3. CDN EKSTERNAL (Google Fonts, Font Awesome, Three.js, dll) ----------
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        // Simpan ke cache jika berhasil (termasuk opaque response untuk font)
        if (response.ok || response.type === 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Jika offline dan tidak ada di cache, jangan lempar error, cukup kosongkan
        return new Response('', { status: 408, statusText: 'Offline' });
      });

      // Kembalikan cache dulu jika ada, sambil update di belakang layar
      return cached || fetchPromise;
    })
  );
});
