const CACHE_NAME = 'site-assets';
const ASSETS_MANIFEST_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/index.json';
const EXTRA_ASSETS_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/pagesi.txt';

// Fetch and cache assets
async function fetchAndCache(url, cache, isJSON = false) {
    try {
        const response = await fetch(url, { mode: 'cors' }); // Ensure CORS is handled
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        const data = isJSON ? await response.json() : response.text();
        const urlsToCache = isJSON ? data.map(asset => asset.url) : data.split('\n').filter(line => line.startsWith('http'));
        await cache.addAll(urlsToCache);
        console.log(`Cached assets from ${url}:`, urlsToCache);
        return urlsToCache;  // Returning URLs for logging
    } catch (error) {
        console.error(`Error fetching or caching from ${url}:`, error);
        throw error;
    }
}

self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all([
                fetchAndCache(ASSETS_MANIFEST_URL, cache, true),
                fetchAndCache(EXTRA_ASSETS_URL, cache)
            ]).then(() => {
                console.log('All assets have been cached');
                self.skipWaiting();  // Forces the waiting Service Worker to become the active Service Worker
            }).catch(error => console.error('Error during installation:', error));
        })
    );
});

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
            return self.clients.claim();  // Claim clients immediately for the activated Service Worker
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log('Serving from cache:', event.request.url);
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
            }).catch(error => {
                console.error('Fetch failed:', error);
                throw error;
            });
        })
    );
});

self.addEventListener('message', event => {
    console.log('Message received from the main script:', event.data);
    if (event.data.action === 'checkStatus') {
        caches.open(CACHE_NAME).then(cache => {
            cache.matchAll().then(responses => {
                const allCached = responses.length > 0 && responses.every(response => response.ok);
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({ type: 'statusUpdate', loaded: allCached });
                    });
                });
                console.log('Cache status sent to the client:', allCached);
            });
        }).catch(error => console.error('Error during cache check:', error));
    }
});
