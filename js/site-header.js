/* ============================================================
   MySelectionPrep — Shared Site Header
   Compact brand header + expandable search + theme toggle +
   right-side sliding hamburger drawer (Batch / Books / Orders /
   Support) + hide-on-scroll-down / show-on-scroll-up.

   Drop this file in js/site-header.js and add ONE line near the
   end of <body> on every page:
     <script src="js/site-header.js"></script>
   No other dependency required — works standalone.
   ============================================================ */
(function () {
  var STYLE_ID = 'msp-header-style';
  var THEME_KEY = 'mspTheme';

  var css = ''
    + ':root{--msp-indigo:#4F46E5;--msp-indigo-dark:#3730A3;--msp-header-h:54px;}'
    + '.msp-header{position:fixed;top:0;left:0;right:0;z-index:1300;height:var(--msp-header-h);'
    + 'background:rgba(255,255,255,0.85);backdrop-filter:blur(14px) saturate(180%);-webkit-backdrop-filter:blur(14px) saturate(180%);'
    + 'border-bottom:1px solid rgba(0,0,0,0.06);box-shadow:0 4px 18px rgba(20,23,31,0.06);'
    + 'transition:transform .28s cubic-bezier(.4,0,.2,1),background .2s ease;font-family:"Sora",-apple-system,BlinkMacSystemFont,sans-serif;}'
    + '.msp-header.msp-hide{transform:translateY(-100%);}'
    + '.msp-header-inner{height:var(--msp-header-h);max-width:640px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 12px;}'
    + '.msp-brand{display:flex;align-items:center;gap:8px;text-decoration:none;color:#1E1B3A;font-weight:800;font-size:14px;letter-spacing:-.2px;min-width:0;}'
    + '.msp-brand svg{width:26px;height:26px;flex-shrink:0;}'
    + '.msp-brand span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
    + '.msp-actions{display:flex;align-items:center;gap:6px;flex-shrink:0;}'
    + '.msp-icon-btn{width:36px;height:36px;border-radius:50%;border:none;background:rgba(79,70,229,0.08);color:#3730A3;'
    + 'display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .15s ease,background .15s ease;flex-shrink:0;padding:0;}'
    + '.msp-icon-btn:active{transform:scale(.9);background:rgba(79,70,229,0.18);}'
    + '.msp-icon-btn svg{width:17px;height:17px;}'
    + '.msp-search-row{max-width:640px;margin:0 auto;overflow:hidden;max-height:0;transition:max-height .25s ease,padding .25s ease;padding:0 12px;}'
    + '.msp-search-row.msp-open{max-height:54px;padding:0 12px 10px;}'
    + '.msp-search-row input{width:100%;box-sizing:border-box;border:1px solid #E2E1F2;background:#F3F4F8;border-radius:12px;padding:9px 14px;font:500 13px "Sora",sans-serif;outline:none;color:#1E1B3A;}'
    + '.msp-drawer-overlay{position:fixed;inset:0;background:rgba(15,17,21,.5);z-index:1400;opacity:0;pointer-events:none;transition:opacity .25s ease;}'
    + '.msp-drawer-overlay.msp-open{opacity:1;pointer-events:auto;}'
    + '.msp-drawer{position:fixed;top:0;right:0;bottom:0;width:78%;max-width:300px;background:#fff;z-index:1500;'
    + 'transform:translateX(100%);transition:transform .3s cubic-bezier(.2,.9,.2,1);box-shadow:-8px 0 30px rgba(0,0,0,.18);'
    + 'display:flex;flex-direction:column;font-family:"Sora",sans-serif;}'
    + '.msp-drawer.msp-open{transform:translateX(0);}'
    + '.msp-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid #E5E7EB;flex-shrink:0;}'
    + '.msp-drawer-head span{font-weight:800;font-size:15px;color:#1E1B3A;}'
    + '.msp-drawer-close{width:32px;height:32px;border-radius:50%;border:none;background:#F3F4F8;color:#3730A3;font-size:16px;cursor:pointer;}'
    + '.msp-drawer nav{display:flex;flex-direction:column;padding:8px;gap:2px;overflow-y:auto;}'
    + '.msp-drawer nav a{display:flex;align-items:center;gap:12px;padding:13px 12px;border-radius:12px;text-decoration:none;color:#1E1B3A;font-weight:700;font-size:14px;transition:background .15s ease;}'
    + '.msp-drawer nav a:active,.msp-drawer nav a.msp-active{background:#EEF0FD;color:#3730A3;}'
    + '.msp-drawer nav a svg{width:19px;height:19px;flex-shrink:0;color:#4F46E5;}'
    + '.msp-drawer-foot{margin-top:auto;padding:14px 16px;font-size:11px;color:#9096A3;text-align:center;flex-shrink:0;}'
    + 'html[data-msp-theme="dark"] .msp-header{background:rgba(17,19,24,.88);border-bottom-color:rgba(255,255,255,0.08);}'
    + 'html[data-msp-theme="dark"] .msp-brand{color:#F1F2F6;}'
    + 'html[data-msp-theme="dark"] .msp-icon-btn{background:rgba(129,140,248,0.16);color:#C7D2FE;}'
    + 'html[data-msp-theme="dark"] .msp-search-row input{background:#1C1E26;border-color:#2A2D38;color:#F1F2F6;}'
    + 'html[data-msp-theme="dark"] .msp-drawer{background:#14161C;box-shadow:-8px 0 30px rgba(0,0,0,.5);}'
    + 'html[data-msp-theme="dark"] .msp-drawer-head{border-bottom-color:#2A2D38;}'
    + 'html[data-msp-theme="dark"] .msp-drawer-head span{color:#F1F2F6;}'
    + 'html[data-msp-theme="dark"] .msp-drawer-close{background:#1C1E26;color:#C7D2FE;}'
    + 'html[data-msp-theme="dark"] .msp-drawer nav a{color:#E5E7EB;}'
    + 'html[data-msp-theme="dark"] .msp-drawer nav a:active,html[data-msp-theme="dark"] .msp-drawer nav a.msp-active{background:#20232C;color:#C7D2FE;}'
    /* Best-effort whole-page dark mode. Flips the light surfaces used
       across index.html / book_page.html / product_page.html. Bespoke
       gradients on book_page/product_page won't be pixel-perfect but
       stay readable — safe to trim/extend this list per page. */
    + 'html[data-msp-theme="dark"] body{background:#0F1115 !important;color:#E5E7EB !important;}'
    + 'html[data-msp-theme="dark"] .card,html[data-msp-theme="dark"] .section-card,html[data-msp-theme="dark"] .hero,'
    + 'html[data-msp-theme="dark"] .faq-item,html[data-msp-theme="dark"] .order-card,html[data-msp-theme="dark"] .contact-card,'
    + 'html[data-msp-theme="dark"] .top-search,html[data-msp-theme="dark"] .spec-box,html[data-msp-theme="dark"] .toc-item,'
    + 'html[data-msp-theme="dark"] .cover-card,html[data-msp-theme="dark"] .sticky-bar,html[data-msp-theme="dark"] .pricing-card,'
    + 'html[data-msp-theme="dark"] .welcome-modal-card,html[data-msp-theme="dark"] .login-modal-card{'
    + 'background:#191B22 !important;border-color:#2A2D38 !important;color:#E5E7EB !important;}'
    + 'html[data-msp-theme="dark"] h1,html[data-msp-theme="dark"] h2,html[data-msp-theme="dark"] h3,'
    + 'html[data-msp-theme="dark"] .product-title,html[data-msp-theme="dark"] .book-name-force,'
    + 'html[data-msp-theme="dark"] .card h3{color:#F1F2F6 !important;}'
    + 'body{padding-top:calc(var(--msp-header-h) + 10px) !important;}';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = css;
    document.head.appendChild(s);
  }

  function svgLogo() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"></path><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"></path></svg>';
  }
  function svgSearch() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
  }
  function svgMoon() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"></path></svg>';
  }
  function svgSun() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>';
  }
  function svgMenu() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
  }

  var SECTIONS = [
    { key: 'all', label: 'Batch', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>' },
    { key: 'books', label: 'Books', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>' },
    { key: 'orders', label: 'My Orders', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>' },
    { key: 'support', label: 'Support', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>' }
  ];

  function isIndexPage() {
    var p = window.location.pathname;
    return p === '/' || /\/?index\.html$/.test(p) || p === '';
  }

  function sectionHref(key) {
    return isIndexPage() ? ('?section=' + key) : ('index.html?section=' + key);
  }

  function buildHeader() {
    var header = document.createElement('header');
    header.className = 'msp-header';
    header.id = 'mspHeader';
    header.innerHTML =
      '<div class="msp-header-inner">' +
      '<a href="index.html" class="msp-brand">' + svgLogo() + '<span>MySelectionPrep</span></a>' +
      '<div class="msp-actions">' +
      '<button class="msp-icon-btn" id="mspSearchBtn" aria-label="Search">' + svgSearch() + '</button>' +
      '<button class="msp-icon-btn" id="mspThemeBtn" aria-label="Toggle theme">' + svgMoon() + '</button>' +
      '<button class="msp-icon-btn" id="mspMenuBtn" aria-label="Menu">' + svgMenu() + '</button>' +
      '</div>' +
      '</div>' +
      '<div class="msp-search-row" id="mspSearchRow"><input type="search" id="mspHeaderSearchInput" placeholder="Search books, batches..."></div>';

    var overlay = document.createElement('div');
    overlay.className = 'msp-drawer-overlay';
    overlay.id = 'mspDrawerOverlay';

    var drawer = document.createElement('div');
    drawer.className = 'msp-drawer';
    drawer.id = 'mspDrawer';
    var linksHtml = SECTIONS.map(function (s) {
      return '<a href="' + sectionHref(s.key) + '" data-section="' + s.key + '">' + s.icon + '<span>' + s.label + '</span></a>';
    }).join('');
    drawer.innerHTML =
      '<div class="msp-drawer-head"><span>Menu</span><button class="msp-drawer-close" id="mspDrawerClose">&#10005;</button></div>' +
      '<nav>' + linksHtml + '</nav>' +
      '<div class="msp-drawer-foot">&copy; myselectionprep. All rights reserved.</div>';

    document.body.insertBefore(overlay, document.body.firstChild);
    document.body.insertBefore(drawer, document.body.firstChild);
    document.body.insertBefore(header, document.body.firstChild);
  }

  function wireScrollHide() {
    var header = document.getElementById('mspHeader');
    var lastY = window.pageYOffset || 0;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.pageYOffset || 0;
        if (y > lastY && y > 60) {
          header.classList.add('msp-hide');
        } else {
          header.classList.remove('msp-hide');
        }
        lastY = y <= 0 ? 0 : y;
        ticking = false;
      });
    }, { passive: true });
  }

  function wireSearch() {
    var btn = document.getElementById('mspSearchBtn');
    var row = document.getElementById('mspSearchRow');
    var input = document.getElementById('mspHeaderSearchInput');
    var pageInput = document.getElementById('globalSearch'); // index.html's own catalogue search, if present

    btn.addEventListener('click', function () {
      var open = row.classList.toggle('msp-open');
      if (open) setTimeout(function () { input.focus(); }, 200);
    });

    input.addEventListener('input', function () {
      if (pageInput) {
        pageInput.value = input.value;
        pageInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      if (!pageInput) {
        window.location.href = 'index.html?q=' + encodeURIComponent(input.value);
      }
    });

    // Arrived via ?q=... from another page (search used before navigating) — apply it once.
    if (pageInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        row.classList.add('msp-open');
        input.value = q;
        pageInput.value = q;
        pageInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-msp-theme', theme);
    var btn = document.getElementById('mspThemeBtn');
    if (btn) btn.innerHTML = theme === 'dark' ? svgSun() : svgMoon();
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  function wireTheme() {
    var saved = 'light';
    try { saved = localStorage.getItem(THEME_KEY) || 'light'; } catch (e) {}
    applyTheme(saved);
    document.getElementById('mspThemeBtn').addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-msp-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  function wireDrawer() {
    var menuBtn = document.getElementById('mspMenuBtn');
    var drawer = document.getElementById('mspDrawer');
    var overlay = document.getElementById('mspDrawerOverlay');
    var closeBtn = document.getElementById('mspDrawerClose');

    function open() {
      drawer.classList.add('msp-open');
      overlay.classList.add('msp-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.classList.remove('msp-open');
      overlay.classList.remove('msp-open');
      document.body.style.overflow = '';
    }
    menuBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);

    var params = new URLSearchParams(window.location.search);
    var activeSection = params.get('section') || (isIndexPage() ? 'all' : null);
    if (activeSection) {
      var link = drawer.querySelector('a[data-section="' + activeSection + '"]');
      if (link) link.classList.add('msp-active');
    }
  }

  function init() {
    injectStyle();
    buildHeader();
    wireScrollHide();
    wireSearch();
    wireTheme();
    wireDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
