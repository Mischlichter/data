importScripts('https://www.hogeai.com/scripts/index-min.js');

const CACHE_NAME = 'site-assets';
const DB_NAME = 'MyDatabase';
const STORE_NAME = 'assets';

console.log('Service Worker: Registered');

self.addEventListener('install', event => {
    console.log('Service Worker: Install event');
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            const db = await openDB();
            if (!db) return;

            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const allAssets = await store.getAll();

            const urlsToCache = allAssets.map(asset => asset.url);
            await cache.addAll(urlsToCache);
            console.log('Service Worker: Cached all assets');
        }).catch(error => {
            console.error('Service Worker: Error during install event:', error);
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('Service Worker: Fetch event for', event.request.url);

    event.respondWith(
        caches.open(CACHE_NAME).then(async cache => {
            const db = await openDB();
            if (!db) return fetch(event.request); // If DB can't be opened, fetch normally

            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const asset = await store.get(event.request.url);

            if (asset) {
                return cache.match(event.request).then(response => {
                    if (response) {
                        console.log('Service Worker: Serving from cache', event.request.url);
                        return response;
                    }
                    return fetch(event.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            cache.put(event.request, networkResponse.clone());
                            console.log('Service Worker: Fetched and cached', event.request.url);
                        }
                        return networkResponse;
                    });
                });
            } else {
                console.log('Service Worker: URL not in IndexedDB, ignoring', event.request.url);
                return fetch(event.request); // Ignore requests not in IndexedDB
            }
        }).catch(error => {
            console.error('Service Worker: Error during fetch event:', error);
            return fetch(event.request);
        })
    );
});

async function openDB() {
    if (!('indexedDB' in self)) return null;
    console.log('Service Worker: Opening IndexedDB');

    try {
        const db = await idb.openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'url' });
                }
                if (!db.objectStoreNames.contains('imageData')) {
                    db.createObjectStore('imageData', { keyPath: 'filename' });
                }
            }
        });
        console.log('Service Worker: IndexedDB opened');
        return db;
    } catch (error) {
        console.error('Service Worker: Error opening IndexedDB:', error);
    }
}
