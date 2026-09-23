const CACHE_NAME = "vtaskbase-v3";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./Valtivor Logo.png",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


// INSTALL

self.addEventListener(
    "install",
    function (event) {

        event.waitUntil(

            caches.open(CACHE_NAME)
                .then(function (cache) {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                })

        );

    }
);


// ACTIVATE

self.addEventListener(
    "activate",
    function (event) {

        event.waitUntil(

            caches.keys()
                .then(function (cacheNames) {

                    return Promise.all(

                        cacheNames
                            .filter(function (cacheName) {

                                return cacheName !==
                                    CACHE_NAME;

                            })
                            .map(function (cacheName) {

                                return caches.delete(
                                    cacheName
                                );

                            })

                    );

                })

        );

    }
);


// FETCH

self.addEventListener(
    "fetch",
    function (event) {

        event.respondWith(

            caches.match(event.request)
                .then(function (response) {

                    if (response) {
                        return response;
                    }

                    return fetch(
                        event.request
                    );

                })

        );

    }
);
