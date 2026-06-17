// Service worker — Hello × Plan B (PWA shell cache)
// cache เฉพาะ "เปลือก" หน้า (HTML/icon/manifest) เพื่อให้ติดตั้ง + เปิดเร็ว
// ❗ ไม่ cache การเรียก API (?api= / /exec) — ข้อมูลต้องสดเสมอ
var CACHE = 'hello-pb-v1';
var ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  // ข้ามการเรียก API ทุกชนิด (ต้องสดเสมอ) — ปล่อยไป network ตามปกติ
  if (e.request.method !== 'GET' || u.search.indexOf('api=') >= 0 || u.pathname.indexOf('/exec') >= 0 || u.hostname.indexOf('script.google') >= 0) return;
  // shell: cache-first, fallback network
  e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request); }));
});
