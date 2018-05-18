import DBHelper from './dbhelper';

let restaurants, neighborhoods, cuisines;
var map;
window.markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
function fetchNeighborhoods() {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      console.log('error getting neighborhoods', error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
function fillNeighborhoodsHTML(neighborhoods = self.neighborhoods) {
  const select = document.getElementById('neighborhoods-select');
  select.addEventListener('change', updateRestaurants);
  if (select.querySelectorAll('option').length > 1) return;
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
function fetchCuisines() {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      console.error('error getting cuisines', error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
function fillCuisinesHTML(cuisines = self.cuisines) {
  const select = document.getElementById('cuisines-select');
  select.addEventListener('change', updateRestaurants);
  if (select.querySelectorAll('option').length > 1) return;
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };

  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
function updateRestaurants() {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    (error, restaurants) => {
      if (error) {
        // Got an error!
        console.error('error getting all restaurants', error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    }
  );
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
function resetRestaurants(restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
  }

  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML(restaurants = self.restaurants) {
  const ul = document.getElementById('restaurants-list');
  if (ul.querySelector('li')) return;
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant) {
  const li = document.createElement('li');

  const picture = createResponsiveImageHtml(
    DBHelper.imageUrlForRestaurant(restaurant),
    restaurant
  );
  li.append(picture);
  const detailsContainer = document.createElement('div');
  detailsContainer.classList.add('restaurants-list--details');
  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  detailsContainer.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  detailsContainer.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  detailsContainer.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  detailsContainer.append(more);
  li.append(detailsContainer);
  return li;
}

/**
 * Create responsive images
 */

function createResponsiveImageHtml(imgUrl, restaurant) {
  //getting just the number of the image from the DB
  //add appropriate sizes to the url and add all responsive
  //elements to a picture tag
  const imgSizes = ['300-sm-1x', '600-sm-2x', '800-md-1x'];
  const imgLocation = '/images/';
  const image = document.createElement('img');
  const picture = document.createElement('picture');

  image.className = 'restaurant-img';
  const source = document.createElement('source');
  const mdSource = document.createElement('source');
  imgSizes.forEach(size => {
    let width = size.split('-')[1];
    let density = size.split('-')[2].slice(0, 2);
    //if the width is sm set max width, otherwise set min width
    if (width === 'sm') {
      source.setAttribute('media', '(max-width: 767px)');
      if (!source.getAttribute('srcset')) {
        source.setAttribute(
          'srcset',
          `${imgLocation}${imgUrl}-${size}.jpg ${density}`
        );
      } else {
        //srcset exists, so append image path
        let srcset = source.getAttribute('srcset');
        source.setAttribute(
          'srcset',
          (srcset += `, ${imgLocation}${imgUrl}-${size}.jpg ${density}`)
        );
      }
    } else {
      mdSource.setAttribute('media', '(min-width:768px)');
      mdSource.setAttribute('srcset', `${imgLocation}${imgUrl}-${size}.jpg`);
    }
  });
  image.src = `${imgLocation}${imgUrl}-${imgSizes[0]}.jpg`;
  image.alt = `${restaurant.name} in ${restaurant.neighborhood} 
     serves ${restaurant.cuisine_type} cuisine.
    `;
  picture.appendChild(source);
  picture.appendChild(mdSource);
  picture.appendChild(image);

  return picture;
}

/**
 * Add markers for current restaurants to the map.
 */
function addMarkersToMap(restaurants = self.restaurants) {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
}

/**
 * Register Service Worker
 */

if ('navigator' in window) {
  self.addEventListener('load', () => {
    navigator.serviceWorker
      .register('../serviceworker.js')
      .then(registration => {
        //success
        console.log(
          `Successfully registered service worker with scope: ${
            registration.scope
          }`
        );
      })
      .catch(err => {
        //something went wrong
        console.log(`Service worker registration failed with: ${err}`);
      });
  });
} else {
  /**
   * Service workers aren't supported, do nothing
   */
}
