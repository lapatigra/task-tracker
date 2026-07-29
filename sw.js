const CACHE = 'tigra-v3';

const PRECACHE = [
    '/',
    '/index.html',
    '/icon-192.png',
    '/icon-512.png',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
];

// Firebase API — только сеть, никогда не кэшируем
function isFirebaseAPI(url) {
    return url.includes('firebaseio.com') ||
           url.includes('identitytoolkit.googleapis.com') ||
           url.includes('securetoken.googleapis.com') ||
           url.includes('firebaseapp.com/__/auth');
}

// Firebase SDK скрипты (gstatic) — кэш-first
function isFirebaseSDK(url) {
    return url.includes('gstatic.com/firebasejs');
}

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(PRECACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    const url = e.request.url;

    // Firebase API — пропускаем напрямую, не трогаем
    if (isFirebaseAPI(url)) return;

    // Firebase SDK — cache-first (скрипты не меняются для фиксированной версии)
    if (isFirebaseSDK(url)) {
        e.respondWith(
            caches.match(e.request).then(cached => {
                if (cached) return cached;
                return fetch(e.request).then(res => {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                    return res;
                });
            })
        );
        return;
    }

    // Всё остальное (свой origin) — network-first, fallback cache
    if (!url.startsWith(self.location.origin)) return;

    e.respondWith(
        fetch(e.request)
            .then(res => {
                const clone = res.clone();
                caches.open(CACHE).then(c => c.put(e.request, clone));
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});
