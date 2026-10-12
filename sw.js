/* 서비스 워커: 파일을 폰에 저장해 두고, 인터넷이 없어도 저장본으로 열어요.
   공지(data/notices.json)만 인터넷이 되면 새로 받아요. */
importScripts('files.js');

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(self.APP_CACHE).then((c) => c.addAll(self.APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(self.APP_PREFIX) && k !== self.APP_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isNotice = req.url.includes('notices.json');
  if (isNotice) {
    // 공지: 인터넷 먼저, 안 되면 저장본
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((res) => { const copy = res.clone(); caches.open(self.APP_CACHE).then((c) => c.put(req.url.split('?')[0], copy)); return res; })
        .catch(() => caches.match(req.url.split('?')[0]))
    );
    return;
  }
  // 나머지: 저장본 먼저, 없으면 인터넷
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(self.APP_CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
