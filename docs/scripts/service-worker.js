const CACHE_NAME = 'site-assets';
const ASSETS_MANIFEST_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/index.json';
const EXTRA_ASSETS_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/pagesi.txt';

async function fetchAndCacheAssets(cache) {
    try {
        const responses = await Promise.all([
            fetch(ASSETS_MANIFEST_URL, { mode: 'cors' }).then(response => response.json()),
            fetch(EXTRA_ASSETS_URL, { mode: 'cors' }).then(response => response.text())
        ]);

        const assetUrls = responses[0].map(asset => asset.url);
        const extraUrls = responses[1].split('\n').filter(line => line.startsWith('http'));

        await cache.addAll([...assetUrls, ...extraUrls]);
        console.log('Assets have been successfully fetched and cached:', [...assetUrls, ...extraUrls]);
    } catch (error) {
        console.error('Error during asset fetching and caching:', error);
    }
}

self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache opened for initial asset fetching.');
            return fetchAndCacheAssets(cache);
        }).then(() => {
            console.log('Initial asset caching complete.');
            self.skipWaiting();  // Force activation of new SW
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache opened for activation asset fetching.');
            return fetchAndCacheAssets(cache);
        }).then(() => {
            console.log('Activation asset caching complete.');
            return clients.claim();  // Claim clients immediately
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('Fetching from Service Worker:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request).then(fetchResponse => {
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

self.addEventListener('message', event => {
    console.log('Message received in Service Worker:', event.data);
    if (event.data.action === 'checkStatus') {
        caches.open(CACHE_NAME).then(cache => {
            cache.matchAll().then(responses => {
                const allCached = responses.length > 0 && responses.every(response => response.ok);
                console.log('Cache status checked:', allCached);
                event.source.postMessage({ type: 'statusUpdate', loaded: allCached });
            });
        });
    }
});
