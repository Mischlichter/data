const CACHE_NAME = 'site-assets';
const ASSETS_MANIFEST_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/index.json';
const EXTRA_ASSETS_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/pagesi.txt';

// Helper function to parse JSON and text assets
async function fetchAndCache(url, cache, isJSON = false) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    const data = isJSON ? await response.json() : await response.text();
    const urls = isJSON ? data.map(asset => asset.url) : data.split('\n').filter(line => line.startsWith('http'));
    await cache.addAll(urls);
    return urls;  // Returning URLs for logging
}

// Install event - handle caching
self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all([
                fetchAndCache(ASSETS_MANIFEST_URL, cache, true),
                fetchAndCache(EXTRA_ASSETS_URL, cache)
            ]).then(() => {
                console.log('All assets have been cached');
                self.skipWaiting();
            }).catch(error => console.error('Error during fetch and cache:', error));
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                          .map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            console.log('Old caches cleaned.');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then(fetchResponse => {
                if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                    return fetchResponse;
                }
                const responseToCache = fetchResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return fetchResponse;
            });
        })
    );
});

// Handle messages from the client
self.addEventListener('message', event => {
    if (event.data.action === 'checkStatus') {
        console.log('Checking cache status...');
        caches.open(CACHE_NAME).then(cache => {
            cache.matchAll().then(responses => {
                const allCached = responses.length > 0 && responses.every(response => response.ok);
                event.source.postMessage({type: 'statusUpdate', loaded: allCached});
            });
        });
    }
});
