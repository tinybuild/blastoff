# Fazier

- **URL:** https://fazier.com
- **Submit URL:** https://fazier.com/submit
- **Auth:** account (Sign In / Join required to submit)
- **Captcha:** unknown
- **Approval:** editorial (~15 days for free tier; immediate publish for paid tiers)
- **Free:** yes (Free tier requires backlink; Lite $19, Premium $39, Super $99 skip backlink + add promotion)
- **One-line:** Product Hunt-style daily launch board with paid promotion tiers.

## Fields

Form is gated behind login — fields below are inferred from public product cards + standard launch-board patterns. Mark as `gated — needs login to map` for live autofill.

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| name | Product name | yes | ? | — | `input[name="name"]` | gated |
| tagline | Tagline | yes | ? | — | `input[name="tagline"]` | shown on product card; likely ~60-80 chars |
| description | Description | yes | ? | — | `textarea[name="description"]` | gated |
| url | Website URL | yes | ? | — | `input[name="url"]` | gated |
| logo_url | Logo | yes | ? | image upload | `input[type="file"]` | shown on every card |
| pricing | Pricing | yes | — | Free, Freemium, Paid, Premium | `select[name="pricing"]` | visible on card badges |
| category | Category | yes | ? | unknown taxonomy | `select[name="category"]` | gated |
| tags | Tags | ? | ? | — | `input[name="tags"]` | gated |
| launch_date | Launch date | ? | — | date picker | `input[type="date"]` | paid tiers can schedule; free tier publishes when reviewed |
| tier | Launch tier | yes | — | Basic, Lite, Premium, Super | radio / pricing selector | drives backlink requirement + promotion |
| backlink_url | Backlink URL | yes (Free tier) | ? | — | `input[name="backlink"]` | free tier requires Fazier link on homepage or footer |

## Gotchas

- **Free tier requires a reciprocal backlink** on the product's homepage or footer — Fazier verifies before listing. Autofill should warn the user to add the backlink BEFORE submitting, or pick a paid tier.
- **Tier selection changes the form.** Paid tiers ($19 / $39 / $99) unlock scheduling, skip backlink, and add promotion. BlastOff should let the user pick tier before mapping fields.
- **15-day editorial queue** on Free — not a same-day launch channel unless paid.
- **Pricing dropdown is exactly 4 values** (Free / Freemium / Paid / Premium) per card badges on the homepage. Map BlastOff pricing field to this enum.
- **Card UI is minimal** — logo, title, tagline, pricing badge, vote count. Long description matters less than tagline for ranking.
- **Vote-driven leaderboard** (daily / weekly / monthly). Submission timing matters; lighter competition days favor Free tier visibility.
- **Form fields not publicly visible** without login — first real autofill run should record the live DOM so this file can be filled in.

## Sources

- https://fazier.com
- https://fazier.com/submit
- https://fazier.com/faq (404)
- https://fazier.com/launch-guide (404)
