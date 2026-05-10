self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open('collectpro-v1').then(cache =>
      cache.match(event.request).then(response =>
        response ||
        fetch(event.request).then(fetchRes => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        })
      )
    )
  );
});
