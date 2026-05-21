# SideProjectors

- **URL:** https://www.sideprojectors.com
- **Submit URL:** https://www.sideprojectors.com/projects/new (account-gated)
- **Auth:** account (signup required)
- **Captcha:** unknown
- **Approval:** manual — moderator review before homepage publish
- **Free:** yes (paid tier: premium features for enhanced visibility / analytics)
- **One-line:** Marketplace and community to sell, buy, or show off side projects.
- **Ease:** 🟡 medium
- **Ease reason:** free + account-gated form with multi-purpose listing flow

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| name | Project name | yes | ? | — | — | gated — needs account |
| tagline | Short pitch | yes | ? | — | — | gated |
| long_description | Detailed description | yes | ? | — | — | gated; review favors detail |
| url | Project URL | yes | ? | — | — | gated |
| listing_type | Listing type | yes | ? | for sale / seeking co-founder / showcase | — | three intents on same form |
| tech_stack | Tech stack | yes | ? | — | — | free-text or tag selector |
| price | Asking price | conditional | ? | — | — | required only when listing_type = for sale |
| monthly_revenue | Monthly revenue | conditional | ? | — | — | required only when listing_type = for sale |
| monthly_visitors | Monthly visitors | conditional | ? | — | — | required only when listing_type = for sale |
| screenshot_url | Screenshots / demo | likely | ? | — | — | gated |
| reason_for_selling | Reason for selling | conditional | ? | — | — | required when listing_type = for sale |

## Gotchas

- **Three listing intents on one form** — "for sale," "seeking co-founder," or "showcase only." Autofill engine should default BlastOff users to **showcase** unless explicitly selling.
- **Revenue / visitor / price fields conditionally required** based on intent — don't fill them on a showcase-only listing.
- **Moderator review** before publish — submissions thin on detail get held or rejected; favor longer descriptions and screenshots.
- **DR 69 dofollow backlink** is the SEO draw.
- Old `businessdirectorysites.com` mirror is dead — only the canonical sideprojectors.com domain is live.

## Sources

- https://www.sideprojectors.com
- https://help.sideprojectors.com/submit
- https://launchdirectories.com/directory/sideprojectors
