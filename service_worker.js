importScripts('/cache-polyfill.js');

var cacheName = 'passist-v1';;

self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll([
				'/',
				'/styles.css',
				'/bootstrap.min.css',
				'/vue.js',
				'/passist.js',
				'/images/cube.svg',
				'/images/icon192.png',
				'/images/icon512.png',
				'/favicon.ico',
				'/manifest.json',
			]);
		})
	);
});

// delete old caches on activate
this.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if (key != cacheName) {
					return caches.delete(key);
				}
			}));
		})
	);
});

// https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#stale-while-revalidate
self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.open(cacheName).then(function(cache) {
			return cache.match(event.request).then(function(response) {
				var fetchPromise = fetch(event.request).then(function(networkResponse) {
					if (event.request.url.match(/^http/))
						cache.put(event.request, networkResponse.clone());
					return networkResponse;
				});
				return response || fetchPromise;
			})
		})
	);
});
