const $ = id => document.getElementById(id);
const urlInput = $('product-url');
const loadBtn = $('load-profile');
const statusEl = $('status');
const card = $('profile-card');

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (kind ? ' ' + kind : '');
}

function renderProfile(p) {
  $('p-name').textContent = p.name || '—';
  $('p-tagline').textContent = p.tagline || '—';
  $('p-desc').textContent = p.description || '—';
  card.hidden = false;
}

async function loadStored() {
  const { blastoffProfile } = await chrome.storage.local.get('blastoffProfile');
  if (blastoffProfile && blastoffProfile.url) {
    urlInput.value = blastoffProfile.url;
    renderProfile(blastoffProfile);
    setStatus(`Profile loaded: ${blastoffProfile.name || blastoffProfile.url}`, 'ok');
  }
}

loadBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) {
    setStatus('Enter a product URL first', 'err');
    return;
  }
  loadBtn.disabled = true;
  setStatus('Fetching profile…');
  try {
    const res = await chrome.runtime.sendMessage({ type: 'fetchProfile', productUrl: url });
    if (!res.ok) throw new Error(res.error || 'unknown error');
    if (res.data.error) throw new Error(res.data.error);
    await chrome.storage.local.set({ blastoffProfile: res.data });
    renderProfile(res.data);
    setStatus(`Profile saved: ${res.data.name || url}`, 'ok');
  } catch (err) {
    setStatus(err.message, 'err');
  } finally {
    loadBtn.disabled = false;
  }
});

loadStored();
