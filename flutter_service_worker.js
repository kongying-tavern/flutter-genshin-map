'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "splash.jpg": "d1aaf0242190e76b80289f2758416533",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e",
"index.html": "b1a35d76ae88c15e20a3e5d88cd46f47",
"/": "b1a35d76ae88c15e20a3e5d88cd46f47",
"main.dart.js": "9852fc5bed142a92675ce8fa3421fe8b",
"icons/Icon-512.png": "1ad08400902ba7f510a17c839f4a430c",
"icons/Icon-192.png": "a93fd8a7ae1bebe8d1161726254b0592",
"manifest.json": "ee5d2780921222131230a23dcdd397a1",
"flutter.js": "a85fcf6324d3c4d3ae3be1ae4931e9c5",
"favicon.png": "a93fd8a7ae1bebe8d1161726254b0592",
"version.json": "5dad0b63cf00cea7aa6c76903478e2e8",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/images/switch-on.png": "66803d9c15a0a5b68b89ddcd2c0d0791",
"assets/images/active-point.png": "acdc835fc91173bbf4e07389332c657a",
"assets/images/mondstadt.png": "dc034c8f7e1738fc4fde9a3656719e80",
"assets/images/liyue-active.png": "4ddb860deac444c92b09b44ea642f87b",
"assets/images/mondstadt-white.png": "6b5763eef1b39a4b64f4bc2cbde8f4e5",
"assets/images/drawer-bg-bottom.png": "ed1bb49eff3de755e7bee8a3cef9516d",
"assets/images/drawer-button.png": "e1fdfdc88bca5be0766ddd09e6ae74cb",
"assets/images/inazuma.png": "a9a20c9e7363acc1ba9b212d5c23153b",
"assets/images/inazuma-active.png": "f9de00dc393462e778e150c65ea896fe",
"assets/images/sumeru-active.png": "2b4bc11b9af218484ef64dc028f8ee1a",
"assets/images/icon-compass.png": "e43c1cd692bf4f84137f45cfb989ca72",
"assets/images/icon-non-ground.png": "79638681fc6e5900cba94dba48bd8628",
"assets/images/liyue-white.png": "5232eff05e99539420424209048d5dfc",
"assets/images/drawer-bg-top.png": "5cbe5fbb73d93eb021c6e6ca771a2ce6",
"assets/images/inazuma-white.png": "5d8648d8d2874029085e2a2b59a95abd",
"assets/images/liyue.png": "c61479875b0c02f73376153ce6ad54f2",
"assets/images/drawer-arrow.png": "3d2dc8ec410f7b07854cb77c0249711e",
"assets/images/sumeru.png": "dfbf0ec5c529236f0ebe0e3d72dda335",
"assets/images/mondstadt-active.png": "7ea9266c495bf4571638f962102f54cc",
"assets/images/switch-off.png": "a57d24ef0b03e26c3cd133c2baa2dba7",
"assets/images/drawer-bg-content.png": "ce95028ddfea5d2d1cf0ee0982ea721a",
"assets/images/sumeru-white.png": "9c3950e3a7ca05998b88e6430e26e284",
"assets/NOTICES": "712029433585dbf44b2b1aa8e0b25ec5",
"assets/AssetManifest.json": "82cf7ffbb8715933fe13d1d55764617f"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
