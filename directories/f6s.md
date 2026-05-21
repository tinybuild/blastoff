# F6S

- **URL:** https://www.f6s.com
- **Submit URL:** https://www.f6s.com/products/list (account-gated; bot wall before form)
- **Auth:** account (LinkedIn / Facebook / email signup)
- **Captcha:** yes — Cloudflare-style bot-verification interstitial on cold visits
- **Approval:** auto — public listing on profile completion; programs / deals reviewed separately
- **Free:** yes (paid tier: promoted placement and program-host fees, not required to list)
- **One-line:** Founder network for accelerators, deals, jobs, and startup listings.
- **Ease:** 🔴 hard
- **Ease reason:** bot wall + LinkedIn-style profile flow blocks plain HTTP autofill

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| name | Company name | yes | ? | — | — | gated — needs account |
| tagline | One-liner | yes | ? | — | — | gated |
| url | Website | yes | ? | — | — | gated |
| description | About | yes | ? | — | — | gated; long-form |
| logo_url | Logo | yes | ? | — | — | image upload, gated |
| category | Industry / category | yes | ? | gated | — | multi-select |
| location | HQ location | yes | ? | gated | — | city / country picker |
| stage | Company stage | yes | ? | idea / MVP / launched / revenue | — | gated |
| team_size | Team size | likely | ? | gated | — | gated |
| founder_name | Founder | yes | ? | — | — | tied to account profile |
| founder_email | Contact email | yes | ? | — | — | account email |
| twitter_url | Twitter / X | no | ? | — | — | gated |
| linkedin_url | LinkedIn | likely | ? | — | — | gated; LinkedIn-style network |

## Gotchas

- **Cloudflare-style bot wall** on cold visits — headless HTTP autofill will hit a "we think you might be a bot" page before reaching the form. Browser-driven flow (cookies + JS) is required.
- **LinkedIn-style profile flow** — listing is structured as a company profile, not a product card. Expect HQ / stage / team-size fields beyond the usual launch-directory shape.
- **Account-first.** No anonymous submission; LinkedIn / Facebook / email signup gates everything.
- **Audience is investors and accelerators**, not casual consumers — listing benefits accrue via funding / deal applications, not weekly upvote spikes.
- **DR 60+ dofollow backlink** is part of the SEO value (Top 10 must-submit per several 2026 directory roundups).
- Listing is **always free**; promoted placements and program-hosting are paid separately and not required to publish.

## Sources

- https://www.f6s.com
- https://www.f6s.com/products/list
- https://yo.directory/directory/startup-opportunities-directory-f6scom
- https://startupstash.com/tools/f6s
- https://www.mypresences.com/service/f6s
