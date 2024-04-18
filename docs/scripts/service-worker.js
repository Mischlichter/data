const CACHE_NAME = 'site-assets-v1';
const ASSETS_MANIFEST_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/index.json';
const EXTRA_ASSETS_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/assets/pagesi.txt';

// Install event - cache files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll([
                ASSETS_MANIFEST_URL,
                EXTRA_ASSETS_URL
            ])
            .then(() => fetch(ASSETS_MANIFEST_URL))
            .then(response => response.json())
            .then(assets => {
                const urlsToCache = assets.map(asset => asset.url);
                return cache.addAll(urlsToCache);
            })
            .then(() => fetch(EXTRA_ASSETS_URL))
            .then(response => response.text())
            .then(text => {
                const urls = text.split('\n').filter(line => line.trim());
                return cache.addAll(urls);
            })
            .then(() => self.skipWaiting()); // Activate SW immediately
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                .map(cacheName => caches.delete(cacheName))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event to serve cached content
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(cachedResponse => {
            return cachedResponse || fetch(event.request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        })
    );
});
self.addEventListener('message', event => {
    if (event.data.action === 'checkProgress') {
        caches.open(CACHE_NAME).then(cache => {
            // Assuming you have a way to determine the total number of assets
            cache.keys().then(keys => {
                const totalAssets = 100; // You should determine this dynamically if possible
                const cachedAssets = keys.length;
                const percentage = Math.round((cachedAssets / totalAssets) * 100);
                event.source.postMessage({ type: 'progress', cached: cachedAssets, total: totalAssets, percentage: percentage });
            });
        });
    }
});
