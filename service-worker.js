const CACHE_NAME = "vtaskbase-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./Valtivor Logo.png",
    "./manifest.json"
];

self.addEventListener("install", function(event) {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(FILES_TO_CACHE);
            })
    );

});

self.addEventListener("activate", function(event) {

    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {

                return Promise.all(
                    cacheNames
                        .filter(function(cacheName) {
                            return cacheName !== CACHE_NAME;
                        })
                        .map(function(cacheName) {
                            return caches.delete(cacheName);
                        })
                );

            })
    );

});

self.addEventListener("fetch", function(event) {

    event.respondWith(
        caches.match(event.request)
            .then(function(response) {

                if (response) {
                    return response;
                }

                return fetch(event.request);

            })
    );

});