# Changelog

## 2026-05-22 — Frame your screenshots, ready to ship

Drop a raw screenshot, and BlastOff now also generates a framed version — the same gradient, padding, and shadow you see in the gallery, baked into a clean PNG. Both files are stored: raw for re-framing later, framed for dragging straight into any directory's upload box. Every card gets a download arrow that grabs the framed PNG with your product name pre-filled in the filename.

## 2026-05-22 — DevHunt reality check

First end-to-end test caught three things: pasting bare URLs (without `https://`) now works, DevHunt's submit URL was wrong (404 → `/account/tools/new`), and DevHunt's launch week is $49 for the next 13 months — flagged 🔴 hard, not 🟢 easy. Cockpit tier is honest again.

## 2026-05-21 — Screenshot uploads (v0.4.0)

Drop your product screenshots straight into the **Screenshots** section of the profile dashboard. They land in Cloudflare R2, attach to your product, and are surfaced to the agent via the `get_profile` MCP tool. Directory submissions can now pull URLs directly instead of you copy-pasting paths.

Each upload renders in a polished frame — gradient bg, drop shadow, rounded corners. The first one is your hero (becomes the social preview on most directories). Drag-drop or click to browse.

Coming next: animated launch GIFs generated from your screenshots via Remotion. Tonight, you upload — soon, the product packages them into something share-worthy.

## 2026-05-21 — Connect your agent (v0.3.0)

New page at `/connect` walks you through installing BlastOff in your AI agent — **Claude Code**, **Cursor**, **Codex**, or any other MCP-compatible client. Pick your runtime via the tabs, follow the four numbered steps, copy the commands.

Two-step install for Claude Code matches the category convention:

```
/plugin marketplace add tinybuild/skills
/plugin install blastoff@tinybuild-skills
```

Add the marketplace once, install BlastOff (and every future TinyBuild plugin) with a single line.

## 2026-05-21 — Pivot: MCP server (v0.2.0)

BlastOff now ships as an **MCP server** at `/mcp` (JSON-RPC 2.0). Your AI agent — Claude Code, Cursor, Codex — calls BlastOff directly to read profiles, fetch directory recipes, and generate copy variants. The agent drives the browser. You stop clicking.

Six tools live on day one: `get_profile`, `list_directories`, `get_recipe`, `generate_variants`, `extract_from_url`, `mark_submitted`. Server card auto-discoverable at `/.well-known/mcp/server-card.json`.

The Chrome extension shipped this morning is retired — moved to `/archive`. The customer is the agent-fluent indie maker, and that customer already has a better runtime than anything we can ship to chrome.google.com.

Next: the `/blastoff` skill plugin, the DevHunt end-to-end demo, and an API key auth gate before public release.

## 2026-05-21 — Chrome extension (v0.1.0)

The **BlastOff Autofill** Chrome extension lands. Load it unpacked from `~/projects/blastoff/extension/`, paste your product URL, and directory submit pages fill themselves on page load.

First wired directory: **DevHunt**. Name, tagline, website, GitHub repo, description, and pricing radio all autofill. A floating badge bottom-right shows what got filled and what stays manual (file uploads, multi-select category autocompletes). Review, fix, hit Submit yourself.

The thirty-card cockpit shows the work. The extension does the work.

## 2026-05-21 — Cockpit

The new **Cockpit** at `/cockpit.html` shows every directory at once for a given product. Each card surfaces ease (🟢/🟡/🔴), how many required fields are ready, friction warnings (login, captcha, paid, backlink, Mondays-only), and an **Open + Copy** launch button that drops the right fields into your clipboard and opens the directory's submit page in a new tab.

Filter by ease tier or by status. Mark a submission as submitted, the card grays out and moves to Done.

Twelve hours of copy-paste compressed into thirty cards.
