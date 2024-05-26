importScripts('https://www.hogeai.com/scripts/index-min.js');

const CACHE_NAME = 'site-assets';
const DB_NAME = 'MyDatabase';
const STORE_NAME = 'assets';

console.log('Service Worker: Registered');

let cachedAssets = new Set();

// Function to load IndexedDB entries into memory
async function loadCachedAssets() {
    console.log('Service Worker: Loading assets into memory');
    const db = await openDB();
    if (!db) return;

    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const allAssets = await store.getAll();

    allAssets.forEach(asset => cachedAssets.add(asset.url));
    console.log('Service Worker: Loaded assets into memory', cachedAssets);
}

// Open IndexedDB and return the database instance
async function openDB() {
    if (!('indexedDB' in self)) return null;
    console.log('Service Worker: Opening IndexedDB');

    try {
        const db = await idb.openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'url' });
                }
            }
        });
        console.log('Service Worker: IndexedDB opened');
        return db;
    } catch (error) {
        console.error('Service Worker: Error opening IndexedDB:', error);
    }
}

// Install event: load assets into memory and cache them
self.addEventListener('install', event => {
    console.log('Service Worker: Install event');
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            await loadCachedAssets(); // Load assets into memory

            const urlsToCache = Array.from(cachedAssets);
            await cache.addAll(urlsToCache);
            console.log('Service Worker: Cached all assets');
        }).catch(error => {
            console.error('Service Worker: Error during install event:', error);
        })
    );
});

// Activate event: ensure assets are loaded into memory
self.addEventListener('activate', event => {
    console.log('Service Worker: Activate event');
    event.waitUntil(loadCachedAssets());
});

// Fetch event: respond with cached assets or ignore if not in cachedAssets
self.addEventListener('fetch', event => {
    console.log('Service Worker: Fetch event for', event.request.url);

    if (!cachedAssets.has(event.request.url)) {
        console.log('Service Worker: URL not in cachedAssets, ignoring', event.request.url);
        return;
    }

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
            return fetch(event.request);
        })
    );
});
