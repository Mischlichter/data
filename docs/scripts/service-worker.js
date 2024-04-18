// Service Worker script

const CACHE_NAME = 'site-assets';
const ASSETS_MANIFEST_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/index.json';
const EXTRA_ASSETS_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/pagesi.txt';

// Installing and caching assets
self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache opened successfully.');
            return Promise.all([
                fetch(ASSETS_MANIFEST_URL)
                    .then(response => response.json())
                    .then(assets => {
                        console.log('Assets from JSON:', assets);
                        const urlsToCache = assets.map(asset => asset.url);
                        console.log('URLs to cache:', urlsToCache);
                        return cache.addAll(urlsToCache);
                    }).catch(error => console.error('Failed to fetch or cache assets from JSON:', error)),
                fetch(EXTRA_ASSETS_URL)
                    .then(response => response.text())
                    .then(text => {
                        const urls = text.split('\n').filter(line => line.startsWith('http'));
                        console.log('Assets from TXT:', urls);
                        return cache.addAll(urls);
                    }).catch(error => console.error('Failed to fetch or cache assets from TXT:', error))
            ]).then(() => {
                console.log('All assets have been cached');
                self.skipWaiting(); // Force activation of new SW
            });
        }).catch(error => console.error('Failed to open cache:', error))
    );
});

// Activate and claim clients immediately
self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    event.waitUntil(clients.claim());
});

// Intercept fetch requests and serve cached assets if available
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

// Handle messages from the client and send back status updates
self.addEventListener('message', event => {
    console.log('Message received:', event.data);
    if (event.data.action === 'checkStatus') {
        // Checking if all required assets are cached
        caches.open(CACHE_NAME).then(cache => {
            cache.matchAll().then(responses => {
                const allCached = responses.length > 0 && responses.every(response => response.ok);
                event.source.postMessage({type: 'statusUpdate', loaded: allCached});
                console.log('Status update sent, all assets loaded:', allCached);
            });
        }).catch(error => console.error('Error checking cached assets:', error));
    }
});
