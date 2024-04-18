const CACHE_NAME = 'site-assets';
const ASSETS_MANIFEST_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/index.json';
const EXTRA_ASSETS_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/pagesi.txt';

self.addEventListener('install', event => {
    console.log('Service Worker installing.');

    // Perform caching of assets
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache opened successfully.');
            return Promise.all([
                // Fetch and cache assets from JSON manifest
                fetch(ASSETS_MANIFEST_URL)
                    .then(response => response.json())
                    .then(assets => {
                        console.log('Assets from JSON:', assets);
                        const urlsToCache = assets.map(asset => asset.url);
                        console.log('URLs to cache:', urlsToCache);
                        return cache.addAll(urlsToCache);
                    }).catch(error => console.error('Failed to fetch or cache assets from JSON:', error)),
                // Fetch and cache extra assets from TXT file
                fetch(EXTRA_ASSETS_URL)
                    .then(response => response.text())
                    .then(text => {
                        const urls = text.split('\n').filter(line => line.startsWith('http'));
                        console.log('Assets from TXT:', urls);
                        return cache.addAll(urls);
                    }).catch(error => console.error('Failed to fetch or cache assets from TXT:', error))
            ]).then(() => {
                console.log('All assets have been cached');
            });
        }).catch(error => console.error('Failed to open cache:', error))
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');

    // Remove outdated caches
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );

    // Claim clients
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    console.log('Fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log('Cached response found:', cachedResponse);
                return cachedResponse;
            }

            console.log('No cached response found. Fetching from network...');

            return fetch(event.request).then(fetchResponse => {
                console.log('Fetched from network:', fetchResponse);
                if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                    return fetchResponse;
                }

                const responseToCache = fetchResponse.clone();

                caches.open(CACHE_NAME).then(cache => {
                    console.log('Caching response:', responseToCache);
                    cache.put(event.request, responseToCache);
                });

                return fetchResponse;
            }).catch(error => {
                console.error(`Failed to fetch ${event.request.url}:`, error);
                throw error;
            });
        }).catch(error => console.error(`Error fetching ${event.request.url}:`, error))
    );
});

self.addEventListener('message', event => {
    console.log('Message received:', event.data);
    if (event.data.action === 'preloadAssets') {
        console.log('Preloading assets...');
        // Simulate preloading by waiting for 3 seconds
        setTimeout(() => {
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({ type: 'statusUpdate', loaded: true });
                });
            });
        }, 3000);
    }
});

