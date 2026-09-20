/* ==== My Orders section — Firebase auth + fetch user's orders (with popup-blocked fallback) ==== */

/* ---- My Orders section ---- */
(function(){
  var auth = firebase.auth();
  var signedOutEl = document.getElementById('ordersSignedOut');
  var loadingEl = document.getElementById('ordersLoading');
  var emptyEl = document.getElementById('ordersEmpty');
  var listEl = document.getElementById('ordersList');
  var signInBtn = document.getElementById('ordersSignInBtn');
  var accountBarEl = document.getElementById('ordersAccountBar');
  var accountPhotoEl = document.getElementById('ordersAccountPhoto');
  var accountNameEl = document.getElementById('ordersAccountName');
  var accountEmailEl = document.getElementById('ordersAccountEmail');

  /* Fallback avatar (initials, self-contained inline SVG) shown if the
     Google account has no photo, or the photo URL fails to load. */
  function initialsAvatar(name){
    var palette = ['#2953ff','#7C3AED','#DB2777','#EA580C','#12b76a','#0891B2'];
    var seed = name || 'U';
    var hash = 0;
    for (var i = 0; i < seed.length; i++) { hash = seed.charCodeAt(i) + ((hash << 5) - hash); }
    var color = palette[Math.abs(hash) % palette.length];
    var parts = seed.trim().split(/\s+/);
    var initials = (parts[0] ? parts[0][0] : 'U') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76">'
      + '<rect width="76" height="76" rx="38" fill="' + color + '"/>'
      + '<text x="38" y="50" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">' + initials.toUpperCase() + '</text>'
      + '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function showAccountBar(user){
    if (!accountBarEl) return;
    var displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
    accountNameEl.textContent = displayName;
    accountEmailEl.textContent = user.email || '';
    accountPhotoEl.alt = displayName;
    accountPhotoEl.src = user.photoURL || initialsAvatar(displayName);
    accountPhotoEl.onerror = function(){
      accountPhotoEl.onerror = null;
      accountPhotoEl.src = initialsAvatar(displayName);
    };
    accountBarEl.style.display = 'flex';
  }

  function hideAccountBar(){
    if (!accountBarEl) return;
    accountBarEl.style.display = 'none';
    accountPhotoEl.src = '';
  }

  /* Clicking the account bar asks for confirmation before signing out —
     no accidental sign-outs from a stray tap. */
  if (accountBarEl) {
    accountBarEl.addEventListener('click', function(){
      var currentUser = auth.currentUser;
      var label = (currentUser && currentUser.email) ? currentUser.email : 'is Google account';
      var confirmed = confirm('Kya aap ' + label + ' ko sign out karna chahte hain?');
      if (confirmed) {
        auth.signOut().catch(function(err){ console.error('Sign-out error:', err); });
      }
    });
  }

  /* Popups get silently blocked inside in-app browsers (Telegram, Instagram, etc.)
     and some mobile browsers — in that case Firebase throws (or the popup just
     never opens) and, before this fix, we only logged it to the console, so the
     button looked "dead". Now we fall back to a full-page redirect sign-in and
     also show the person a visible message if sign-in truly fails. */
  function isPopupBlockedErr(err){
    return err && (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/popup-closed-by-user' ||
      err.code === 'auth/cancelled-popup-request' ||
      err.code === 'auth/operation-not-supported-in-this-environment'
    );
  }

  if (signInBtn) {
    signInBtn.addEventListener('click', function(){
      var provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).catch(function(err){
        console.error('Sign-in popup error:', err);
        if (isPopupBlockedErr(err)) {
          auth.signInWithRedirect(provider).catch(function(err2){
            console.error('Sign-in redirect error:', err2);
            alert('Sign in nahi ho paya. Kripya browser ka popup blocker check karein ya dusre browser mein try karein.');
          });
          return;
        }
        alert('Sign in nahi ho paya. Dobara try karein.');
      });
    });
  }

  /* Completes the redirect-based sign-in flow above, and surfaces any error
     that happened during the redirect round trip. */
  auth.getRedirectResult().catch(function(err){
    console.error('Redirect sign-in error:', err);
  });

  function statusLabel(s){
    if (s === 'approved') return 'Approved';
    if (s === 'rejected') return 'Rejected';
    return 'Pending';
  }

  /* Ek skeleton order-card — asli order-card jaisi hi shape (thumb + naam line +
     date/price line + status pill), bas shimmer blocks ke saath. Orders fetch hone
     tak 3 iske dikhte hain, load hote hi asli list se replace ho jaate hain. */
  function orderSkeletonHTML(){
    return '<div class="order-card skeleton-card" aria-hidden="true"><div class="row">'
      + '<div class="thumb"><span class="sk-block" style="width:42px;height:42px;border-radius:10px;"></span></div>'
      + '<div class="info">'
      + '<span class="sk-block" style="width:72%;height:12px;margin-bottom:6px;"></span>'
      + '<span class="sk-block" style="width:42%;height:10px;"></span>'
      + '</div>'
      + '<span class="sk-block" style="width:60px;height:22px;border-radius:20px;"></span>'
      + '</div></div>';
  }

  function orderCardHTML(o){
    var isBatch = o.category !== 'book';
    var showJoin = isBatch && o.status === 'approved' && o.inviteLink;
    var icon = isBatch
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>';
    var dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : '';
    var joinBtn = showJoin
      ? '<a class="order-join-btn" href="' + o.inviteLink + '" target="_blank" rel="noopener"><svg width="14" height="14" viewBox="0 0 240 240" fill="currentColor"><path d="M120 0C53.7 0 0 53.7 0 120s53.7 120 120 120 120-53.7 120-120S186.3 0 120 0zm55.6 82.1l-19.4 91.4c-1.5 6.6-5.3 8.2-10.7 5.1l-29.6-21.8-14.3 13.7c-1.6 1.6-2.9 2.9-6 2.9l2.1-30.2 55-49.7c2.4-2.1-.5-3.3-3.7-1.2l-68 42.8-29.3-9.2c-6.4-2-6.5-6.4 1.3-9.4l114.6-44.2c5.3-2 9.9 1.3 8.2 9.8z"/></svg>Join Telegram</a>'
      : '';
    return '<div class="order-card"><div class="row"><div class="thumb">' + icon + '</div>'
      + '<div class="info"><div class="n">' + (o.productName || '') + '</div>'
      + '<div class="m">' + dateStr + (dateStr ? ' &middot; ' : '') + '₹' + (o.price || '') + '</div></div>'
      + '<div class="order-pill ' + o.status + '">' + statusLabel(o.status) + '</div></div>'
      + joinBtn + '</div>';
  }

  function loadOrders(user){
    signedOutEl.style.display = 'none';
    loadingEl.innerHTML = orderSkeletonHTML() + orderSkeletonHTML() + orderSkeletonHTML();
    loadingEl.style.display = 'block';
    emptyEl.style.display = 'none';
    listEl.innerHTML = '';

    user.getIdToken().then(function(idToken){
      return fetch('/.netlify/functions/get-my-orders', {
        headers: { 'Authorization': 'Bearer ' + idToken }
      });
    }).then(function(res){ return res.json(); }).then(function(orders){
      loadingEl.style.display = 'none';
      if (!orders || !orders.length) {
        emptyEl.style.display = 'block';
        return;
      }
      listEl.innerHTML = orders.map(orderCardHTML).join('');
    }).catch(function(){
      loadingEl.style.display = 'none';
      emptyEl.textContent = 'Orders load nahi ho paaye';
      emptyEl.style.display = 'block';
    });
  }

  auth.onAuthStateChanged(function(user){
    if (user) {
      showAccountBar(user);
      loadOrders(user);
    } else {
      hideAccountBar();
      loadingEl.style.display = 'none';
      emptyEl.style.display = 'none';
      listEl.innerHTML = '';
      signedOutEl.style.display = 'block';
    }
  });
})();

