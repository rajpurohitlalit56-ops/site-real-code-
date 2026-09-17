/* ==== Batches: rendering + mounting + Firebase sync (batch products only) ====
   Depends on: js/batches-data.js (BATCHES array) — load that script BEFORE this one. */

function renderBatchCard(b){
  var initial = (b.by || b.name || '?').trim().charAt(0).toUpperCase();
  var tag = b.duration || 'Batch';
  return '<a class="cc-card" href="'+b.buyHref+'" rel="noopener" target="_blank">'
    + '<div class="cc-thumb-wrap"><span class="cc-badge paid">PAID</span>'
    + '<img class="cc-thumb" alt="'+b.alt+'" src="'+b.img+'"/></div>'
    + '<div class="cc-body">'
      + '<h3 class="cc-title">'+b.name+'</h3>'
      + '<p class="cc-desc">'+(b.desc||'')+'</p>'
      + '<div class="cc-footer">'
        + '<span class="cc-avatar">'+initial+'</span>'
        + '<div class="cc-meta"><span class="cc-edu">'+(b.by||'')+'</span>'
          + '<div class="cc-tags"><span class="cc-tag">'+tag+'</span><span class="cc-tag price">'+b.price+'</span></div>'
        + '</div>'
      + '</div>'
    + '</div></a>';
}


(function(){
  var batchesGrid = document.getElementById('batchesGrid');
  if (batchesGrid) batchesGrid.innerHTML = BATCHES.map(renderBatchCard).join('');
})();

/* ---- Firebase se admin panel ke through add kiye gaye naye BATCHES load karo ----
   Static BATCHES list ko touch nahi karta, sirf naye batch products jod deta hai. */
(function loadFirebaseBatches(){
  fetch('/.netlify/functions/get-all-products')
    .then(function(res){ return res.ok ? res.json() : []; })
    .then(function(items){
      var batchesGrid = document.getElementById('batchesGrid');
      if (!batchesGrid) return;
      items.forEach(function(p){
        if (p.category !== 'batch') return;
        if (p.visibility === 'private') return;
        var mapped = {
          alt: p.name,
          img: p.cardImage || '',
          by: p.by || '',
          name: p.name,
          desc: p.desc || '',
          price: '₹' + p.price,
          duration: p.duration || '',
          demoHref: 'product_page.html?id=' + p.id + '#demoSection',
          demoType: 'link',
          buyHref: 'product_page.html?id=' + p.id
        };
        batchesGrid.insertAdjacentHTML('beforeend', renderBatchCard(mapped));
      });
    })
    .catch(function(){ /* silent fail — static catalogue already visible */ });
})();
