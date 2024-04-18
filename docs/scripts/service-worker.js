const CACHE_NAME = 'site-assets';
const ASSETS_MANIFEST_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/index.json';
const EXTRA_ASSETS_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/pagesi.txt';

async function fetchAndCacheAssets(cache) {
    try {
        const jsonResponse = await fetch(ASSETS_MANIFEST_URL, { mode: 'cors' });
        const assets = await jsonResponse.json();
        const assetUrls = assets.map(asset => asset.url);

        const txtResponse = await fetch(EXTRA_ASSETS_URL, { mode: 'cors' });
        const text = await txtResponse.text();
        const extraUrls = text.split('\n').filter(line => line.startsWith('http'));

        const urlsToCache = [...assetUrls, ...extraUrls];
        await cache.addAll(urlsToCache);
        console.log('Assets have been successfully fetched and cached:', urlsToCache);
    } catch (error) {
        console.error('Error during asset fetching and caching:', error);
    }
}

self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return fetchAndCacheAssets(cache);
        }).then(() => {
            console.log('Assets cached during install.');
            self.skipWaiting();
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                          .map(cacheName => {
                              console.log('Deleting cache:', cacheName);
                              return caches.delete(cacheName);
                          })
            );
        }).then(() => {
            console.log('Old caches cleared.');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('Fetch event for:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log('Found ', event.request.url, ' in cache');
                return cachedResponse;
            }
            console.log('Network request for ', event.request.url);
            return fetch(event.request).then(response => {
                if (!response.ok) {
                    console.log('Fetch error:', response.statusText);
                    throw Error(response.statusText);
                }
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request.url, response.clone());
                    console.log('Fetched and cached', event.request.url);
                    return response;
                });
            });
        }).catch(error => console.error('Error in fetch handler:', error))
    );
});

self.addEventListener('message', event => {
    console.log('Received message in Service Worker:', event.data);
    if (event.data.action === 'checkStatus') {
        console.log('Checking cache status...');
        caches.open(CACHE_NAME).then(cache => {
            cache.matchAll().then(responses => {
                const allCached = responses.every(response => response.ok);
                console.log('Cache status: ', allCached ? 'All assets cached.' : 'Some assets not cached.');
                event.source.postMessage({ type: 'statusUpdate', loaded: allCached });
            });
        });
    }
});
