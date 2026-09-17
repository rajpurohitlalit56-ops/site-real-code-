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

function renderBookCard(b){
  var initial = (b.by || b.name || '?').trim().charAt(0).toUpperCase();
  var free = isFreePrice(b.price);
  return '<a class="cc-card" href="'+b.buyHref+'" rel="noopener" target="_blank">'
    + '<div class="cc-thumb-wrap"><span class="cc-badge '+(free?'free':'paid')+'">'+(free?'FREE':'PAID')+'</span>'
    + '<img class="cc-thumb" alt="'+b.alt+'" src="'+toDirectImageUrl(b.img)+'"/></div>'
    + '<div class="cc-body">'
      + '<h3 class="cc-title">'+b.name+'</h3>'
      + '<p class="cc-desc">'+(b.desc||b.by||'')+'</p>'
      + '<div class="cc-footer">'
        + '<span class="cc-avatar">'+initial+'</span>'
        + '<div class="cc-meta"><span class="cc-edu">'+(b.by||'')+'</span>'
          + '<div class="cc-tags"><span class="cc-tag">Book</span><span class="cc-tag price">'+(free?'FREE':b.price)+'</span></div>'
        + '</div>'
      + '</div>'
    + '</div></a>';
}


(function(){
  var booksGrid = document.getElementById('booksGrid');
  if (booksGrid) booksGrid.innerHTML = BOOKS.map(renderBookCard).join('');
})();

/* ---- Firebase se admin panel ke through add kiye gaye naye BOOKS load karo ---- */
(function loadFirebaseBooks(){
  fetch('/.netlify/functions/get-all-products')
    .then(function(res){ return res.ok ? res.json() : []; })
    .then(function(items){
      var booksGrid = document.getElementById('booksGrid');
      if (!booksGrid) return;
      items.forEach(function(p){
        if (p.category !== 'book') return;
        if (p.visibility === 'private') return;
        var mapped = {
          alt: p.name,
          img: p.cardImage || '',
          by: p.by || '',
          name: p.name,
          desc: p.desc || '',
          price: '₹' + p.price,
          duration: p.duration || '',
          demoHref: 'book_page.html?id=' + p.id + '#previewSection',
          demoType: 'link',
          buyHref: 'book_page.html?id=' + p.id
        };
        booksGrid.insertAdjacentHTML('beforeend', renderBookCard(mapped));
      });
    })
    .catch(function(){ /* silent fail — static catalogue already visible */ });
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

