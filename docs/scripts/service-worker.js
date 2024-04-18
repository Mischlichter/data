const CACHE_NAME = 'site-assets';
const ASSETS_MANIFEST_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/index.json';
const EXTRA_ASSETS_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/pagesi.txt';

self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all([
                fetch(ASSETS_MANIFEST_URL)
                    .then(response => response.json())
                    .then(assets => {
                        console.log('Assets from JSON:', assets);
                        const urlsToCache = assets.map(asset => asset.url);
                        return cache.addAll(urlsToCache);
                    }),
                fetch(EXTRA_ASSETS_URL)
                    .then(response => response.text())
                    .then(text => {
                        const urls = text.split('\n').filter(line => line.startsWith('http'));
                        console.log('Assets from TXT:', urls);
                        return cache.addAll(urls);
                    })
            ]).then(() => {
                console.log('All assets have been cached');
                self.skipWaiting();
            });
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    console.log('Fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});

self.addEventListener('message', event => {
    console.log('Message received:', event.data);
    if (event.data.action === 'checkStatus') {
        event.source.postMessage({type: 'statusUpdate', loaded: true});
    }
});
