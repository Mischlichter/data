const CACHE_NAME = 'site-assets';

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Caching initial assets...');
            return cache.addAll([
                // List of assets to cache during installation (optional)
            ]);
        }).catch(error => {
            console.error('[Service Worker] Error during install cache open:', error);
        })
    );
    self.skipWaiting(); // Activate the service worker immediately after installation
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
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
        }).catch(error => {
            console.error('[Service Worker] Error during activate cache delete:', error);
        })
    );
    self.clients.claim(); // Take control of all clients immediately
});

self.addEventListener('fetch', event => {
    console.log(`[Service Worker] Fetching: ${event.request.url}`);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
                return cachedResponse;
            }
            console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    console.log(`[Service Worker] Network request failed or non-basic request for: ${event.request.url}`);
                    return response;
                }
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
                    cache.put(event.request, responseClone).catch(error => {
                        console.error(`[Service Worker] Error during cache put: ${event.request.url}`, error);
                    });
                });
                return response;
            }).catch(error => {
                console.error(`[Service Worker] Fetch failed for: ${event.request.url}`, error);
                // Optionally, provide a fallback response here
            });
        }).catch(error => {
            console.error(`[Service Worker] Cache match failed for: ${event.request.url}`, error);
            // Optionally, provide a fallback response here
        })
    );
});
