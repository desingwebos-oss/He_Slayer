// sw.js v4.5 autodestructivo
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))).then(()=>self.registration.unregister())); });
self.addEventListener('fetch',e=>{ e.respondWith(fetch(e.request)); });
