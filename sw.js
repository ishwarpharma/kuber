/* ============================================================
   Kuber by Ishwar Pharma — Service Worker

   ██████████████████████████████████████████████████████
   HOW TO PUSH AN UPDATE TO ALL USERS:
   1. Update index.html on GitHub
   2. Change APP_VERSION below from 'v1' to 'v2'
      (or v3, v4 etc — just increment each time)
   3. Commit sw.js to GitHub
   → All users get the new app automatically on next open.
      Their PIN stays saved. They see nothing. It just works.
   ██████████████████████████████████████████████████████

   Cache strategy:
   - index.html       → Network First (always fresh, cache as fallback)
   - CSV + users.json → Network First (fresh data daily, cache offline)
   - Google Fonts     → Cache First  (rarely changes)
   ============================================================ */

const APP_VERSION  = 'v1';                          // ← change this to force update
const SHELL_CACHE  = 'kuber-shell-' + APP_VERSION;
const DATA_CACHE   = 'kuber-data-'  + APP_VERSION;
const KNOWN_CACHES = [SHELL_CACHE, DATA_CACHE];

/* ── INSTALL: cache the app shell immediately ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll([
        './index.html',
        './'
      ]).catch(() => {}))          // ignore failures (e.g. offline at install time)
      .then(() => self.skipWaiting())   // activate immediately, don't wait for old SW to die
  );
});

/* ── ACTIVATE: delete ALL old caches from previous versions ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => !KNOWN_CACHES.includes(k))  // delete anything not in current version
          .map(k => {
            console.log('[Kuber SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())   // take control of all open tabs immediately
      .then(() => {
        /* Tell all open tabs: reload to get new version */
        return self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      })
      .then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
      })
  );
});

/* ── FETCH: route each request to the right strategy ── */
self.addEventListener('fetch', e => {
  const url = e.request.url;

  /* Skip non-GET and browser-extension requests */
  if (e.request.method !== 'GET') return;
  if (!url.startsWith('http')) return;

  /* CSV data files + users.json + salesmap → Network First */
  if (isDataFile(url)) {
    e.respondWith(networkFirst(e.request, DATA_CACHE));
    return;
  }

  /* Google Fonts → Cache First (they never change) */
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    e.respondWith(cacheFirst(e.request, SHELL_CACHE));
    return;
  }

  /* index.html and navigation → Network First
     This is the key change: always try to get fresh index.html from GitHub.
     Only fall back to cache if offline. */
  if (url.includes('index.html') || e.request.mode === 'navigate') {
    e.respondWith(networkFirst(e.request, SHELL_CACHE));
    return;
  }

  /* Everything else → Network First with cache fallback */
  e.respondWith(networkFirst(e.request, SHELL_CACHE));
});

/* ══════════════════════════════════════════════════════
   STRATEGY HELPERS
   ══════════════════════════════════════════════════════ */

/* Network First: try network → update cache → return response.
   If network fails → serve from cache.
   If nothing in cache → return offline error. */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) {
      notifyOffline();
      return cached;
    }
    /* Last resort — empty offline page */
    return new Response(
      '<html><body style="font-family:sans-serif;text-align:center;padding:60px">' +
      '<h2>📶 You are offline</h2>' +
      '<p>Please connect to the internet and reopen Kuber.</p>' +
      '</body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/* Cache First: serve from cache if available, otherwise fetch and cache. */
async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) cache.put(request, response.clone());
    return response;
  } catch (err) {
    return new Response('Offline', { status: 503 });
  }
}

/* Data file check */
function isDataFile(url) {
  return url.includes('partymst.csv')
      || url.includes('ledgersummary.csv')
      || url.includes('outstanding.csv')
      || url.includes('salesmap.csv')
      || url.includes('users.json');
}

/* Notify open tabs that we're serving offline/cached data */
function notifyOffline() {
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    clients.forEach(c => c.postMessage({ type: 'OFFLINE_MODE' }));
  });
}
