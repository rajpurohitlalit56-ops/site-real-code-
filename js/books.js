/* ==== Books: rendering + mounting + Firebase sync (book products only) + PDF demo popup ====
   Depends on: js/books-data.js (BOOKS array) — load that script BEFORE this one. */

/* GitHub "blob" page ka link diya ho toh use seedha raw image link me convert kar do,
   taaki image turant load ho (blob wala link kabhi bhi <img> me directly nahi chalta). */
function toDirectImageUrl(url){
  if (!url) return url;
  url = String(url).trim();
  var m = url.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/(.+?)(\?.*)?$/);
  if (m) return 'https://raw.githubusercontent.com/' + m[1] + '/' + m[2] + '/' + m[3];
  return url;
}

/* Price string (jaise "₹20", "₹0" ya khali) dekh kar bataata hai ki book free hai ya nahi */
function isFreePrice(priceStr){
  var digits = String(priceStr == null ? '' : priceStr).replace(/[^0-9.]/g, '');
  return !digits || Number(digits) === 0;
}

/* Ek akela book-skeleton card — Firebase se extra books load hote waqt "aur items
   aa rahe hain" dikhane ke liye grid ke end me temporarily jode jaate hain. */
function renderBookSkeleton(){
  return '<div class="card book-card skeleton-card fb-loading-skeleton" aria-hidden="true">'
    + '<div class="book-cover"><span class="sk-block sk-fill"></span></div>'
    + '<div class="book-meta-force">'
    + '<span class="sk-block" style="width:38%;height:9px;margin:0 0 6px;"></span>'
    + '<span class="sk-block" style="width:94%;height:12px;margin:0 0 4px;"></span>'
    + '<span class="sk-block" style="width:68%;height:12px;margin:0;"></span>'
    + '</div>'
    + '<div class="body">'
    + '<div class="book-tags"><span class="sk-block sk-pill"></span><span class="sk-block sk-pill"></span></div>'
    + '<div class="btn-row"><span class="sk-block sk-btn"></span><span class="sk-block sk-btn"></span></div>'
    + '</div></div>';
}

/* Price + Language + File-size ko ek "tags" row me pill badges ki tarah dikhata hai.
   Har tag ka apna pastel-glass color hota hai taaki alag-alag jaankari easily pehchani
   jaaye. Language/File-size sirf tab dikhte hain jab woh data maujood ho (Firebase se
   admin ne bhara ho) — static books me na ho to bas price pill akela dikhega, container
   ki min-height fix hone se card ki length sabke liye same hi rehti hai. */
function renderBookTags(b){
  var free = isFreePrice(b.price);
  var priceLabel = free ? 'FREE' : b.price;
  var tags = '<span class="tag-pill tag-price'+(free?' tag-free':'')+'">'+priceLabel+'</span>';
  if (b.language) tags += '<span class="tag-pill tag-lang">'+b.language+'</span>';
  if (b.fileSize) tags += '<span class="tag-pill tag-size">'+b.fileSize+'</span>';
  return '<div class="book-tags">'+tags+'</div>';
}

function renderBookCard(b){
  var demoBtn = (b.demoType === 'popup')
    ? '<a class="btn btn-demo" href="javascript:void(0)" onclick="openPdfDemo(event)">Demo</a>'
    : '<a class="btn btn-demo" href="'+b.demoHref+'" rel="noopener" target="_blank">Demo</a>';
  var free = isFreePrice(b.price);
  var freeRibbon = free ? '<span class="free-ribbon">FREE</span>' : '';
  /* Puura card ab clickable hai (respective product/buy page kholta hai) —
     data-go-href pe navigate hota hai, jab tak click kisi actual button/link par na ho. */
  var goHref = b.buyHref || '';
  /* Image ko ek .book-cover wrapper me lapeta hai taaki: (1) text pehle turant dikhe
     aur bhaari image baad me fade-in ho, (2) tab tak uske shape (3:4 book-cover) jaisa
     hi ek shimmer skeleton dikhaya ja sake. */
  return '<div class="card book-card" data-category="book" data-go-href="'+goHref+'" tabindex="0" role="link" aria-label="'+b.name+'">' + freeRibbon
    + '<div class="book-cover"><div class="img-skeleton"></div><img alt="'+b.alt+'" loading="lazy" decoding="async" src="'+toDirectImageUrl(b.img)+'" onload="this.classList.add(\'is-loaded\');this.previousElementSibling&amp;&amp;this.previousElementSibling.classList.add(\'is-hidden\')" onerror="this.previousElementSibling&amp;&amp;this.previousElementSibling.classList.add(\'is-hidden\')"/></div>'
    + '<div class="book-meta-force"><div class="book-cat-force">'+b.by+'</div><div class="book-name-force">'+b.name+'</div></div>'
    + '<div class="body"><div class="by">'+b.by+'</div><h3>'+b.name+'</h3>'
    + renderBookTags(b)
    + '<div class="btn-row">'+demoBtn
    + '<a class="btn btn-buy b" href="'+b.buyHref+'" rel="noopener" target="_blank">Buy</a></div></div></div>';
}

/* ---- Poore book-card par click/keyboard se uske respective product page pe le jaana ----
   Demo/Buy buttons apna normal kaam karte rehte hain (unpe click "closest a" se bach jaata hai). */
(function wireBookCardNavigation(){
  var grid = document.getElementById('booksGrid');
  if (!grid) return;
  function goToCard(card){
    var href = card.getAttribute('data-go-href');
    if (href) window.open(href, '_blank', 'noopener');
  }
  grid.addEventListener('click', function(e){
    if (e.target.closest('a,button')) return;
    var card = e.target.closest('.book-card');
    if (card) goToCard(card);
  });
  grid.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target.closest('a,button')) return;
    var card = e.target.closest('.book-card');
    if (!card) return;
    e.preventDefault();
    goToCard(card);
  });
})();


/* Books count subtitle ("21 books" wala) ko hamesha asli, live count se update karta hai —
   pehle static list ke count se, fir jab Firebase se extra books aa jaayein tab unhe bhi
   jodkar dobara update karta hai. Isse yeh count kabhi bhi hardcoded/purana nahi rehta. */
function updateBooksCountSub(total){
  var el = document.getElementById('booksCountSub');
  if (el) el.textContent = total + (total === 1 ? ' book' : ' books');
}

(function(){
  var booksGrid = document.getElementById('booksGrid');
  if (booksGrid) booksGrid.innerHTML = BOOKS.map(renderBookCard).join('');
  updateBooksCountSub(BOOKS.length);
})();

/* ---- Firebase se admin panel ke through add kiye gaye naye BOOKS load karo ---- */
(function loadFirebaseBooks(){
  var booksGrid = document.getElementById('booksGrid');
  if (booksGrid) {
    var loadingHTML = '';
    for (var i = 0; i < 4; i++) loadingHTML += renderBookSkeleton();
    booksGrid.insertAdjacentHTML('beforeend', loadingHTML);
  }
  function clearLoadingSkeletons(){
    if (!booksGrid) return;
    var nodes = booksGrid.querySelectorAll('.fb-loading-skeleton');
    for (var i = 0; i < nodes.length; i++) nodes[i].remove();
  }
  fetch('/.netlify/functions/get-all-products')
    .then(function(res){ return res.ok ? res.json() : []; })
    .then(function(items){
      clearLoadingSkeletons();
      if (!booksGrid) return;
      var addedCount = 0;
      items.forEach(function(p){
        if (p.category !== 'book') return;
        var mapped = {
          alt: p.name,
          img: p.cardImage || '',
          by: p.by || '',
          name: p.name,
          desc: p.desc || '',
          price: '₹' + p.price,
          duration: p.duration || '',
          language: p.language || '',
          fileSize: p.fileSize || '',
          demoHref: 'book_page.html?id=' + p.id + '#previewSection',
          demoType: 'link',
          buyHref: 'book_page.html?id=' + p.id
        };
        booksGrid.insertAdjacentHTML('beforeend', renderBookCard(mapped));
        addedCount++;
      });
      if (addedCount) updateBooksCountSub(BOOKS.length + addedCount);
    })
    .catch(function(){ clearLoadingSkeletons(); /* silent fail — static catalogue already visible */ });
})();

/* ---- inline script block 3 ---- */

(function(){
  var FATMAN_PAGES = ["images/fatman-page-01.jpg", "images/fatman-page-02.jpg", "images/fatman-page-03.jpg", "images/fatman-page-04.jpg", "images/fatman-page-05.jpg", "images/fatman-page-06.jpg", "images/fatman-page-07.jpg", "images/fatman-page-08.jpg", "images/fatman-page-09.jpg", "images/fatman-page-10.jpg", "images/fatman-page-11.jpg", "images/fatman-page-12.jpg", "images/fatman-page-13.jpg", "images/fatman-page-14.jpg", "images/fatman-page-15.jpg", "images/fatman-page-16.jpg", "images/fatman-page-17.jpg", "images/fatman-page-18.jpg", "images/fatman-page-19.jpg", "images/fatman-page-20.jpg"];
  var overlay = document.getElementById('pdfModalOverlay');
  var body = document.getElementById('pdfModalBody');
  var closeBtn = document.getElementById('pdfModalCloseBtn');
  var rendered = false;
  var isOpen = false;

  function renderPages(){
    if (rendered) return;
    rendered = true;
    var frag = document.createDocumentFragment();
    FATMAN_PAGES.forEach(function(src, i){
      var wrap = document.createElement('div');
      wrap.className = 'pdf-page-wrap';
      var img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
      img.alt = 'Page ' + (i+1);
      var badge = document.createElement('div');
      badge.className = 'pdf-page-num';
      badge.textContent = (i+1) + ' / ' + FATMAN_PAGES.length;
      wrap.appendChild(img);
      wrap.appendChild(badge);
      frag.appendChild(wrap);
    });
    var note = document.createElement('div');
    note.className = 'pdf-modal-footer-note';
    note.textContent = 'End of demo preview — ' + FATMAN_PAGES.length + ' pages';
    frag.appendChild(note);
    body.innerHTML = '';
    body.appendChild(frag);
  }

  window.openPdfDemo = function(e){
    if (e) e.preventDefault();
    renderPages();
    overlay.classList.add('open');
    requestAnimationFrame(function(){ overlay.classList.add('show'); });
    document.body.style.overflow = 'hidden';
    isOpen = true;
    body.scrollTop = 0;
    if (!(history.state && history.state.pdfModal)) {
      history.pushState({pdfModal:true}, '', location.href);
    }
  };

  function hideModal(){
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    isOpen = false;
    setTimeout(function(){ overlay.classList.remove('open'); }, 220);
  }

  window.closePdfDemo = function(){
    if (!isOpen) return;
    if (history.state && history.state.pdfModal) {
      history.back();
    } else {
      hideModal();
    }
  };

  closeBtn.addEventListener('click', window.closePdfDemo);
  overlay.addEventListener('click', function(e){
    if (e.target === overlay) window.closePdfDemo();
  });

  window.addEventListener('popstate', function(e){
    if (isOpen && !(e.state && e.state.pdfModal)) {
      hideModal();
    }
  });
})();

