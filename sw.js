// 휴대폰 앱 오프라인 실행용: 인터넷이 되면 항상 새 파일, 안 되면 마지막으로 받은 파일
// 서버(script.google.com) 호출은 건드리지 않음 — 같은 주소(앱 파일)만 저장
const CACHE = 'deskcal-2.1.1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
});
