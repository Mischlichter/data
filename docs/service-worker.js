importScripts('https://www.hogeai.com/scripts/index-min.js');

const CACHE_NAME = 'site-assets';
const DB_NAME = 'MyDatabase';
const ASSETS_STORE_NAME = 'assets';
const IMAGES_STORE_NAME = 'imageData';

console.log('Service Worker: Registered');

self.addEventListener('install', event => {
    console.log('Service Worker: Install event');
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            const db = await openDB();
            if (!db) return;

            const tx = db.transaction(ASSETS_STORE_NAME, 'readonly');
            const store = tx.objectStore(ASSETS_STORE_NAME);
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
        caches.match(event.request).then(async response => {
            if (response) {
                console.log('Service Worker: Serving from cache', event.request.url);
                return response;
            }
            
            try {
                const networkResponse = await fetch(event.request);
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, networkResponse.clone());
                    console.log('Service Worker: Fetched and cached', event.request.url);
                }
                return networkResponse;
            } catch (error) {
                console.error('Service Worker: Error during fetch event:', error);
                return caches.match(event.request);
            }
        })
    );
});

async function openDB() {
    if (!('indexedDB' in self)) return null;
    console.log('Service Worker: Opening IndexedDB');

    try {
        const db = await idb.openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(ASSETS_STORE_NAME)) {
                    db.createObjectStore(ASSETS_STORE_NAME, { keyPath: 'url' });
                }
                if (!db.objectStoreNames.contains(IMAGES_STORE_NAME)) {
                    db.createObjectStore(IMAGES_STORE_NAME, { keyPath: 'filename' });
                }
            }
        });
        console.log('Service Worker: IndexedDB opened');
        return db;
    } catch (error) {
        console.error('Service Worker: Error opening IndexedDB:', error);
    }
}
