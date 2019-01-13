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
				'/siteswap.js',
				'/images/cube.svg',
				'/images/mr_meeseeks_proud2.png',
				'/images/mr_meeseeks_shocked_small.png',
				'/images/icon-192x192.png',
				'/images/icon-512x192.png',
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

// Network falling back to cache
self.addEventListener('fetch', function(event) {
	console.log('fetch', event.request.url);
	event.respondWith(
		caches.open(cacheName).then(function(cache) {
			return fetch(event.request).then(function(networkResponse) {
				console.log('net worked, saving to cache', event.request.url, networkResponse);
				if (event.request.url.match(/^http/))
					cache.put(event.request, networkResponse.clone());
				return networkResponse;
			}).catch(function(c) {
				console.log('net fail, from cache', event.request.url, c);
				return cache.match(event.request);
			})
		})
	);
});
