const CACHE_NAME = 'dynamic-assets-cache-v1';
const INDEX_JSON_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/index.json';

// Pre-cache the index.json and assets listed within it
self.addEventListener('install', event => {
    event.waitUntil(
        fetchAndCacheAssets()
    );
});

// Fetch and cache assets listed in index.json
function fetchAndCacheAssets() {
    return caches.open(CACHE_NAME).then(cache => {
        return fetch(INDEX_JSON_URL)
            .then(response => response.json())
            .then(assets => {
                // Assume 'assets' is an array of URLs
                const urlsToCache = assets.map(asset => asset.url);
                return cache.addAll(urlsToCache);
            })
            .catch(error => console.error('Error fetching assets: ', error));
    });
}

// Intercept fetch requests and serve cached assets if available
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        })
    );
});

// Optional: Handle updates to assets based on index.json
self.addEventListener('activate', event => {
    event.waitUntil(
        fetchAndCacheAssets() // Re-fetch and cache assets upon activation
    );
});
