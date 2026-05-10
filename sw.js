/* ============================================================
   Kuber by Ishwar Pharma — Service Worker
   Strategy:
   - App shell (HTML, fonts) → Cache First (fast load)
   - CSV data files         → Network First, fallback to cache
                              (so fresh data is always preferred,
                               but old data works offline)
   - users.json             → Network First, fallback to cache
   ============================================================ */

const SHELL_CACHE = 'kuber-shell-v1';
const DATA_CACHE  = 'kuber-data-v1';

/* Files that form the app shell — cached on install */
const SHELL_FILES = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap'
];

/* ── INSTALL: pre-cache the app shell ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      return cache.addAll(SHELL_FILES).catch(() => {
        /* Font URL may fail in some environments — ignore silently */
      });
    }).then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: clean up old caches ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== SHELL_CACHE && k !== DATA_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH: route requests to the right strategy ── */
self.addEventListener('fetch', e => {
  const url = e.request.url;

  /* CSV files and users.json → Network First, fallback to cache */
  if (isDataFile(url)) {
    e.respondWith(networkFirstData(e.request));
    return;
  }

  /* Google Fonts → Cache First (they change rarely) */
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    e.respondWith(cacheFirstShell(e.request));
    return;
  }

  /* App shell (index.html) → Cache First, update in background */
  if (url.includes('index.html') || e.request.mode === 'navigate') {
    e.respondWith(cacheFirstWithRefresh(e.request));
    return;
  }

  /* Everything else → network with cache fallback */
  e.respondWith(networkFirstData(e.request));
});

/* ── Helpers ── */

function isDataFile(url) {
  return url.includes('partymst.csv')
      || url.includes('ledgersummary.csv')
      || url.includes('outstanding.csv')
      || url.includes('users.json');
}

/* Network First → on success update cache; on failure serve cache */
async function networkFirstData(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      /* Clone before consuming — responses are single-use */
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) {
      /* Notify the page that we're serving offline data */
      notifyOffline();
      return cached;
    }
    /* Nothing in cache either — return a meaningful error response */
    return new Response(
      JSON.stringify({ error: 'offline', message: 'No cached data available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/* Cache First → fast load; if not cached, fetch and store */
async function cacheFirstShell(request) {
  const cache  = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) cache.put(request, response.clone());
    return response;
  } catch (err) {
    return new Response('Offline — no cached resource', { status: 503 });
  }
}

/* Cache First + background refresh for app shell HTML */
async function cacheFirstWithRefresh(request) {
  const cache  = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);

  /* Kick off a background fetch to keep cache fresh */
  const networkFetch = fetch(request).then(response => {
    if (response && response.status === 200) cache.put(request, response.clone());
    return response;
  }).catch(() => {});

  return cached || networkFetch;
}

/* Post a message to all open tabs so the app can show an offline banner */
function notifyOffline() {
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    clients.forEach(c => c.postMessage({ type: 'OFFLINE_MODE' }));
  });
}
