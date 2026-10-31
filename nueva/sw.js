/* ===================================================================
   EL TRABAJADOR DE FONDO (service worker).

   PARA QUÉ. Para que la web se pueda instalar en el móvil o en la
   tablet como una app más, y sobre todo para que FUNCIONE SIN
   INTERNET. En un colegio el wifi va y viene, y un niño no entiende
   que hoy sí y mañana no: guarda los archivos la primera vez y a
   partir de ahí abre aunque no haya conexión.

   El progreso ya vivía en el navegador, así que sin internet no se
   pierde nada: lo único que espera es la sincronización con el panel,
   que se reintenta sola la próxima vez que haya red.

   CÓMO SE ACTUALIZA. Al subir archivos nuevos a GitHub hay que subir
   este también con el número de VERSION cambiado. Ese número es lo
   único que mira el navegador para saber que hay algo nuevo: sin
   tocarlo, los niños seguirían abriendo la versión guardada.
   =================================================================== */

const VERSION = 'danivia-2026-10-31b';

/* Lo que se guarda la primera vez. Son todos los archivos de la web:
   con esto ya puede abrir y funcionar entera sin conexión. */
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './piel.css',
  './datos.js',
  './dani.js',
  './sonido.js',
  './fiesta.js',
  './motor-js.js',
  './motor.js',
  './app.js',
  './extras.js',
  './juegos.js',
  './sudoku.js',
  './nonograma.js',
  './carrera.js',
  './minijuegos.js',
  './nube.js',
  './cabecera.jpg',
  './nunito-400.woff2',
  './nunito-700.woff2',
  './nunito-800.woff2',
  './nunito-900.woff2',
  './diagnostico.html',
  './icono-192.png',
  './icono-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // De uno en uno y sin rendirse: si un archivo fallara (por ejemplo por un
    // corte justo al instalar), los demás sí se guardan y la próxima vez se
    // completa. Con addAll(), un solo fallo tira toda la instalación.
    await Promise.all(ARCHIVOS.map(u => cache.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const nombres = await caches.keys();
    await Promise.all(nombres.filter(n => n !== VERSION).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // las escrituras a Firestore, ni tocarlas

  const url = new URL(req.url);

  // Nada de Google se guarda: ni la base de datos ni la autenticación. Son datos
  // vivos, y servirlos desde una copia vieja sería peor que no servirlos.
  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('firebaseio.com')) return;

  // La página: primero la red, para que al subir una versión nueva se vea en
  // cuanto haya conexión; si no hay, la copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresca = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put('./index.html', fresca.clone());
        return fresca;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // El resto: se sirve lo guardado al instante y, a la vez, se pide la versión
  // nueva por detrás para la próxima. Así abre rápido y se mantiene al día.
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const guardada = await cache.match(req);
    const enRed = fetch(req).then(r => {
      // Las respuestas de otro dominio (los archivos de Firebase) llegan
      // "opacas": se guardan igual, que para servirlas vale.
      if (r && (r.ok || r.type === 'opaque')) cache.put(req, r.clone());
      return r;
    }).catch(() => null);
    return guardada || (await enRed) || Response.error();
  })());
});
