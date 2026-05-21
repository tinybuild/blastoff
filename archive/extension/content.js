(async function () {
  const rules = window.BLASTOFF_RULES || {};
  const findRule = () => Object.values(rules).find(r => r.match && r.match());

  const rule = await waitFor(findRule, 8000);
  if (!rule) return;

  const { blastoffProfile } = await chrome.storage.local.get('blastoffProfile');
  if (!blastoffProfile) {
    injectBadge({ status: 'noprofile', rule });
    return;
  }

  const badge = injectBadge({ status: 'loading', rule, profile: blastoffProfile });
  const result = fillForm(rule, blastoffProfile);
  updateBadge(badge, { status: 'done', rule, profile: blastoffProfile, result });
})();

function waitFor(check, timeoutMs) {
  return new Promise(resolve => {
    const first = check();
    if (first) return resolve(first);

    const start = Date.now();
    const observer = new MutationObserver(() => {
      const hit = check();
      if (hit) { observer.disconnect(); resolve(hit); }
      else if (Date.now() - start > timeoutMs) { observer.disconnect(); resolve(null); }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); resolve(null); }, timeoutMs);
  });
}

function setNativeValue(el, value) {
  const proto = Object.getPrototypeOf(el);
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  if (desc && desc.set) desc.set.call(el, value);
  else el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function fillForm(rule, profile) {
  const filled = [];
  const skipped = [];

  for (const field of rule.fields) {
    const el = document.querySelector(field.selector);
    if (!el) { skipped.push({ key: field.key, reason: 'selector not found' }); continue; }
    const value = field.from(profile);
    if (value === null || value === undefined || value === '') {
      skipped.push({ key: field.key, reason: 'no value in profile' });
      continue;
    }
    setNativeValue(el, value);
    filled.push(field.key);
  }

  if (rule.pricing) {
    const value = rule.pricing.from(profile);
    if (value) {
      const matched = clickPricingByText(rule.pricing.selector, value);
      if (matched) filled.push('pricing');
      else skipped.push({ key: 'pricing', reason: `no radio/label matches "${value}"` });
    }
  }

  return { filled, skipped };
}

function clickPricingByText(configuredSelector, value) {
  const wanted = value.toLowerCase().trim();
  const synonyms = {
    'free': ['free'],
    'freemium': ['freemium', 'free'],
    'paid': ['paid', 'one time fee', 'one-time fee', 'one time', 'subscription'],
    'subscription': ['subscription', 'paid'],
    'one time fee': ['one time fee', 'one-time fee', 'one time', 'paid'],
  };
  const candidates = synonyms[wanted] || [wanted];

  // Strategy 1: configured selector + value attribute exact match
  const configured = document.querySelectorAll(configuredSelector);
  for (const el of configured) {
    if (el.value && candidates.includes(el.value.toLowerCase())) {
      el.click();
      return true;
    }
  }

  // Strategy 2: any radio whose value matches
  for (const r of document.querySelectorAll('input[type="radio"]')) {
    if (r.value && candidates.includes(r.value.toLowerCase())) {
      r.click();
      return true;
    }
  }

  // Strategy 3: label text — find a label containing the target word, click its associated input or itself
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    const txt = label.textContent.trim().toLowerCase();
    if (candidates.some(c => txt === c || txt.startsWith(c + ' ') || txt.endsWith(' ' + c) || txt === c)) {
      const forId = label.getAttribute('for');
      const target = forId ? document.getElementById(forId) : label.querySelector('input[type="radio"], input[type="checkbox"]');
      (target || label).click();
      return true;
    }
  }
  return false;
}

function injectBadge({ status, rule, profile, result }) {
  const existing = document.getElementById('blastoff-badge');
  if (existing) existing.remove();

  const badge = document.createElement('div');
  badge.id = 'blastoff-badge';
  badge.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
    background: #fbf7f0; color: #1a1a1a; border: 1px solid #e8e3da;
    border-radius: 12px; padding: 12px 14px; max-width: 280px;
    font: 13px/1.4 -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  `;
  document.body.appendChild(badge);
  updateBadge(badge, { status, rule, profile, result });
  return badge;
}

function updateBadge(badge, { status, rule, profile, result }) {
  if (status === 'noprofile') {
    badge.innerHTML = `
      <div style="font-weight:600;margin-bottom:4px">🚀 BlastOff</div>
      <div style="color:#6b6b6b">No profile loaded. Open the extension popup and paste your product URL.</div>
    `;
    return;
  }
  if (status === 'loading') {
    badge.innerHTML = `
      <div style="font-weight:600;margin-bottom:4px">🚀 BlastOff — ${rule.name}</div>
      <div style="color:#6b6b6b">Filling fields for <b>${profile.name || profile.url}</b>…</div>
    `;
    return;
  }
  if (status === 'done') {
    const filledList = result.filled.length ? result.filled.join(', ') : 'none';
    const skippedHtml = result.skipped.length
      ? `<div style="margin-top:8px;color:#6b6b6b;font-size:12px">Skipped: ${result.skipped.map(s => `${s.key} (${s.reason})`).join(' · ')}</div>`
      : '';
    const unfillableHtml = rule.unfillable && rule.unfillable.length
      ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e8e3da;font-size:12px;color:#6b6b6b">
           <div style="margin-bottom:4px;color:#1a1a1a;font-weight:500">Do manually:</div>
           ${rule.unfillable.map(u => `<div>• ${u.label} <span style="color:#b8b3a8">— ${u.reason}</span></div>`).join('')}
         </div>`
      : '';
    badge.innerHTML = `
      <div style="font-weight:600;margin-bottom:4px">🚀 BlastOff — ${rule.name}</div>
      <div style="color:#2e9d6a">Filled ${result.filled.length} field${result.filled.length===1?'':'s'}: ${filledList}</div>
      ${skippedHtml}
      ${unfillableHtml}
      <button id="blastoff-close" style="position:absolute;top:6px;right:8px;background:none;border:0;font-size:16px;color:#b8b3a8;cursor:pointer">×</button>
    `;
    const close = badge.querySelector('#blastoff-close');
    if (close) close.addEventListener('click', () => badge.remove());
  }
}
