!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},n.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t,n){"use strict";var r=n(1),o=n.n(r);const s=navigator.serviceWorker?o.a.open("restaurant",1,e=>{switch(e.oldVersion){case 0:e.createObjectStore("restaurants",{keyPath:"id"})}}):Promise.resolve();class i{static get DATABASE_URL(){return"http://127.0.0.1:1337/restaurants"}static fetchRestaurants(e){(function(e){return s.then(e=>{if(e)return e.transaction("restaurants").objectStore("restaurants").getAll()}).then(t=>{console.log("served from cache"),e(null,t)},()=>e(new Error("something went wrong getting restaurants from cache"),null))})(e).then(()=>{let t=new XMLHttpRequest;t.open("GET",i.DATABASE_URL),t.onload=(()=>{if(200===t.status){const e=JSON.parse(t.responseText);s.then(t=>{var n=e.map(e=>{return t.transaction("restaurants","readwrite").objectStore("restaurants").put(e)});Promise.all(n).then(()=>{console.log("putting restaurants succeeded"),console.log("serving from xhr")}).catch(e=>console.log("putting restaurants failed",e))})}else{const n=`Request failed. Returned status of ${t.status}`;e(n,null)}}),t.send()})}static fetchRestaurantById(e,t){i.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.find(t=>t.id==e);n?t(null,n):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){i.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.cuisine_type==e);t(null,n)}})}static fetchRestaurantByNeighborhood(e,t){i.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.neighborhood==e);t(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,n){i.fetchRestaurants((r,o)=>{if(r)n(r,null);else{let r=o;"all"!=e&&(r=r.filter(t=>t.cuisine_type==e)),"all"!=t&&(r=r.filter(e=>e.neighborhood==t)),n(null,r)}})}static fetchNeighborhoods(e){i.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].neighborhood),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static fetchCuisines(e){i.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].cuisine_type),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return e.photograph}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:i.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}t.a=i},function(e,t,n){"use strict";!function(){function t(e){return new Promise(function(t,n){e.onsuccess=function(){t(e.result)},e.onerror=function(){n(e.error)}})}function n(e,n,r){var o,s=new Promise(function(s,i){t(o=e[n].apply(e,r)).then(s,i)});return s.request=o,s}function r(e,t,n){n.forEach(function(n){Object.defineProperty(e.prototype,n,{get:function(){return this[t][n]},set:function(e){this[t][n]=e}})})}function o(e,t,r,o){o.forEach(function(o){o in r.prototype&&(e.prototype[o]=function(){return n(this[t],o,arguments)})})}function s(e,t,n,r){r.forEach(function(r){r in n.prototype&&(e.prototype[r]=function(){return this[t][r].apply(this[t],arguments)})})}function i(e,t,r,o){o.forEach(function(o){o in r.prototype&&(e.prototype[o]=function(){return e=this[t],(r=n(e,o,arguments)).then(function(e){if(e)return new u(e,r.request)});var e,r})})}function a(e){this._index=e}function u(e,t){this._cursor=e,this._request=t}function c(e){this._store=e}function l(e){this._tx=e,this.complete=new Promise(function(t,n){e.oncomplete=function(){t()},e.onerror=function(){n(e.error)},e.onabort=function(){n(e.error)}})}function d(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new l(n)}function p(e){this._db=e}r(a,"_index",["name","keyPath","multiEntry","unique"]),o(a,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),i(a,"_index",IDBIndex,["openCursor","openKeyCursor"]),r(u,"_cursor",["direction","key","primaryKey","value"]),o(u,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(e){e in IDBCursor.prototype&&(u.prototype[e]=function(){var n=this,r=arguments;return Promise.resolve().then(function(){return n._cursor[e].apply(n._cursor,r),t(n._request).then(function(e){if(e)return new u(e,n._request)})})})}),c.prototype.createIndex=function(){return new a(this._store.createIndex.apply(this._store,arguments))},c.prototype.index=function(){return new a(this._store.index.apply(this._store,arguments))},r(c,"_store",["name","keyPath","indexNames","autoIncrement"]),o(c,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),i(c,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),s(c,"_store",IDBObjectStore,["deleteIndex"]),l.prototype.objectStore=function(){return new c(this._tx.objectStore.apply(this._tx,arguments))},r(l,"_tx",["objectStoreNames","mode"]),s(l,"_tx",IDBTransaction,["abort"]),d.prototype.createObjectStore=function(){return new c(this._db.createObjectStore.apply(this._db,arguments))},r(d,"_db",["name","version","objectStoreNames"]),s(d,"_db",IDBDatabase,["deleteObjectStore","close"]),p.prototype.transaction=function(){return new l(this._db.transaction.apply(this._db,arguments))},r(p,"_db",["name","version","objectStoreNames"]),s(p,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(e){[c,a].forEach(function(t){t.prototype[e.replace("open","iterate")]=function(){var t,n=(t=arguments,Array.prototype.slice.call(t)),r=n[n.length-1],o=this._store||this._index,s=o[e].apply(o,n.slice(0,-1));s.onsuccess=function(){r(s.result)}}})}),[a,c].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,t){var n=this,r=[];return new Promise(function(o){n.iterateCursor(e,function(e){e?(r.push(e.value),void 0===t||r.length!=t?e.continue():o(r)):o(r)})})})});var f={open:function(e,t,r){var o=n(indexedDB,"open",[e,t]),s=o.request;return s.onupgradeneeded=function(e){r&&r(new d(s.result,e.oldVersion,s.transaction))},o.then(function(e){return new p(e)})},delete:function(e){return n(indexedDB,"deleteDatabase",[e])}};e.exports=f,e.exports.default=e.exports}()},function(e,t,n){"use strict";n.r(t);var r=n(0);window.initMap=(()=>{!function(e){if(self.restaurant)return void e(null,self.restaurant);const t=function(e,t){t||(t=window.location.href);e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}("id");t?r.a.fetchRestaurantById(t,(t,n)=>{self.restaurant=n,n?(!function(e=self.restaurant){document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address,function(e,t){const n=["300-sm-1x","600-sm-2x","800-md-1x"],r=document.createElement("img"),o=document.getElementById("restaurant-img").querySelector("picture");r.className="restaurant-img";const s=document.createElement("source"),i=document.createElement("source");n.forEach(t=>{let n=t.split("-")[1],r=t.split("-")[2].slice(0,2);if("sm"===n)if(s.setAttribute("media","(max-width: 767px)"),s.getAttribute("srcset")){let n=s.getAttribute("srcset");s.setAttribute("srcset",n+=`, /images/${e}-${t}.jpg ${r}`)}else s.setAttribute("srcset",`/images/${e}-${t}.jpg ${r}`);else i.setAttribute("media","(min-width:768px)"),i.setAttribute("srcset",`/images/${e}-${t}.jpg`)}),r.src=`/images/${e}-${n[0]}.jpg`,r.alt=`${t.name} in ${t.neighborhood} \n     serves ${t.cuisine_type} cuisine.\n    `,o.appendChild(s),o.appendChild(i),o.appendChild(r)}(r.a.imageUrlForRestaurant(e),e),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&function(e=self.restaurant.operating_hours){const t=document.getElementById("restaurant-hours");for(let n in e){const r=document.createElement("tr"),o=document.createElement("td");o.innerHTML=n,r.appendChild(o);const s=document.createElement("td");s.innerHTML=e[n],r.appendChild(s),t.appendChild(r)}}();!function(e=self.restaurant.reviews){const t=document.getElementById("reviews-container"),n=document.createElement("h3");if(n.innerHTML="Reviews",t.appendChild(n),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const r=document.getElementById("reviews-list");e.forEach(e=>{r.appendChild(function(e){const t=document.createElement("li"),n=document.createElement("p"),r=document.createElement("div");n.innerHTML=e.name,r.appendChild(n),r.classList.add("review__header","review--black"),t.appendChild(r);const o=document.createElement("p");o.innerHTML=e.date,r.appendChild(o);const s=document.createElement("p");s.innerHTML=`Rating: ${e.rating}`,s.classList.add("review--orange","review__rating"),t.appendChild(s);const i=document.createElement("p");return i.innerHTML=e.comments,t.appendChild(i),t}(e))}),t.appendChild(r)}()}(),e(null,n)):console.error(t)}):(error="No restaurant id in URL",e(error,null))}((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),function(e=self.restaurant){const t=document.getElementById("breadcrumb").querySelector("ul"),n=document.createElement("li");n.innerHTML=e.name,n.setAttribute("aria-current","page"),t.appendChild(n)}(),r.a.mapMarkerForRestaurant(self.restaurant,self.map))})})}]);