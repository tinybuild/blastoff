// Cockpit — single-user mode. Profile lives in URL params + localStorage.

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
  product: null,
  directories: [],
  filter: 'all',
};

function getProductUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('url') || localStorage.getItem('blastoff:last_product_url') || '';
}

function setProductUrl(url) {
  const params = new URLSearchParams(window.location.search);
  params.set('url', url);
  history.replaceState({}, '', `?${params.toString()}`);
  localStorage.setItem('blastoff:last_product_url', url);
}

async function loadCockpit(url) {
  $('#cockpit-empty').hidden = true;
  $('#cockpit-error').hidden = true;
  $('#cockpit-main').hidden = true;

  try {
    const res = await fetch(`/api/cockpit?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Load failed');

    state.product = data.product;
    state.directories = data.directories;
    setProductUrl(url);
    render();
  } catch (err) {
    showError(err.message);
  }
}

function showError(msg) {
  $('#error-msg').textContent = msg;
  $('#cockpit-error').hidden = false;
  $('#cockpit-main').hidden = true;
  $('#cockpit-empty').hidden = true;
}

function render() {
  $('#cockpit-main').hidden = false;
  const p = state.product;
  $('#product-name').textContent = p.name || '(unnamed)';
  $('#product-tagline').textContent = p.title || '';
  $('#product-url').textContent = p.url || '';
  $('#product-url').href = p.url || '#';

  renderCounts();
  renderGrid();
}

function renderCounts() {
  const all = state.directories;
  $('#count-easy').textContent = all.filter(d => d.ease === 'easy' && !d.is_done).length;
  $('#count-medium').textContent = all.filter(d => d.ease === 'medium' && !d.is_done).length;
  $('#count-hard').textContent = all.filter(d => d.ease === 'hard' && !d.is_done).length;
  $('#count-done').textContent = all.filter(d => d.is_done).length;
}

function filteredDirectories() {
  const f = state.filter;
  if (f === 'all') return state.directories;
  if (f === 'done') return state.directories.filter(d => d.is_done);
  return state.directories.filter(d => d.ease === f && !d.is_done);
}

function renderGrid() {
  const grid = $('#grid');
  grid.innerHTML = '';
  const dirs = filteredDirectories();
  if (dirs.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: var(--space-xl);">Nothing here yet.</p>';
    return;
  }
  for (const d of dirs) grid.appendChild(cardFor(d));
}

function easeEmoji(ease) {
  return ease === 'easy' ? '🟢' : ease === 'medium' ? '🟡' : ease === 'hard' ? '🔴' : '⚪';
}

function frictionsFor(d) {
  const out = [];
  if (!d.is_free) out.push({ text: 'paid', cls: 'is-block' });
  if (d.auth_type && /sales/i.test(d.auth_type)) out.push({ text: 'sales-led', cls: 'is-block' });
  if (d.auth_type && /oauth|account|github/i.test(d.auth_type)) out.push({ text: 'login', cls: '' });
  if (d.has_captcha) out.push({ text: 'captcha', cls: 'is-warn' });
  if (d.ease_reason && /backlink/i.test(d.ease_reason)) out.push({ text: 'backlink', cls: 'is-warn' });
  if (d.ease_reason && /Mondays/i.test(d.ease_reason)) out.push({ text: 'Mon only', cls: 'is-warn' });
  if (d.ease_reason && /quarterly/i.test(d.ease_reason)) out.push({ text: 'quarterly', cls: 'is-warn' });
  if (d.ease_reason && /test creds/i.test(d.ease_reason)) out.push({ text: 'test creds', cls: 'is-warn' });
  return out;
}

function cardFor(d) {
  const card = document.createElement('article');
  card.className = 'cockpit-card' + (d.is_done ? ' is-done' : '');
  const ready = d.fields_ready;
  const total = d.fields_total;
  const isReady = total > 0 && ready === total;

  card.innerHTML = `
    <div class="cockpit-card-head">
      <div>
        <div class="cockpit-card-name">${easeEmoji(d.ease)} ${escapeHtml(d.name)}</div>
        ${d.ease_reason ? `<div class="cockpit-card-ease">${escapeHtml(d.ease_reason)}</div>` : ''}
      </div>
    </div>
    <div class="cockpit-card-meta">${escapeHtml(d.description || '')}</div>
    <div class="cockpit-card-ready ${isReady ? 'is-ready' : ''}">
      <span class="frac">${ready}/${total}</span> required fields ready
    </div>
    <div class="cockpit-card-frictions">
      ${frictionsFor(d).map(fr => `<span class="cockpit-friction ${fr.cls}">${fr.text}</span>`).join('')}
    </div>
    <div class="cockpit-card-actions">
      ${d.is_done
        ? `<button class="cockpit-btn is-ghost" data-action="undo" data-dir="${d.id}">Unmark</button>`
        : `<button class="cockpit-btn is-primary" data-action="launch" data-dir="${d.id}">Open + Copy</button>
           <button class="cockpit-btn" data-action="mark" data-dir="${d.id}">Mark submitted</button>`
      }
    </div>
    ${d.is_done && d.submission ? `<div class="cockpit-card-status">${d.submission.status}${d.submission.submitted_at ? ' · ' + new Date(d.submission.submitted_at).toLocaleDateString() : ''}</div>` : ''}
  `;
  return card;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function buildClipboardText(d) {
  const p = state.product;
  const fields = d.all_fields || [];
  const lines = [`# ${d.name} submission for ${p.name || p.url}\n`];
  for (const f of fields) {
    const v = p[f.field_name];
    if (v == null || String(v).trim() === '') continue;
    const limitNote = f.max_length ? ` (max ${f.max_length})` : '';
    lines.push(`${f.field_label || f.field_name}${limitNote}:`);
    lines.push(String(v));
    lines.push('');
  }
  return lines.join('\n');
}

async function launchDirectory(dir) {
  const text = buildClipboardText(dir);
  try {
    await navigator.clipboard.writeText(text);
    toast(`Fields copied · opening ${dir.name}`);
  } catch {
    toast(`Opening ${dir.name} · (clipboard blocked)`);
  }
  window.open(dir.submit_url, '_blank', 'noopener');
}

async function markSubmission(dir, status) {
  if (!dir.submission) {
    toast('No submission record. Re-extract the product first.');
    return;
  }
  try {
    const res = await fetch(`/api/submissions/${dir.submission.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
    // refresh local state
    dir.submission.status = status;
    if (status === 'submitted') dir.submission.submitted_at = new Date().toISOString();
    dir.is_done = (status === 'submitted' || status === 'approved');
    renderCounts();
    renderGrid();
    toast(status === 'not_started' ? 'Unmarked' : `Marked ${status}`);
  } catch (err) {
    toast(err.message);
  }
}

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2500);
}

// Event wiring
$('#filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.cockpit-filter');
  if (!btn) return;
  state.filter = btn.dataset.filter;
  $$('.cockpit-filter').forEach(b => b.classList.toggle('is-active', b === btn));
  renderGrid();
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const dirId = parseInt(btn.dataset.dir, 10);
  const dir = state.directories.find(d => d.id === dirId);
  if (!dir) return;
  const action = btn.dataset.action;
  if (action === 'launch') launchDirectory(dir);
  if (action === 'mark') markSubmission(dir, 'submitted');
  if (action === 'undo') markSubmission(dir, 'not_started');
});

$('#load-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const url = $('#url-input').value.trim();
  if (url) loadCockpit(url);
});

// Bootstrap
(async () => {
  const url = getProductUrl();
  if (url) {
    await loadCockpit(url);
  } else {
    $('#cockpit-empty').hidden = false;
  }
})();
