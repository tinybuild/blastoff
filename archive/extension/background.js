const WORKER_URL = 'https://blastoff.tinybuild.workers.dev';

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'fetchProfile') {
    fetch(`${WORKER_URL}/api/profile?url=${encodeURIComponent(msg.productUrl)}`)
      .then(r => r.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }
});
