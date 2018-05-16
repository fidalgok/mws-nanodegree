console.log('from service worker: successfully registered');
const cacheVersion = 'restaurant-reviews-v4-';
const urlsToCache = [
  '/',
  '/dist/main.js',
  '/dist/restaurant_info.js',
  '/js/dbhelper.js',
  '/css/styles.css',
  '/restaurant.html'
];
const cacheWhitelist = [`${cacheVersion}skeleton`];

self.addEventListener('install', event => {
  //open a cache
  event.waitUntil(
    //rewrite for async await
    (async function addCaches() {
      try {
        const cache = await caches.open(`${cacheVersion}skeleton`);

        await cache.addAll(urlsToCache);
      } catch (err) {
        console.log(err);
      }
    })()
    // caches
    //   .open(cacheVersion + 'skeleton')
    //   .then(cache => {
    //     console.log(`opened cache`);
    //     return cache.addAll(urlsToCache);
    //   })
    //   .catch(err => {
    //     console.log(`caching failed with: ${err}`);
    //   })
  );
  //cache static files
  //confirm whether files are cached or not
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    //ignore for now
    return;
  }

  //block the fetch and respond with our cache before going to the network
  event.respondWith(
    //match a cache to the request event to one of the urls we've specified
    caches
      .match(event.request)
      .then(response => {
        //we've matched a cache now return that to the user, then go to the network
        //for any updates

        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          //let's add images to cache if they come from
          //the same origin. code pulled from mdn docs
          //learning how to use service worker
          //
          return response;
        });
      })
      .catch(err => console.log(`error matching cache: ${err}`))
  );
});

/**
 * Activate New Service Workers and remove any old caches
 */

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keylist => {
      //needs to return a promise since wait until is expecting that.
      return Promise.all(
        keylist
          .filter(
            key =>
              cacheWhitelist.indexOf(key) === -1 &&
              key.startsWith('restaurant-reviews-')
          )
          .map(key => {
            if (cacheWhitelist.indexOf(key) === -1) {
              return caches.delete(key);
            }
          })
      );
    })
  );
});
