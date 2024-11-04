const CACHE_NAME = 'music-player-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/music_links.json',
    '/path/to/your/audio/files'
];

// Cài đặt cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Xử lý yêu cầu mạng
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// Xóa cache cũ
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Xử lý Background Sync
self.addEventListener('sync', event => {
    if (event.tag === 'syncNewSongs') {
        event.waitUntil(syncNewSongs());
    }
});

// Hàm đồng bộ hóa bài hát mới
async function syncNewSongs() {
    const response = await fetch('/music_links.json');
    const newSongs = await response.json();

    console.log('Đã đồng bộ hóa bài hát mới:', newSongs);
}
