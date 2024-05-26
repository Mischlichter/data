importScripts('/scripts/index-min.js');


// Ensure that idb is available in the service worker scope
const idb = self.idb;

async function getFromIndexedDB(request) {
    try {
        const db = await idb.openDB('MyDatabase', 1);
        const tx = db.transaction('assets', 'readonly');
        const store = tx.objectStore('assets');
        const cachedAsset = await store.get(request.url);

        if (cachedAsset) {
            return new Response(cachedAsset.blob);
        }
        return null;
    } catch (error) {
        console.error('Error retrieving from IndexedDB:', request.url, error);
        return null;
    }
}

self.addEventListener('fetch', (event) => {
    event.respondWith((async () => {
        try {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                console.log('[Service Worker] Serving from cache:', event.request.url);
                return cachedResponse;
            }

            const idbResponse = await getFromIndexedDB(event.request);
            if (idbResponse) {
                console.log('[Service Worker] Serving from IndexedDB:', event.request.url);
                return idbResponse;
            }

            console.log('[Service Worker] Fetching from network:', event.request.url);
            const networkResponse = await fetch(event.request);

            if (networkResponse && networkResponse.status === 200) {
                const cloneResponse = networkResponse.clone();
                const cache = await caches.open('site-assets');
                cache.put(event.request, cloneResponse);
                return networkResponse;
            }
        } catch (error) {
            console.error('[Service Worker] Fetch error:', error);
        }
    })());
});
