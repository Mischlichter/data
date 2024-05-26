const CACHE_NAME = 'site-assets';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                // List of assets to cache during installation (optional)
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then(response => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});
