/* ==== Shared Admin logic — used by both admin-batches and admin-books pages ====
   Each page sets `var ADMIN_CATEGORY = 'batch'` or `'book'` BEFORE loading this file. */

let ADMIN_PASSWORD = '';

function getVal(id){
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
function setVal(id, val){
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function checkPassword(){
  const input = document.getElementById('passwordInput').value;
  if (!input) return;
  ADMIN_PASSWORD = input;
  document.getElementById('gateScreen').style.display = 'none';
  document.getElementById('mainPanel').style.display = 'block';
  renderDemoItems();
  updateVisibilityLabel();
  loadExistingProducts();
}

function slugify(name){
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

function onNameChange(){
  const slugField = document.getElementById('fSlug');
  if (!slugField.dataset.locked) {
    slugField.value = slugify(document.getElementById('fName').value);
  }
  updatePreview();
}

/* ---- PUBLIC / PRIVATE visibility toggle ---- */
function updateVisibilityLabel(){
  const toggle = document.getElementById('fVisibility');
  const label = document.getElementById('visibilityLabel');
  if (!toggle || !label) return;
  const isPublic = toggle.checked;
  label.textContent = isPublic
    ? '🌍 Public — site pe sabko dikhega'
    : '🔒 Private — sirf tum dekh paoge (testing mode)';
  label.className = 'visibility-main ' + (isPublic ? 'pub' : 'priv');
  updatePreview();
}

function updatePreview(){
  const name = document.getElementById('fName').value || 'Product ka naam yahan aayega';
  const price = document.getElementById('fPrice').value.trim();
  const icon = document.getElementById('fIcon').value || '📗';
  const cardImage = document.getElementById('fCardImage').value;
  const visToggle = document.getElementById('fVisibility');
  const isPublic = !visToggle || visToggle.checked;

  document.getElementById('prevName').textContent = name;
  document.getElementById('prevPrice').textContent = (!price || Number(price) === 0) ? 'FREE' : ('₹' + price);

  const imgBox = document.getElementById('prevImg');
  if (cardImage) {
    imgBox.innerHTML = `<img src="${cardImage}" onerror="this.parentElement.innerHTML='${icon}'">`;
  } else {
    imgBox.textContent = icon;
  }

  const previewCard = document.querySelector('.preview-card');
  if (previewCard) {
    let pill = previewCard.querySelector('.visibility-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.className = 'visibility-pill';
      previewCard.insertBefore(pill, previewCard.firstChild);
    }
    pill.textContent = isPublic ? '🌍 PUBLIC' : '🔒 PRIVATE';
    pill.classList.toggle('pub', isPublic);
    pill.classList.toggle('priv', !isPublic);
  }
}

let demoItems = [];

function handleDragOver(e){
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
}
function handleDragLeave(e){
  e.currentTarget.classList.remove('dragover');
}
function handleDropToInput(e, inputId){
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (!files || !files.length) return;
  const inputEl = document.getElementById(inputId);
  inputEl.files = files;
  inputEl.dispatchEvent(new Event('change', { bubbles: true }));
}

function addDemoItem(type){
  demoItems.push({ type: type, thumbUrl: '', videoUrl: '' });
  renderDemoItems();
}

function removeDemoItem(idx){
  demoItems.splice(idx, 1);
  renderDemoItems();
}

function updateDemoVideoUrl(idx, val){
  demoItems[idx].videoUrl = val;
  syncDemoMediaField();
}

function syncDemoMediaField(){
  const lines = demoItems.map(item => {
    if (item.type === 'video') return `video|${item.thumbUrl}|${item.videoUrl}`;
    return `image|${item.thumbUrl}`;
  });
  document.getElementById('fDemoMedia').value = lines.join('\n');
}

function renderDemoItems(){
  const el = document.getElementById('demoItemsList');
  if (!demoItems.length) {
    el.innerHTML = '<div class="empty">Koi demo photo/video add nahi kiya abhi</div>';
    syncDemoMediaField();
    return;
  }
  el.innerHTML = demoItems.map((item, idx) => `
    <div class="existing-item" style="align-items:flex-start;">
      <div class="thumb" style="width:52px;height:52px;">
        ${item.thumbUrl ? `<img src="${item.thumbUrl}">` : (item.type === 'video' ? '🎬' : '🖼️')}
      </div>
      <div class="info">
        <div class="n" style="margin-bottom:6px;">${item.type === 'video' ? '🎬 Video' : '🖼️ Photo'} #${idx + 1}</div>
        <input type="file" accept="image/*" id="demoThumbFile${idx}" onchange="uploadDemoThumb(this, ${idx})" style="display:none;">
        <div class="dropzone" style="padding:14px;" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDropToInput(event,'demoThumbFile${idx}')" onclick="document.getElementById('demoThumbFile${idx}').click()">
          <div class="dropzone-hint" style="margin:0;">📷 Click ya drag karke photo upload karo</div>
        </div>
        <div class="upload-status" id="demoThumbStatus${idx}"></div>
        ${item.type === 'video' ? `<input type="text" placeholder="Video URL (YouTube/mp4/Telegram link)" value="${item.videoUrl.replace(/"/g,'&quot;')}" oninput="updateDemoVideoUrl(${idx}, this.value)">` : ''}
      </div>
      <button class="delete-btn" onclick="removeDemoItem(${idx})">✕</button>
    </div>
  `).join('');
  syncDemoMediaField();
}

function uploadDemoThumb(fileInputEl, idx){
  const file = fileInputEl.files[0];
  if (!file) return;
  const statusEl = document.getElementById('demoThumbStatus' + idx);
  if (statusEl) { statusEl.textContent = 'Upload ho raha hai...'; statusEl.style.color = 'var(--muted)'; }

  const reader = new FileReader();
  reader.onload = async function(e){
    const base64 = e.target.result.split(',')[1];
    try {
      const res = await fetch('/.netlify/functions/upload-image', {
        method: 'POST',
        body: JSON.stringify({ password: ADMIN_PASSWORD, image: base64 })
      });
      const result = await res.json();
      if (res.status === 401) {
        if (statusEl) { statusEl.textContent = 'Galat password — upload nahi hua'; statusEl.style.color = '#991B1B'; }
        return;
      }
      if (result.success) {
        demoItems[idx].thumbUrl = result.url;
        renderDemoItems();
      } else {
        if (statusEl) { statusEl.textContent = 'Upload fail: ' + (result.error || 'unknown error'); statusEl.style.color = '#991B1B'; }
      }
    } catch (err) {
      if (statusEl) { statusEl.textContent = 'Upload fail: ' + err.message; statusEl.style.color = '#991B1B'; }
    }
  };
  reader.readAsDataURL(file);
}

function parseDemoMediaString(text){
  const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    const parts = line.split('|').map(p => p.trim());
    if (parts[0] === 'video') return { type: 'video', thumbUrl: parts[1] || '', videoUrl: parts[2] || '' };
    return { type: 'image', thumbUrl: parts[1] || '', videoUrl: '' };
  });
}

function handleImageUpload(fileInputEl, hiddenInputId, previewId){
  const file = fileInputEl.files[0];
  if (!file) return;

  const statusEl = document.getElementById(previewId + 'Status');
  const previewEl = document.getElementById(previewId);
  statusEl.textContent = 'Upload ho raha hai...';
  statusEl.style.color = 'var(--muted)';

  const reader = new FileReader();
  reader.onload = async function(e){
    const base64 = e.target.result.split(',')[1];
    try {
      const res = await fetch('/.netlify/functions/upload-image', {
        method: 'POST',
        body: JSON.stringify({ password: ADMIN_PASSWORD, image: base64 })
      });
      const result = await res.json();

      if (res.status === 401) {
        statusEl.textContent = 'Galat password — upload nahi hua';
        statusEl.style.color = '#991B1B';
        return;
      }

      if (result.success) {
        document.getElementById(hiddenInputId).value = result.url;
        previewEl.src = result.url;
        previewEl.style.display = 'block';
        statusEl.textContent = 'Upload ho gaya ✅';
        statusEl.style.color = '#047857';
        if (hiddenInputId === 'fCardImage') updatePreview();
      } else {
        statusEl.textContent = 'Upload fail: ' + (result.error || 'unknown error');
        statusEl.style.color = '#991B1B';
      }
    } catch (err) {
      statusEl.textContent = 'Upload fail: ' + err.message;
      statusEl.style.color = '#991B1B';
    }
  };
  reader.readAsDataURL(file);
}

function clearForm(){
  document.getElementById('fName').value = '';
  document.getElementById('fSlug').value = '';
  document.getElementById('fSlug').dataset.locked = '';
  document.getElementById('fIcon').value = '📗';
  document.getElementById('fPrice').value = '';
  document.getElementById('fBy').value = '';
  document.getElementById('fDesc').value = '';
  document.getElementById('fDuration').value = '';
  document.getElementById('fDemo').value = '';
  document.getElementById('fCardImage').value = '';
  document.getElementById('fQrImage').value = '';
  const channelField = document.getElementById('fChannel');
  if (channelField) channelField.value = '';

  const visToggle = document.getElementById('fVisibility');
  if (visToggle) visToggle.checked = true; // naya product default PUBLIC
  updateVisibilityLabel();

  document.getElementById('fBannerImage').value = '';
  document.getElementById('fPlanBadge').value = '';
  document.getElementById('fOverview').value = '';
  document.getElementById('fFullDescription').value = '';
  document.getElementById('fDemoMedia').value = '';
  document.getElementById('fTopics').value = '';
  setVal('fPreviewImages', '');
  setVal('fExamTags', '');
  setVal('fAuthor', '');
  setVal('fPublisher', '');
  setVal('fPagesCount', '');
  setVal('fLanguage', '');
  setVal('fRatingText', '');
  setVal('fDownloadsText', '');
  setVal('fFileSize', '');
  setVal('fDownloadLink', '');
  setVal('fOldPrice', '');
  document.getElementById('fBannerImageFile').value = '';
  document.getElementById('bannerImgPreview').style.display = 'none';
  document.getElementById('bannerImgPreviewStatus').textContent = '';
  demoItems = [];
  renderDemoItems();

  document.getElementById('fCardImageFile').value = '';
  document.getElementById('fQrImageFile').value = '';
  document.getElementById('cardImgPreview').style.display = 'none';
  document.getElementById('qrImgPreview').style.display = 'none';
  document.getElementById('cardImgPreviewStatus').textContent = '';
  document.getElementById('qrImgPreviewStatus').textContent = '';

  updatePreview();
}

async function saveProduct(){
  syncDemoMediaField();
  const name = document.getElementById('fName').value.trim();
  const slug = document.getElementById('fSlug').value.trim();
  const price = document.getElementById('fPrice').value.trim();
  const isBatch = ADMIN_CATEGORY === 'batch';
  const visToggle = document.getElementById('fVisibility');
  const visibility = (visToggle && !visToggle.checked) ? 'private' : 'public';

  if (!name || !slug) {
    showStatus('error', 'Kripya naam aur ID zaroor bharein.');
    return;
  }

  const payload = {
    password: ADMIN_PASSWORD,
    id: slug,
    category: ADMIN_CATEGORY,
    name: name,
    icon: document.getElementById('fIcon').value.trim() || '📗',
    price: price ? Number(price) : 0,
    by: document.getElementById('fBy').value.trim(),
    desc: document.getElementById('fDesc').value.trim(),
    duration: document.getElementById('fDuration').value.trim(),
    demoHref: document.getElementById('fDemo').value.trim(),
    cardImage: document.getElementById('fCardImage').value.trim(),
    qr: document.getElementById('fQrImage').value.trim(),
    channelId: isBatch ? (document.getElementById('fChannel') ? document.getElementById('fChannel').value.trim() : '') : '',
    visibility: visibility,

    bannerImage: document.getElementById('fBannerImage').value.trim(),
    planBadge: document.getElementById('fPlanBadge').value.trim(),
    overview: document.getElementById('fOverview').value.trim(),
    fullDescription: document.getElementById('fFullDescription').value.trim(),
    demoMedia: document.getElementById('fDemoMedia').value.trim(),
    topics: document.getElementById('fTopics').value.trim(),

    previewImages: getVal('fPreviewImages'),
    examTags: getVal('fExamTags'),
    author: getVal('fAuthor'),
    publisher: getVal('fPublisher'),
    pagesCount: getVal('fPagesCount'),
    language: getVal('fLanguage'),
    ratingText: getVal('fRatingText'),
    downloadsText: getVal('fDownloadsText'),
    fileSize: getVal('fFileSize'),
    downloadLink: getVal('fDownloadLink'),
    oldPrice: getVal('fOldPrice'),
    pdfLink: getVal('fPdfLink')
  };

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const res = await fetch('/.netlify/functions/save-product', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (res.status === 401) {
      showStatus('error', 'Galat password — save nahi hua.');
    } else if (result.success) {
      showStatus('success', `✅ "${name}" save ho gaya! (${visibility === 'public' ? 'Public — site pe live hai' : 'Private — abhi sirf tumhe dikhega'})`);
      clearForm();
      loadExistingProducts();
    } else {
      showStatus('error', result.error || 'Kuch galat ho gaya.');
    }
  } catch (err) {
    showStatus('error', 'Save fail hua: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '✅ Save Product';
  }
}

function showStatus(type, msg){
  const el = document.getElementById('statusMsg');
  el.className = type;
  el.textContent = msg;
  el.scrollIntoView({behavior:'smooth', block:'center'});
  setTimeout(()=>{ el.style.display='none'; el.className=''; }, 5000);
}

async function loadExistingProducts(){
  const listEl = document.getElementById('existingList');
  try {
    const res = await fetch('/.netlify/functions/get-all-products');
    const allItems = await res.json();
    const items = allItems.filter(p => p.category === ADMIN_CATEGORY);
    if (!items.length) {
      listEl.innerHTML = '<div class="empty">Abhi tak Firebase se koi product add nahi hua</div>';
      return;
    }
    listEl.innerHTML = items.map(p => {
      const isPriv = p.visibility === 'private';
      return `
      <div class="existing-item">
        <div class="thumb">${p.cardImage ? `<img src="${p.cardImage}">` : (p.icon || '📦')}</div>
        <div class="info">
          <div class="n">${p.name} ${isPriv ? '<span class="vis-tag priv">🔒 Private</span>' : '<span class="vis-tag pub">🌍 Public</span>'}</div>
          <div class="p">${(!p.price || Number(p.price) === 0) ? 'FREE' : '₹' + p.price} · ${p.category}</div>
        </div>
        <div class="item-actions">
          <button class="edit-btn" onclick='editProduct(${JSON.stringify(p).replace(/'/g,"&#39;")})'>Edit</button>
          <button class="delete-btn" onclick="deleteProduct('${p.id}', '${p.name.replace(/'/g,"\\'")}')">Delete</button>
        </div>
      </div>`;
    }).join('');
  } catch (err) {
    listEl.innerHTML = '<div class="empty">Load nahi ho paya</div>';
  }
}

async function deleteProduct(id, name){
  const confirmed = confirm(`"${name}" ko permanently delete karna hai?\n\nYeh action wapas nahi ho sakta.`);
  if (!confirmed) return;

  try {
    const res = await fetch('/.netlify/functions/delete-product', {
      method: 'POST',
      body: JSON.stringify({ password: ADMIN_PASSWORD, id: id })
    });
    const result = await res.json();

    if (res.status === 401) {
      showStatus('error', 'Galat password — delete nahi hua.');
    } else if (result.success) {
      showStatus('success', `🗑️ "${name}" delete ho gaya.`);
      loadExistingProducts();
    } else {
      showStatus('error', result.error || 'Delete fail hua.');
    }
  } catch (err) {
    showStatus('error', 'Delete fail hua: ' + err.message);
  }
}

function editProduct(p){
  document.getElementById('fName').value = p.name || '';
  document.getElementById('fSlug').value = p.id || '';
  document.getElementById('fSlug').dataset.locked = '1';
  document.getElementById('fIcon').value = p.icon || '📗';
  document.getElementById('fPrice').value = p.price || '';
  document.getElementById('fBy').value = p.by || '';
  document.getElementById('fDesc').value = p.desc || '';
  document.getElementById('fDuration').value = p.duration || '';
  document.getElementById('fDemo').value = p.demoHref || '';
  document.getElementById('fCardImage').value = p.cardImage || '';
  document.getElementById('fQrImage').value = p.qr || '';
  const channelField = document.getElementById('fChannel');
  if (channelField) channelField.value = p.channelId || '';

  const visToggle = document.getElementById('fVisibility');
  if (visToggle) visToggle.checked = p.visibility !== 'private';
  updateVisibilityLabel();

  document.getElementById('fBannerImage').value = p.bannerImage || '';
  document.getElementById('fPlanBadge').value = p.planBadge || '';
  document.getElementById('fOverview').value = p.overview || '';
  document.getElementById('fFullDescription').value = p.fullDescription || '';
  document.getElementById('fDemoMedia').value = p.demoMedia || '';
  document.getElementById('fTopics').value = p.topics || '';

  setVal('fPreviewImages', p.previewImages);
  setVal('fExamTags', p.examTags);
  setVal('fAuthor', p.author);
  setVal('fPublisher', p.publisher);
  setVal('fPagesCount', p.pagesCount);
  setVal('fLanguage', p.language);
  setVal('fRatingText', p.ratingText);
  setVal('fDownloadsText', p.downloadsText);
  setVal('fFileSize', p.fileSize);
  setVal('fDownloadLink', p.downloadLink);
  setVal('fOldPrice', p.oldPrice);
  setVal('fPdfLink', p.pdfLink);

  demoItems = parseDemoMediaString(p.demoMedia);
  renderDemoItems();

  const bannerPreview = document.getElementById('bannerImgPreview');
  if (p.bannerImage) { bannerPreview.src = p.bannerImage; bannerPreview.style.display = 'block'; }
  else { bannerPreview.style.display = 'none'; }
  document.getElementById('bannerImgPreviewStatus').textContent = p.bannerImage ? 'Existing image' : '';
  document.getElementById('bannerImgPreviewStatus').style.color = 'var(--muted)';

  const cardPreview = document.getElementById('cardImgPreview');
  if (p.cardImage) { cardPreview.src = p.cardImage; cardPreview.style.display = 'block'; }
  else { cardPreview.style.display = 'none'; }

  const qrPreview = document.getElementById('qrImgPreview');
  if (p.qr) { qrPreview.src = p.qr; qrPreview.style.display = 'block'; }
  else { qrPreview.style.display = 'none'; }

  document.getElementById('cardImgPreviewStatus').textContent = p.cardImage ? 'Existing image' : '';
  document.getElementById('cardImgPreviewStatus').style.color = 'var(--muted)';
  document.getElementById('qrImgPreviewStatus').textContent = p.qr ? 'Existing image' : '';
  document.getElementById('qrImgPreviewStatus').style.color = 'var(--muted)';

  updatePreview();
  window.scrollTo({top:0, behavior:'smooth'});
}
  updatePreview();
  if (typeof updateOverviewAuto === 'function') updateOverviewAuto();
  if (typeof updateCardDescAuto === 'function') updateCardDescAuto();
  if (typeof updatePreviewExtended === 'function') updatePreviewExtended();
  window.scrollTo({top:0, behavior:'smooth'});

document.addEventListener('DOMContentLoaded', function(){
  updateVisibilityLabel();
  updatePreview();
});