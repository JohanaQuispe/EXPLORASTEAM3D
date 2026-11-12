/* ExploraSTEAM 3D — Service Worker: offline total para el colegio */
const VERSION = "explorasteam-v9-2026-11-10";
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/styles.css",
  "js/algorithms.js",
  "js/audio.js",
  "js/curriculum.js",
  "js/interaction.js",
  "js/main.js",
  "js/ui.js",
  "js/world.js",
  "vendor/three.min.js",
  "vendor/OrbitControls.js",
  "vendor/gsap.min.js",
  "assets/img/mundo-3d.jpg",
  "assets/img/island-art.jpg",
  "assets/img/island-engineering.jpg",
  "assets/img/island-math.jpg",
  "assets/img/island-science.jpg",
  "assets/img/island-technology.jpg",
  "assets/img/pio-hero.jpg",
  "assets/img/deepdive/art-1.jpg",
  "assets/img/deepdive/art-2.jpg",
  "assets/img/deepdive/art-3.jpg",
  "assets/img/deepdive/art-4.jpg",
  "assets/img/deepdive/art-5.jpg",
  "assets/img/deepdive/science-1.jpg",
  "assets/img/deepdive/science-2.jpg",
  "assets/img/deepdive/science-3.jpg",
  "assets/img/deepdive/science-4.jpg",
  "assets/img/deepdive/science-5.jpg",
  "assets/img/deepdive/math-1.jpg",
  "assets/img/deepdive/math-2.jpg",
  "assets/img/deepdive/math-3.jpg",
  "assets/img/deepdive/math-4.jpg",
  "assets/img/deepdive/math-5.jpg",
  "assets/img/deepdive/technology-1.jpg",
  "assets/img/deepdive/technology-2.jpg",
  "assets/img/deepdive/technology-3.jpg",
  "assets/img/deepdive/technology-4.jpg",
  "assets/img/deepdive/technology-5.jpg",
  "assets/img/deepdive/engineering-1.jpg",
  "assets/img/deepdive/engineering-2.jpg",
  "assets/img/deepdive/engineering-3.jpg",
  "assets/img/deepdive/engineering-4.jpg",
  "assets/img/deepdive/engineering-5.jpg",
  "assets/img/icon-192.png",
  "assets/img/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) { return cache.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // deja pasar YouTube y fuentes externas
  event.respondWith(
    caches.open(VERSION).then(function (cache) {
      return cache.match(req).then(function (cached) {
        const network = fetch(req).then(function (res) {
          if (res && res.ok && res.type === "basic") cache.put(req, res.clone());
          return res;
        }).catch(function () { return null; });
        return cached || network.then(function (res) {
          return res || (req.mode === "navigate" ? cache.match("index.html") : Response.error());
        });
      });
    })
  );
});
