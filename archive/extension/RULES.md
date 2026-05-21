# Writing a directory rule

Playbook for adding the next directory to BlastOff Autofill. Patterns landed during the DevHunt first-wire and the bugs we hit doing it.

## The five rules

1. **Match the host, gate via DOM.** Don't trust URL pathnames — they're SPA-routed and rename without notice. In `manifest.json`, `content_scripts.matches` is the *whole hostname* (`https://devhunt.org/*`). The actual "should we fill?" check lives in `rule.match()` and looks for the form element directly.
2. **Wait for the form.** React/Next.js forms aren't in DOM at `document_idle`. `content.js` runs `waitFor(check, 8000)` — initial check + MutationObserver — so the rule fires whenever the form mounts, including after client-side route transitions.
3. **Recipe selectors are approximations.** The `../directories/{slug}.md` recipes come from open-source repos or guessed inspection. Treat them as the *first cut*. Live DOM may differ. Always have a fallback strategy for radios/selects/dropdowns.
4. **Surface what didn't fill.** Skipped fields (no value, no selector match, no radio match) show up in the badge. Silent failures are worse than honest ones — the user fixes them faster when they know what's missing.
5. **Declare the unfillables upfront.** File inputs (Chrome blocks `<input type="file">` value setting), multi-select autocompletes, OAuth steps, paid gates — list them in `rule.unfillable[]`. Sets expectations; doesn't waste runtime trying.

## File layout per directory

Each directory is one file: `rules/{slug}.js`.

```js
window.BLASTOFF_RULES = window.BLASTOFF_RULES || {};

window.BLASTOFF_RULES.devhunt = {
  slug: 'devhunt',
  name: 'DevHunt',
  match: () => location.hostname === 'devhunt.org' && (
    document.querySelector('input[name="tool_name"]') ||
    document.querySelector('input[name="slogan"]') ||
    /launch.*tool/i.test(document.querySelector('h1, h2')?.textContent || '')
  ),
  fields: [
    { key: 'name',         selector: 'input[name="tool_name"]',         from: p => p.name },
    { key: 'slogan',       selector: 'input[name="slogan"]',            from: p => p.tagline || p.tagline_80 },
    { key: 'tool_website', selector: 'input[name="tool_website"]',      from: p => p.url },
    { key: 'github_repo',  selector: 'input[name="github_repo"]',       from: p => p.github_url },
    { key: 'description',  selector: 'textarea[name="tool_description"]', from: p => p.long_description || p.description },
  ],
  pricing: {
    selector: 'input[name="pricing-type"]',
    from: p => p.pricing,
  },
  unfillable: [
    { label: 'Logo upload',      reason: 'file input — Chrome blocks programmatic file selection' },
    { label: 'Screenshots (3+)', reason: 'file input — upload manually after autofill' },
    { label: 'Launch week',      reason: 'depends on free/paid availability — pick yourself' },
    { label: 'Tool categories',  reason: 'multi-select autocomplete — picks vary, do manually' },
  ],
};
```

Add the directory's hostname to `manifest.json` `content_scripts.matches` and `host_permissions`. Reload at `chrome://extensions`.

## How match() should look

Three signals, joined with `||`:
- **A required input by selector** — fastest, cheapest check
- **A second input as fallback** — in case the first selector drifts
- **A heading text match** — `/launch.*tool/i.test(h1.textContent)` style, in case both selectors drift

If `match()` returns truthy, the rule fires. False positives are cheap (badge shows "Filled 0 fields"); false negatives are silent — favor permissive.

## Field strategies

### Simple inputs / textareas

`selector` is what `document.querySelector` returns. `from(profile)` maps the profile to the value. Returning null/undefined/empty-string is the signal "no value" — gets reported as skipped, not filled with empty.

### Radio groups (pricing, etc.)

Use the `pricing` block. The content script's `clickPricingByText()` tries three strategies in order:
1. Configured selector + exact `value` attribute match
2. Any `input[type="radio"]` whose `value` matches (in case the directory uses a different `name`)
3. Label text matches — find a `<label>` containing the value text, click its `for` target

Plus a synonym table: "Free" matches "Free", "Freemium" matches both. Add synonyms as you discover them.

### File uploads

Don't try. Declare in `unfillable[]`. The badge tells the user.

### Multi-select / autocomplete (tags, categories)

Declare in `unfillable[]` unless you're willing to implement the directory's specific keystroke pattern (focus → type → wait → click result → repeat). Worth it only for the directory's flagship taxonomy field. Otherwise tell the user to pick manually.

## Testing flow

1. Reload extension at `chrome://extensions` (circular reload icon on card)
2. Hard-refresh the directory submit page (Cmd+Shift+R)
3. Bottom-right badge should appear within 8s
4. Check filled count + skipped reasons
5. If a field is skipped with "selector not found", right-click → Inspect → grab the live selector. Update the rule.
6. If pricing is skipped with "no radio/label matches", inspect the radios + labels. Either fix the configured selector, or rely on the label-text fallback (no rule edit needed if the labels match).
7. Console (right-click → Inspect → Console) shows any uncaught errors from `content.js`.

## When the recipe and live DOM disagree

The recipe at `../directories/{slug}.md` is the source-of-truth for *what the directory needs*, but the rule's selectors are the source-of-truth for *how to fill the live form*. If they diverge, the rule wins. Optionally update the recipe with a note: `<!-- live selector differs from source: input[name="X"] -->`. Doesn't auto-sync to D1.

## When to graduate

Once 5+ rules share the same structure, migrate to "Worker as source of truth" — selectors live in D1 (`directory_fields.selector`), the extension fetches them per-domain instead of bundling rule files. Gain: no extension redeploy per selector update. Cost: another endpoint to maintain. Worth it when the rule library stops churning.
