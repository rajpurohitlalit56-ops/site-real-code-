/* ==== Shared Firebase products fetch ====
   batches.js and books.js both need the SAME data from get-all-products.
   Without this, they each fire their own fetch on every page load — two
   network round-trips for one dataset. This file fires it ONCE, and both
   scripts share the same result via window.MSP_PRODUCTS_PROMISE.

   Load this file BEFORE js/batches.js and js/books.js in index.html. */
window.MSP_PRODUCTS_PROMISE = fetch('/.netlify/functions/get-all-products')
  .then(function(res){ return res.ok ? res.json() : []; })
  .catch(function(){ return []; });
