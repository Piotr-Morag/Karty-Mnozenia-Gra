// Nazwa pamięci podręcznej (cache) - zmień ją, gdy aktualizujesz pliki aplikacji
const CACHE_NAME = 'multiplication-game-cache-v2'; // <<<<<<< ZMIENIONA WERSJA (opcjonalnie, ale zalecane)
// Pliki, które mają być zapisane w cache do działania offline
const urlsToCache = [
  './',                           // OK - zcache'uje index.html
  // './Tabliczka Mnożenia V6-4-3.html', // <<<<<<< USUNIĘTE
  './manifest.json',              // <<<<<<< DODANE
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Instalacja Service Workera - cache'owanie zasobów aplikacji
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Otwarto cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Nie udało się otworzyć lub zapełnić cache podczas instalacji', err);
      })
  );
});

// Aktywacja Service Workera - usuwanie starych wersji cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Usuwamy cache, jeśli jego nazwa jest inna niż aktualna
          if (cacheName !== CACHE_NAME) {
            console.log('Usuwanie starego cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Po wyczyszczeniu starych cache, upewniamy się, że nowy SW przejmuje kontrolę
      return self.clients.claim();
    })
  );
});

// Przechwytywanie żądań sieciowych (Fetch event) - Cache First
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request) // Sprawdź, czy żądanie jest w cache
      .then(response => {
        // Jeśli jest w cache, zwróć z cache
        if (response) {
          return response;
        }
        // Jeśli nie ma w cache, spróbuj pobrać z sieci
        return fetch(event.request)
          .catch(err => {
            console.error("Błąd podczas pobierania z sieci (jesteś offline?):", err);
            // Tutaj można by zwrócić jakąś stronę błędu offline,
            // ale dla tej aplikacji, jeśli główne pliki są w cache, to powinno wystarczyć.
          });
      })
  );
});