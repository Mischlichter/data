const CACHE_NAME = 'site-assets';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                // List of assets to cache during installation (optional)
            ]);
        })
    );
    self.skipWaiting(); // Activate the service worker immediately after installation
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log(`Serving from cache: ${event.request.url}`);
                return cachedResponse;
            }
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                console.log(`Fetching from network and caching: ${event.request.url}`);
                return response;
            }).catch(error => {
                console.error(`Fetch failed for ${event.request.url}:`, error);
            });
        })
    );
});
