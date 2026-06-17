// Service worker — Hello × Plan B (PWA shell cache)
// cache เฉพาะ "เปลือก" หน้า (HTML/icon/manifest) เพื่อให้ติดตั้ง + เปิดเร็ว
// ❗ ไม่ cache การเรียก API (?api= / /exec) — ข้อมูลต้องสดเสมอ
var CACHE = 'hello-pb-v2';
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
  // หน้า HTML: network-first → ได้เวอร์ชันใหม่เสมอ (อัปเดตไม่ติด cache), offline ค่อย fallback
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).then(function (r) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return r;
      }).catch(function () { return caches.match(e.request).then(function (m) { return m || caches.match('./'); }); })
    );
    return;
  }
  // asset อื่น (icon/manifest): cache-first
  e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request); }));
});
