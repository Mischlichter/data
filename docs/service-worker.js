const CACHE_NAME = 'site-assets';
const DB_NAME = 'MyDatabase';
const STORE_NAME = 'assets';

// On install, cache the files from IndexedDB
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            const db = await openDB();
            if (!db) return;

            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const allAssets = await store.getAll();

            const urlsToCache = allAssets.map(asset => asset.url);
            await cache.addAll(urlsToCache);
        })
    );
});

// Fetch from cache first, then network fallback
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

async function openDB() {
    if (!('indexedDB' in self)) return null;

    return idb.openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'url' });
            }
        }
    });
}
