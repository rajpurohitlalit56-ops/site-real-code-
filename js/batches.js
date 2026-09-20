/* ==== Batches: rendering + mounting + Firebase sync (batch products only) ====
   Depends on: js/batches-data.js (BATCHES array) — load that script BEFORE this one. */

/* Ek akela batch-skeleton card — Firebase se extra batches load hote waqt "aur items
   aa rahe hain" dikhane ke liye grid ke end me temporarily jode jaate hain. Books ke
   skeleton se shape alag hai (landscape cover, desc line, price block) kyoki batch
   card ka layout khud alag hai. */
function renderBatchSkeleton(){
  return '<div class="card batch-card skeleton-card fb-loading-skeleton" aria-hidden="true">'
    + '<div class="batch-cover-wrap"><span class="sk-block sk-fill"></span></div>'
    + '<div class="body">'
    + '<span class="sk-block" style="width:32%;height:9px;margin:0 0 6px;"></span>'
    + '<span class="sk-block" style="width:88%;height:13px;margin:0 0 6px;"></span>'
    + '<span class="sk-block" style="width:58%;height:10px;margin:0 0 10px;"></span>'
    + '<div class="price-row"><span class="sk-block sk-price"></span></div>'
    + '<div class="btn-row"><span class="sk-block sk-btn"></span><span class="sk-block sk-btn"></span></div>'
    + '</div></div>';
}

function renderBatchCard(b){
  var demoBtn = b.demoHref
    ? '<a class="btn btn-demo" href="'+b.demoHref+'" rel="noopener" target="_blank">Demo</a>'
    : '<span class="btn btn-demo disabled">'+(b.demoLabel||'Demo unavailable')+'</span>';
  var durationSpan = b.duration
    ? '<span style="font-size:11px;color:var(--sub);font-weight:600;">'+b.duration+'</span>'
    : '';
  /* Puura card ab clickable hai (respective product page kholta hai) —
     data-go-href pe navigate hota hai, jab tak click kisi actual button/link par na ho. */
  var goHref = b.buyHref || '';
  /* Image ek .batch-cover-wrap me — text pehle turant dikhta hai, bhaari cover image
     lazy-load hoti hai aur tab tak uske shape (16:9 video-thumbnail) jaisa shimmer
     skeleton dikhta hai. Play-badge sirf batch cards ke liye hai (lecture/video feel). */
  return '<div class="card batch-card" data-go-href="'+goHref+'" tabindex="0" role="link" aria-label="'+b.name+'">'
    + '<div class="batch-cover-wrap"><div class="img-skeleton batch-skeleton"></div>'
    + '<img alt="'+b.alt+'" class="batch-cover" loading="lazy" decoding="async" src="'+b.img+'" onload="this.classList.add(\'is-loaded\');this.previousElementSibling&amp;&amp;this.previousElementSibling.classList.add(\'is-hidden\')" onerror="this.previousElementSibling&amp;&amp;this.previousElementSibling.classList.add(\'is-hidden\')"/>'
    + '<span class="batch-play-badge" aria-hidden="true"><svg viewBox="0 0 44 44" width="40" height="40"><circle cx="22" cy="22" r="21" fill="rgba(15,17,26,.55)"></circle><path d="M18 14l14 8-14 8V14z" fill="#fff"></path></svg></span></div>'
    + '<div class="body"><div class="by">'+b.by+'</div><h3>'+b.name+'</h3>'
    + '<div class="batch-desc">'+b.desc+'</div>'
    + '<div class="price-row"><span class="price b">'+b.price+'</span>'+durationSpan+'</div>'
    + '<div class="btn-row">'+demoBtn
    + '<a class="btn btn-buy b" href="'+b.buyHref+'" rel="noopener" target="_blank">Buy</a></div></div></div>';
}

/* ---- Poore batch-card par click/keyboard se uske respective product page pe le jaana ----
   Demo/Buy buttons apna normal kaam karte rehte hain. */
(function wireBatchCardNavigation(){
  var grid = document.getElementById('batchesGrid');
  if (!grid) return;
  function goToCard(card){
    var href = card.getAttribute('data-go-href');
    if (href) window.open(href, '_blank', 'noopener');
  }
  grid.addEventListener('click', function(e){
    if (e.target.closest('a,button')) return;
    var card = e.target.closest('.batch-card');
    if (card) goToCard(card);
  });
  grid.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target.closest('a,button')) return;
    var card = e.target.closest('.batch-card');
    if (!card) return;
    e.preventDefault();
    goToCard(card);
  });
})();


(function(){
  var batchesGrid = document.getElementById('batchesGrid');
  if (batchesGrid) batchesGrid.innerHTML = BATCHES.map(renderBatchCard).join('');
})();

/* ---- Firebase se admin panel ke through add kiye gaye naye BATCHES load karo ----
   Static BATCHES list ko touch nahi karta, sirf naye batch products jod deta hai. */
(function loadFirebaseBatches(){
  var batchesGrid = document.getElementById('batchesGrid');
  if (batchesGrid) {
    var loadingHTML = '';
    for (var i = 0; i < 4; i++) loadingHTML += renderBatchSkeleton();
    batchesGrid.insertAdjacentHTML('beforeend', loadingHTML);
  }
  function clearLoadingSkeletons(){
    if (!batchesGrid) return;
    var nodes = batchesGrid.querySelectorAll('.fb-loading-skeleton');
    for (var i = 0; i < nodes.length; i++) nodes[i].remove();
  }
  fetch('/.netlify/functions/get-all-products')
    .then(function(res){ return res.ok ? res.json() : []; })
    .then(function(items){
      clearLoadingSkeletons();
      if (!batchesGrid) return;
      items.forEach(function(p){
        if (p.category !== 'batch') return;
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
    .catch(function(){ clearLoadingSkeletons(); /* silent fail — static catalogue already visible */ });
})();
