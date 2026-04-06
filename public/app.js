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
  btn.textContent = 'Extracting...';

  try {
    const res = await fetch(`${API}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const product = await res.json();
    populateExtractedProduct(product);
    document.getElementById('extracted-product').style.display = 'block';
  } catch (err) {
    console.error('Extract failed:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Extract';
  }
});

function populateExtractedProduct(product) {
  currentProduct = product;

  // Logo
  const logoContainer = document.getElementById('product-logo-container');
  if (product.logo_url) {
    logoContainer.innerHTML = `<img class="product-logo" src="${esc(product.logo_url)}" alt="Logo" onerror="this.outerHTML='<div class=product-logo-placeholder>?</div>'">`;
  } else {
    logoContainer.innerHTML = '<div class="product-logo-placeholder">?</div>';
  }

  // Header display
  document.getElementById('product-display-name').textContent = product.name || 'Untitled';
  document.getElementById('product-display-tagline').textContent = product.tagline || 'No tagline extracted';
  const urlEl = document.getElementById('product-display-url');
  urlEl.textContent = product.url;
  urlEl.href = product.url;

  // Fill all fields
  document.querySelectorAll('[data-field]').forEach(input => {
    const field = input.dataset.field;
    input.value = product[field] || '';
  });
}

// --- Save Product ---
document.getElementById('save-product-btn').addEventListener('click', async () => {
  const data = { ...currentProduct };
  document.querySelectorAll('[data-field]').forEach(input => {
    data[input.dataset.field] = input.value;
  });

  const btn = document.getElementById('save-product-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    const res = await fetch(`${API}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const { id } = await res.json();
    await loadProductDetail(id);
    showView('product');
  } catch (err) {
    console.error('Save failed:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save & See Directories';
  }
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
