const CACHE_NAME = 'site-assets';
const ASSETS_MANIFEST_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/index.json';
const EXTRA_ASSETS_URL = 'https://raw.githubusercontent.com/Mischlichter/data/main/pagesi.txt';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all([
                fetch(ASSETS_MANIFEST_URL)
                    .then(response => response.json())
                    .then(assets => cache.addAll(assets.map(asset => asset.url))),
                fetch(EXTRA_ASSETS_URL)
                    .then(response => response.text())
                    .then(text => {
                        const urls = text.split('\n').filter(line => line.startsWith('http'));
                        return cache.addAll(urls);
                    })
            ]).then(() => self.skipWaiting());
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});

self.addEventListener('message', event => {
    if (event.data.action === 'checkStatus') {
        event.source.postMessage({type: 'statusUpdate', loaded: true});
    }
});
