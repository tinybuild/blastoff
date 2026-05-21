# BlastOff Autofill — Chrome Extension

MV3 extension that fills directory submission forms from your BlastOff profile. Paste a product URL once, then walk through directories with one click each.

## Install (load unpacked)

1. Open `chrome://extensions`
2. Toggle **Developer mode** on (top right)
3. Click **Load unpacked**
4. Select `~/projects/blastoff/extension/`
5. Click the puzzle icon in the toolbar → pin **BlastOff Autofill**

## Use

1. Click the BlastOff icon → paste your product URL (e.g. `https://getbonfire.dev`) → **Load profile**. Profile is fetched from the BlastOff Worker and cached in `chrome.storage.local`.
2. Open a supported directory submit page (currently DevHunt at `https://devhunt.org/account/tools/new`).
3. Form fields autofill on page load. A floating badge bottom-right shows what got filled and what to do manually (file uploads, multi-select autocompletes).
4. Review, fix anything wrong, hit Submit yourself.

## What it fills today

- **DevHunt** (`devhunt.org/account/tools/new`) — name, tagline, website, GitHub repo, description, pricing radio. Logo + screenshots + categories + launch week stay manual.

## Architecture

- `manifest.json` — MV3 manifest. `content_scripts` matches per-directory submit URLs; add new dirs here.
- `background.js` — service worker. Single job: proxy `fetchProfile` calls to the Worker so the popup doesn't need host permissions.
- `popup.html` / `popup.css` / `popup.js` — the popup UI.
- `content.js` — universal injector. Reads `window.BLASTOFF_RULES`, picks the rule whose `match()` returns true, fills the form, shows a badge.
- `rules/{slug}.js` — one file per directory. Each registers `window.BLASTOFF_RULES.{slug}` with `match`, `fields`, `pricing`, `unfillable`.

## Add a new directory rule

See **[RULES.md](./RULES.md)** for the full playbook — match-host-not-path, DOM-gated detection, three-strategy field matching, when to declare unfillable, testing flow.

Short version:
1. Drop `rules/{slug}.js` modeled on `devhunt.js`. Selectors come from `../directories/{slug}.md` recipes, but treat them as a first cut.
2. Add the directory's hostname to `content_scripts.matches` and `host_permissions` in `manifest.json`.
3. Reload the extension at `chrome://extensions`.

## Known gaps

- No icons yet — Chrome shows the default puzzle piece. Drop 16/32/48/128 PNGs in `icons/` and reference from `manifest.json > icons` to fix.
- File uploads (logo, screenshots) can't be autofilled — Chrome blocks programmatic file input for security. Rules surface these in the badge as "do manually."
- Multi-select autocompletes (DevHunt categories, Tekpon tags) are skipped — directory taxonomies differ per dir; cross-walk is a separate inbox item.
- 15 of 30 directories need a first-run logged-in DOM capture before selectors can be locked. See `../directories/requirements-matrix.md`.
