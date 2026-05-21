# PitchWall

- **URL:** https://pitchwall.co
- **Submit URL:** https://pitchwall.co/product/submit
- **Auth:** account (OAuth — Google / GitHub / Microsoft / Discord)
- **Captcha:** unknown
- **Approval:** editorial — manual review, ~30+ day queue on free tier; Featured tier publishes on chosen launch date
- **Free:** yes (paid tier: "Featured Listing" for instant / scheduled launch and prioritized visibility)
- **One-line:** Curated discovery wall for AI tools, SaaS, and tech startups.
- **Ease:** 🟡 medium
- **Ease reason:** free + OAuth-gated form, long free-tier review queue

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| name | Product name | yes | ? | — | — | gated — needs OAuth |
| tagline | Tagline | yes | ? | — | — | gated |
| url | Product URL | yes | ? | — | — | working landing page required |
| description | Description | yes | ? | — | — | gated |
| long_description | Long description | likely | ? | — | — | gated |
| logo_url | Logo | yes | ? | — | — | image upload, gated |
| screenshot_url | Screenshots | likely | ? | — | — | gated |
| category | Category | yes | ? | AI / SaaS / open-source / etc. | — | tech-focused only |
| pricing | Pricing model | likely | ? | gated | — | gated |
| founder_email | Contact email | likely | ? | — | — | used for status updates |

## Gotchas

- **Tech-only filter.** Service businesses (agencies, dev shops, design studios) are rejected. Submissions must be AI / SaaS / open-source / tech product.
- **Landing page must be live with working demo.** Doesn't need full launch, but a static placeholder will be rejected.
- **Free tier waits 30+ days** in the manual review queue — autofill engine should set expectations on response time, not poll for instant publish.
- **OAuth-only login** (Google / GitHub / Microsoft / Discord) — no email/password path observed; first-run capture must support at least one provider.
- **Same email = update access** later via the platform; treat the submission email as a durable account key.
- **Clean UI / UX is part of acceptance criteria** — submissions with broken or unfinished pages get cut.

## Sources

- https://pitchwall.co
- https://pitchwall.co/product/submit
- https://pitchwall.co/pages/faqs
- https://launchdirectories.com/directory/pitchwall
