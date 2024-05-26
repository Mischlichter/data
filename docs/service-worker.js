importScripts('https://cdn.jsdelivr.net/npm/idb@7.0.0/build/umd.js');

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
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            });
        }).catch(error => {
            console.error('Service Worker: Error during fetch event:', error);
            return caches.match(event.request);
        })
    );
});

async function openDB() {
    if (!('indexedDB' in self)) return null;
    console.log('Service Worker: Opening IndexedDB');

    return idb.openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'url' });
            }
        }
    }).then(db => {
        console.log('Service Worker: IndexedDB opened');
        return db;
    }).catch(error => {
        console.error('Service Worker: Error opening IndexedDB:', error);
    });
}
