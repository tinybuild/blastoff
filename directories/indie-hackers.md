# Indie Hackers

- **URL:** https://www.indiehackers.com
- **Submit URL:** https://www.indiehackers.com/products/new
- **Auth:** account
- **Captcha:** unknown
- **Approval:** auto (listing appears immediately on account; community curation via Build Board)
- **Free:** yes
- **One-line:** Community + product directory for founders building profitable online businesses.

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| name | Product name | yes | ? | — | — | gated — needs login to map |
| tagline | Tagline / pitch | yes | ? | — | — | gated |
| url | Website URL | yes | ? | — | — | gated |
| logo_url | Logo | ? | — | — | — | image upload, gated |
| description | Description | yes | ? | — | — | gated |
| category | Category / commitment | ? | — | side-project / full-time / acquired / closed | — | inferred from public filter facets |
| funding_type | Funding type | ? | — | self-funded / bootstrapped / venture-backed | — | inferred from filters |
| revenue | Monthly revenue (MRR) | no | ? | — | — | optional, supports Stripe verification |
| revenue_verification | Revenue verification | no | — | none / stripe | — | Stripe OAuth path observed in URL params |
| founder_name | Founder name | yes | ? | — | — | from logged-in profile |
| twitter_url | Twitter / X URL | no | ? | — | — | gated |

## Gotchas

- Submission requires a signed-in Indie Hackers account; the `/products/new` route redirects to `/sign-up` for unauthenticated visitors.
- The page is a JS-rendered SPA — `curl` returns an empty HTML shell; selectors must be captured from a live logged-in session before the autofill engine can wire fields.
- Founder identity is bound to the logged-in user; do not try to set `founder_name` / `founder_email` independently.
- Revenue verification is a separate Stripe OAuth flow (`?revenueVerification=stripe`), not a form input — skip it for autofill, surface as a manual follow-up.
- Listed products show up in the **Build Board** daily leaderboard regardless of submission method.
- No paid tier observed.
- Fields above are inferred from public filters and homepage data shape; the actual form must be re-mapped from a logged-in browser session.

## Sources

- https://www.indiehackers.com
- https://www.indiehackers.com/products/new (JS-rendered, empty without auth)
- https://www.indiehackers.com/post/help-im-trying-to-add-my-product-here-on-indie-hackers
