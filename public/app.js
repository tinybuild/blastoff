const API = '';
let currentProduct = null;

// --- Navigation ---
document.querySelectorAll('.nav-link[data-view]').forEach(link => {
  link.addEventListener('click', () => showView(link.dataset.view));
});

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
  document.querySelectorAll('.nav-link[data-view]').forEach(l => l.classList.remove('is-active'));

  if (name === 'home') {
    document.getElementById('view-home').classList.add('is-active');
  } else if (name === 'products') {
    document.getElementById('view-products').classList.add('is-active');
    loadProducts();
  } else if (name === 'directories') {
    document.getElementById('view-directories').classList.add('is-active');
    loadAllDirectories();
  } else if (name === 'product') {
    document.getElementById('view-product').classList.add('is-active');
  }

  const activeLink = document.querySelector(`.nav-link[data-view="${name}"]`);
  if (activeLink) activeLink.classList.add('is-active');
}

// --- Extract URL ---
document.getElementById('extract-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('url-input').value.trim();
  if (!url) return;

  const btn = document.getElementById('extract-btn');
  btn.disabled = true;
  btn.textContent = 'Extracting…';

  try {
    const res = await fetch(`${API}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const product = await res.json();
    populateExtractedProduct(product);
    document.getElementById('extracted-product').style.display = 'block';

    // Auto-save so we have an id for regenerate + auto-save edits
    const saveRes = await fetch(`${API}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const { id } = await saveRes.json();
    currentProduct._id = id;
    setSaveStatus('Saved');
  } catch (err) {
    console.error('Extract failed:', err);
    setSaveStatus('Extract failed', true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Extract';
  }
});

function populateExtractedProduct(product) {
  currentProduct = { ...product };

  // Logo
  const logoContainer = document.getElementById('product-logo-container');
  if (product.logo_url) {
    logoContainer.innerHTML = `<img class="product-logo" src="${esc(product.logo_url)}" alt="Logo" onerror="this.outerHTML='<div class=product-logo-placeholder>?</div>'">`;
  } else {
    logoContainer.innerHTML = '<div class="product-logo-placeholder">?</div>';
  }

  // Header display
  document.getElementById('product-display-name').textContent = product.name || 'Untitled';
  document.getElementById('product-display-tagline').textContent = product.tagline || 'No 60-char tagline yet';
  const urlEl = document.getElementById('product-display-url');
  urlEl.textContent = product.url;
  urlEl.href = product.url;

  // Fill all fields
  document.querySelectorAll('#extracted-product [data-field]').forEach(input => {
    const field = input.dataset.field;
    input.value = product[field] || '';
  });

  // Refresh char counters + ✓/⚠ states
  document.querySelectorAll('#extracted-product .variant-row').forEach(refreshVariantRow);

  // Render screenshot gallery
  renderScreenshots(product.screenshots || []);
}

// ─── Screenshots ───────────────────────────────────────────────

// Each entry is {raw, framed}. Legacy strings still arrive from the API normalized as objects.
function renderScreenshots(shots) {
  const gallery = document.getElementById('screenshots-gallery');
  if (!gallery) return;
  gallery.innerHTML = '';
  shots.forEach((s, i) => {
    const shot = typeof s === 'string' ? { raw: s, framed: null } : s;
    const display = shot.framed || shot.raw;
    const downloadUrl = shot.framed || shot.raw;
    const downloadName = `${currentProduct?.name || 'screenshot'}-${i + 1}.png`.replace(/\s+/g, '-').toLowerCase();
    const card = document.createElement('div');
    card.className = 'screenshot-card';
    card.innerHTML = `
      <div class="screenshot-frame ${shot.framed ? 'is-prerendered' : ''}">
        <img src="${esc(display)}" alt="Screenshot ${i + 1}" loading="lazy">
      </div>
      <div class="screenshot-meta">
        <span class="screenshot-index">${i === 0 ? 'Hero · ' : ''}${i + 1} of ${shots.length}</span>
        <span class="screenshot-actions">
          <a class="screenshot-download" href="${esc(downloadUrl)}" download="${esc(downloadName)}" title="Download ${shot.framed ? 'framed' : 'raw'} PNG">↓</a>
          <button class="screenshot-remove" data-url="${esc(shot.raw)}" title="Remove">×</button>
        </span>
      </div>
    `;
    gallery.appendChild(card);
  });
}

// Render the screenshot inside BlastOff's signature frame on a canvas.
// Returns a PNG Blob. Output is 1600×1000 — fits 16:10 directories cleanly.
async function generateFramedPng(file) {
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = URL.createObjectURL(file);
  });
  const W = 1600, H = 1000;
  const PAD = 102;
  const OUTER_R = 40;
  const INNER_R = 20;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Outer rounded clip + gradient background
  roundRectPath(ctx, 0, 0, W, H, OUTER_R);
  ctx.clip();
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#ffeed9');
  grad.addColorStop(0.5, '#ffd9c0');
  grad.addColorStop(1, '#ffb89a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Inner image area + drop shadow
  const ix = PAD, iy = PAD, iw = W - PAD * 2, ih = H - PAD * 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#fff';
  roundRectPath(ctx, ix, iy, iw, ih, INNER_R);
  ctx.fill();
  ctx.restore();

  // Clip to inner rounded rect, draw image with object-fit: cover semantics
  ctx.save();
  roundRectPath(ctx, ix, iy, iw, ih, INNER_R);
  ctx.clip();
  const imgAR = img.naturalWidth / img.naturalHeight;
  const innerAR = iw / ih;
  let dw, dh, dx, dy;
  if (imgAR > innerAR) {
    dh = ih; dw = dh * imgAR; dx = ix + (iw - dw) / 2; dy = iy;
  } else {
    dw = iw; dh = dw / imgAR; dx = ix; dy = iy + (ih - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/png');
  });
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function uploadScreenshot(file) {
  if (!currentProduct?._id) {
    setSaveStatus('Save product first', true);
    return;
  }
  if (!file.type.startsWith('image/')) {
    setSaveStatus('Only images allowed', true);
    return;
  }
  setSaveStatus('Framing…');
  let framed = null;
  try { framed = await generateFramedPng(file); } catch (err) { console.warn('Frame generation failed, uploading raw only', err); }
  setSaveStatus('Uploading…');
  const fd = new FormData();
  fd.append('file', file);
  if (framed) fd.append('framed', framed, 'framed.png');
  fd.append('product_id', currentProduct._id);
  try {
    const res = await fetch(`${API}/api/upload`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
    const data = await res.json();
    currentProduct.screenshots = data.screenshots;
    renderScreenshots(data.screenshots);
    setSaveStatus('Saved');
  } catch (err) {
    setSaveStatus(err.message, true);
  }
}

async function removeScreenshot(url) {
  if (!currentProduct?._id) return;
  setSaveStatus('Removing…');
  try {
    const res = await fetch(`${API}/api/upload`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: currentProduct._id, url }),
    });
    if (!res.ok) throw new Error('Remove failed');
    const data = await res.json();
    currentProduct.screenshots = data.screenshots;
    renderScreenshots(data.screenshots);
    setSaveStatus('Saved');
  } catch (err) {
    setSaveStatus(err.message, true);
  }
}

// Drag-drop + file picker
const dropzone = document.getElementById('screenshot-dropzone');
const fileInput = document.getElementById('screenshot-input');
if (dropzone && fileInput) {
  fileInput.addEventListener('change', async (e) => {
    for (const file of e.target.files) await uploadScreenshot(file);
    fileInput.value = '';
  });
  ['dragenter', 'dragover'].forEach(ev => dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add('is-dragover');
  }));
  ['dragleave', 'drop'].forEach(ev => dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove('is-dragover');
  }));
  dropzone.addEventListener('drop', async (e) => {
    for (const file of e.dataTransfer.files) await uploadScreenshot(file);
  });
}
document.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.screenshot-remove');
  if (removeBtn) removeScreenshot(removeBtn.dataset.url);
});

function refreshVariantRow(row) {
  const input = row.querySelector('[data-field]');
  const counter = row.querySelector('.char-counter');
  if (!input) return;
  const limit = parseInt(row.dataset.limit, 10);
  const len = (input.value || '').length;
  if (counter && limit) {
    counter.textContent = `${len} / ${limit}`;
    counter.classList.toggle('over', len > limit);
    counter.classList.toggle('empty', len === 0);
  }
  row.classList.toggle('row-ready', len > 0 && (!limit || len <= limit));
  row.classList.toggle('row-empty', len === 0);
  row.classList.toggle('row-over', !!limit && len > limit);

  // Mirror 60-char tagline into header preview
  if (input.dataset.field === 'tagline') {
    document.getElementById('product-display-tagline').textContent = input.value || 'No 60-char tagline yet';
  }
  if (input.dataset.field === 'name') {
    document.getElementById('product-display-name').textContent = input.value || 'Untitled';
  }
}

// --- Live char counters + debounced auto-save ---
let saveTimer = null;
function scheduleSave() {
  setSaveStatus('Saving…');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveProfile, 600);
}

async function saveProfile() {
  if (!currentProduct?._id) return;
  const data = collectProfileData();
  try {
    await fetch(`${API}/api/products/${currentProduct._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    Object.assign(currentProduct, data);
    setSaveStatus('Saved');
  } catch (err) {
    setSaveStatus('Save failed', true);
  }
}

function collectProfileData() {
  const data = {};
  document.querySelectorAll('#extracted-product [data-field]').forEach(input => {
    data[input.dataset.field] = input.value;
  });
  return data;
}

function setSaveStatus(text, isError = false) {
  const el = document.getElementById('profile-save-status');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('is-error', isError);
}

document.addEventListener('input', (e) => {
  const input = e.target.closest('#extracted-product [data-field]');
  if (!input) return;
  const row = input.closest('.variant-row');
  if (row) refreshVariantRow(row);
  scheduleSave();
});

// --- Regenerate button ---
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-regen');
  if (!btn) return;
  if (!currentProduct?._id) {
    setSaveStatus('Save first', true);
    return;
  }
  const field = btn.dataset.regen;
  const row = btn.closest('.variant-row');
  const limit = row?.dataset.limit ? parseInt(row.dataset.limit, 10) : null;
  const input = row?.querySelector('[data-field]');
  if (!input) return;

  btn.disabled = true;
  btn.classList.add('is-loading');
  setSaveStatus('Regenerating…');

  try {
    // Flush any pending save first so Claude sees latest context
    clearTimeout(saveTimer);
    await saveProfile();

    const res = await fetch(`${API}/api/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: currentProduct._id, field, char_limit: limit }),
    });
    if (!res.ok) throw new Error('Regen failed');
    const { value } = await res.json();
    input.value = value;
    refreshVariantRow(row);
    scheduleSave();
  } catch (err) {
    setSaveStatus('Regen failed', true);
  } finally {
    btn.disabled = false;
    btn.classList.remove('is-loading');
  }
});

// --- See cockpit ---
document.getElementById('see-cockpit-btn').addEventListener('click', async () => {
  if (!currentProduct?._id) return;
  await saveProfile();
  await loadProductDetail(currentProduct._id);
  showView('product');
});

// --- Load Product Detail ---
async function loadProductDetail(id) {
  const res = await fetch(`${API}/api/products/${id}`);
  const { product, submissions, fields } = await res.json();
  currentProduct = product;
  currentProduct._id = id;

  renderProductDetail(product, submissions, fields);
}

function renderProductDetail(product, submissions, fields) {
  // Product card
  const card = document.getElementById('detail-product-card');
  card.innerHTML = `
    <div class="product-header">
      ${product.logo_url
        ? `<img class="product-logo" src="${esc(product.logo_url)}" alt="Logo" onerror="this.outerHTML='<div class=product-logo-placeholder>?</div>'">`
        : '<div class="product-logo-placeholder">?</div>'}
      <div class="product-info">
        <h2>${esc(product.name || 'Untitled')}</h2>
        <div class="tagline">${esc(product.tagline || '')}</div>
        <a class="product-url" href="${esc(product.url)}" target="_blank">${esc(product.url)}</a>
      </div>
    </div>
  `;

  // Group fields by directory
  const fieldsByDir = {};
  fields.forEach(f => {
    if (!fieldsByDir[f.directory_id]) fieldsByDir[f.directory_id] = [];
    fieldsByDir[f.directory_id].push(f);
  });

  // Calculate readiness per submission
  const enriched = submissions.map(sub => {
    const dirFields = fieldsByDir[sub.directory_id] || [];
    const required = dirFields.filter(f => f.is_required);
    const filled = required.filter(f => {
      const val = product[f.field_name];
      return val && val.trim && val.trim() !== '';
    });
    const readiness = required.length === 0 ? 1 : filled.length / required.length;
    return { ...sub, dirFields, requiredCount: required.length, filledCount: filled.length, readiness };
  });

  // Stats
  const ready = enriched.filter(s => s.readiness === 1 && s.status === 'not_started').length;
  const missing = enriched.filter(s => s.readiness < 1 && s.status === 'not_started').length;
  const submitted = enriched.filter(s => s.status === 'submitted').length;
  const approved = enriched.filter(s => s.status === 'approved').length;

  document.getElementById('directory-stats').innerHTML = `
    <span class="stat-pill ready">${ready} ready</span>
    <span class="stat-pill missing">${missing} need info</span>
    ${submitted ? `<span class="stat-pill submitted">${submitted} submitted</span>` : ''}
    ${approved ? `<span class="stat-pill ready">${approved} live</span>` : ''}
  `;

  // Render directory rows
  renderDirectoryRows(enriched, product);

  // Filter pills
  document.querySelectorAll('#filter-bar .filter-pill').forEach(pill => {
    pill.onclick = () => {
      document.querySelectorAll('#filter-bar .filter-pill').forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      filterDirectories(pill.dataset.filter, enriched, product);
    };
  });
}

function renderDirectoryRows(submissions, product) {
  const list = document.getElementById('directory-list');
  list.innerHTML = submissions.map(sub => {
    let statusClass, statusIcon;
    if (sub.status === 'approved') { statusClass = 'approved'; statusIcon = '&#10003;'; }
    else if (sub.status === 'submitted') { statusClass = 'submitted'; statusIcon = '&#8594;'; }
    else if (sub.readiness === 1) { statusClass = 'ready'; statusIcon = '&#10003;'; }
    else if (sub.readiness > 0) { statusClass = 'partial'; statusIcon = '&#189;'; }
    else { statusClass = 'missing'; statusIcon = '&#10007;'; }

    const missingFields = (sub.dirFields || [])
      .filter(f => f.is_required && (!product[f.field_name] || product[f.field_name].trim() === ''))
      .map(f => f.field_label);

    return `
      <div class="directory-row" data-status="${sub.status}" data-readiness="${sub.readiness}">
        <div class="dir-status ${statusClass}">${statusIcon}</div>
        <div class="dir-info">
          <div class="dir-name">${esc(sub.directory_name)}</div>
          <div class="dir-desc">${missingFields.length ? `Missing: ${missingFields.join(', ')}` : sub.status === 'not_started' ? 'Ready to submit' : sub.status}</div>
        </div>
        <div class="dir-meta">
          <span class="dir-badge">${esc(sub.directory_category)}</span>
          <span class="dir-fields-count">${sub.filledCount}/${sub.requiredCount} fields</span>
          <select class="status-select" data-submission-id="${sub.id}" onchange="updateStatus(this)">
            <option value="not_started" ${sub.status === 'not_started' ? 'selected' : ''}>Not started</option>
            <option value="submitted" ${sub.status === 'submitted' ? 'selected' : ''}>Submitted</option>
            <option value="approved" ${sub.status === 'approved' ? 'selected' : ''}>Approved</option>
            <option value="rejected" ${sub.status === 'rejected' ? 'selected' : ''}>Rejected</option>
          </select>
          <a href="${esc(sub.submit_url)}" target="_blank" class="dir-action btn btn-small btn-ghost">Open</a>
        </div>
      </div>
    `;
  }).join('');
}

function filterDirectories(filter, submissions, product) {
  let filtered = submissions;
  if (filter === 'ready') filtered = submissions.filter(s => s.readiness === 1 && s.status === 'not_started');
  else if (filter === 'missing') filtered = submissions.filter(s => s.readiness < 1 && s.status === 'not_started');
  else if (filter === 'submitted') filtered = submissions.filter(s => s.status === 'submitted');
  else if (filter === 'approved') filtered = submissions.filter(s => s.status === 'approved');

  renderDirectoryRows(filtered, product);
}

// --- Update submission status ---
window.updateStatus = async function(select) {
  const id = select.dataset.submissionId;
  const status = select.value;

  await fetch(`${API}/api/submissions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  // Reload to update stats
  if (currentProduct?._id) await loadProductDetail(currentProduct._id);
};

// --- Products List ---
async function loadProducts() {
  const list = document.getElementById('products-list');
  list.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

  try {
    const res = await fetch(`${API}/api/products`);
    const products = await res.json();

    if (products.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <h2>No products yet</h2>
          <p>Paste a URL on the Launch tab to get started.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = products.map(p => `
      <div class="product-row" onclick="openProduct(${p.id})">
        ${p.logo_url
          ? `<img class="product-row-logo" src="${esc(p.logo_url)}" alt="" onerror="this.style.display='none'">`
          : '<div class="product-row-logo"></div>'}
        <div class="product-row-info">
          <h3>${esc(p.name || 'Untitled')}</h3>
          <p>${esc(p.tagline || p.url)}</p>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<p style="color:var(--text-muted)">Failed to load products.</p>';
  }
}

window.openProduct = async function(id) {
  await loadProductDetail(id);
  showView('product');
};

// --- Back button ---
document.getElementById('back-to-products').addEventListener('click', () => {
  showView('products');
});

// --- All Directories View ---
async function loadAllDirectories() {
  const list = document.getElementById('all-directories-list');
  list.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

  try {
    const res = await fetch(`${API}/api/directories`);
    const dirs = await res.json();

    list.innerHTML = dirs.map(d => `
      <div class="directory-row">
        <div class="dir-info">
          <div class="dir-name">${esc(d.name)}</div>
          <div class="dir-desc">${esc(d.description || '')}</div>
        </div>
        <div class="dir-meta">
          <span class="dir-badge">${esc(d.category)}</span>
          <span class="dir-badge">${d.is_free ? 'Free' : 'Paid'}</span>
          <span class="dir-badge">${esc(d.approval_type)}</span>
          <a href="${esc(d.submit_url)}" target="_blank" class="btn btn-small btn-ghost">Visit</a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<p style="color:var(--text-muted)">Failed to load directories.</p>';
  }
}

// --- Utility ---
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
