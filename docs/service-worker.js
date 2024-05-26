const CACHE_NAME = 'site-assets';

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Caching initial assets...');
            return cache.addAll([
                // List of assets to cache during installation (optional)
            ]);
        })
    );
    self.skipWaiting(); // Activate the service worker immediately after installation
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control of all clients immediately
});

self.addEventListener('fetch', event => {
    console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
                return cachedResponse;
            }
            console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    console.log(`[Service Worker] Network request failed for: ${event.request.url}`);
                    return response;
                }
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(error => {
                console.error(`[Service Worker] Fetch failed for: ${event.request.url}, Error: ${error}`);
            });
        })
    );
});
