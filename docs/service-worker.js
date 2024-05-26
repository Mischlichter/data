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

    // Check if the request URL is in the site-assets cache
    if (shouldHandleFetch(event.request)) {
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }
                return fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, networkResponse.clone());
                            console.log('Service Worker: Fetched and cached', event.request.url);
                        });
                    }
                    return networkResponse;
                });
            }).catch(error => {
                console.error('Service Worker: Error during fetch event:', error);
                return caches.match(event.request);
            })
        );
    } else {
        // Skip non site-assets requests
        console.log('Service Worker: Ignoring fetch for', event.request.url);
    }
});

function shouldHandleFetch(request) {
    const url = new URL(request.url);
    // Add any specific logic here to filter requests you want to handle.
    // Example: Only handle requests from a specific domain or path
    return url.hostname === 'raw.githubusercontent.com' && url.pathname.includes('/Mischlichter/data/');
}

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
