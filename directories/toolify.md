# Toolify

- **URL:** https://www.toolify.ai
- **Submit URL:** https://www.toolify.ai/submit
- **Auth:** account
- **Captcha:** unknown
- **Approval:** manual (editorial, ~few days)
- **Free:** yes (paid tier: featured/advertising slots, "coins" needed for updates)
- **One-line:** Large AI tools directory, 29K+ tools, daily-updated discovery surface
- **Ease:** 🟡 medium
- **Ease reason:** Account-gated form, large category dropdown, page is 403 to anonymous fetches

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| name | Tool Name | yes | ~80 |  |  | Plain name only |
| url | Website URL | yes | ~200 |  |  | Must be live |
| tagline | Short Description | yes | ~120 |  |  | One-line pitch |
| description | Detailed Description | yes | ~2000 |  |  | Features, use cases |
| category | Category | yes |  | Chatbots & Virtual Companions; Office & Productivity; Image Generation & Editing; Art & Creative Design; Coding & Development; Video & Animation; Writing & Editing; Education & Translation; Voice Generation & Conversion; Business Management; Music & Audio; Marketing & Advertising; Social Media; Health & Wellness; Legal & Finance |  | 459 sub-categories under these |
| logo_url | Logo |  |  |  |  | Image upload; square preferred |
| pricing | Pricing Model | yes |  | Free; Freemium; Free Trial; Paid |  |  |
| tags | Tags |  |  |  |  | Free-text comma-separated |
| founder_email | Contact Email | yes |  |  |  | For approval notification |
| twitter_url | Twitter |  |  |  |  | Optional |

## Gotchas

- Page returns 403 to scrapers/anonymous WebFetch — first-run capture needed via real browser session.
- Updating an already-listed tool costs "coins" (Toolify's internal currency); initial submit is free but edits aren't.
- Site has been accused of scraping tools without consent, so the listing may already exist — check before submitting.
- Daily classification done by ChatGPT, so category may be auto-overridden.

## Sources

- https://www.toolify.ai/
- https://www.toolify.ai/submit
