const CACHE_NAME = 'site-assets';

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
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
            console.error('[Service Worker] Error during cache delete:', error);
        })
    );
    self.clients.claim(); // Take control of all clients immediately
});

async function getFromIndexedDB(url) {
    try {
        const db = await idb.openDB('MyDatabase', 1);
        const tx = db.transaction('assets', 'readonly');
        const store = tx.objectStore('assets');
        const asset = await store.get(url);
        if (asset) {
            console.log(`[Service Worker] Serving from IndexedDB: ${url}`);
            return new Response(asset.blob);
        }
    } catch (error) {
        console.error(`[Service Worker] Error retrieving from IndexedDB: ${url}`, error);
    }
    return null;
}

self.addEventListener('fetch', event => {
    console.log(`[Service Worker] Fetching: ${event.request.url}`);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
                return cachedResponse;
            }
            return getFromIndexedDB(event.request.url).then(idbResponse => {
                if (idbResponse) {
                    return idbResponse;
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
                });
            });
        }).catch(error => {
            console.error(`[Service Worker] Cache match failed for: ${event.request.url}`, error);
        })
    );
});
