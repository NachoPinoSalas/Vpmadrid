// Service worker: guarda la app en caché para que funcione sin conexión.
// Al publicar cambios hay que subir la versión de CACHE para que los móviles los reciban.
const CACHE = "vpmadrid-v1";
const ARCHIVOS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/estilos.css",
  "js/app.js",
  "js/marcador.js",
  "js/almacen.js",
  "assets/logo-vpmadrid-transparente.png",
  "assets/icono-192.png",
  "assets/icono-512.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARCHIVOS)));
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) => Promise.all(nombres.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
  );
});

// Primero la caché; si no está, la red
self.addEventListener("fetch", (evento) => {
  evento.respondWith(caches.match(evento.request).then((guardado) => guardado ?? fetch(evento.request)));
});
