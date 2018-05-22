/**
 * IndexDb setup
 *
 */
import idb from 'idb';
function openDatabase() {
  //if the browser doesn't support serviceworkers skip opening a db
  if (!navigator.serviceWorker) return Promise.resolve();

  //otherwise return the dbPromise

  return idb.open('restaurant', 1, upgradeDb => {
    switch (upgradeDb.oldVersion) {
      case 0:
        const restaurantStore = upgradeDb.createObjectStore('restaurants', {
          keyPath: 'id'
        });
    }
  });
}

/**
 * Dbpromise configuration
 */

const _dbPromise = openDatabase();

/**
 * get from cache first if it exists
 */
function serveRestaurantsFromCache(callback) {
  return _dbPromise
    .then(db => {
      //no need to serve from cache if restaurants don't exist
      if (!db) return;
      //serve restaurants from cache
      const tx = db.transaction('restaurants');
      const restaurantStore = tx.objectStore('restaurants');

      return restaurantStore.getAll();
    })
    .then(
      restaurants => {
        console.log('served from cache');
        callback(null, restaurants);

        return restaurants;
      }, //something went wrong
      () =>
        callback(
          new Error('something went wrong getting restaurants from cache'),
          null
        )
    );
}

/**
 * Common database helper functions.
 */

class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://127.0.0.1:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    _dbPromise.then(db => {
      serveRestaurantsFromCache(callback).then(cachedRestaurants => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', DBHelper.DATABASE_URL);
        xhr.onload = () => {
          if (xhr.status === 200) {
            // Got a success response from server!
            const json = JSON.parse(xhr.responseText);
            const restaurants = json;
            //if going to the network for the first time
            //serve restuarants via call back then
            //add restaurants returned to the dbstore
            if (cachedRestaurants.length === 0) {
              console.log('serving from xhr');
              callback(null, restaurants);
            }

            _dbPromise.then(db => {
              var putPromises = restaurants.map(r => {
                let tx = db.transaction('restaurants', 'readwrite');
                let restaurantStore = tx.objectStore('restaurants');

                return restaurantStore.put(r);
                //according to the idb library transaction will autoclose
                //each time so I don't need to explicitly do so here
                //i was getting errors saying the transaction had already closed
                //when I tried to include it in my code.
              });

              Promise.all(putPromises)
                .then(() => {
                  console.log('putting restaurants succeeded');
                  //callback(null, restaurants);
                })
                .catch(err => console.log('putting restaurants failed', err));
            });
          } else {
            // Oops!. Got an error from server.
            const error = `Request failed. Returned status of ${xhr.status}`;
            callback(error, null);
          }
        };
        xhr.send();
      });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return restaurant.photograph;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}

export default DBHelper;
