# Tekpon

- **URL:** https://tekpon.com
- **Submit URL:** https://tekpon.com/get-listed/
- **Auth:** account
- **Captcha:** unknown
- **Approval:** manual (quick check; full refund if denied)
- **Free:** no (paid tier: $249 one-time fee for fully optimized SEO profile, category placement, deal promotion access)
- **One-line:** SaaS review and discovery directory with paid one-time listings

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| category | Software Category | yes | — | 100+ categories (AI Agents, Accounting, CRM, etc.) | `select[name="category"]` | step 1 of 5 |
| name | Software Name | yes | ? | — | `input[name="software_name"]` | |
| url | Software Website | yes | ? | — | `input[name="software_website"]` | URL type |
| tagline | Unique Selling Proposition | yes | ? | — | `input[name="usp"]` | one-liner |
| description | Short Description | yes | 300 words | — | `textarea[name="short_description"]` | word-count limit, not char |
| founder_name | Your Name | yes | ? | — | `input[name="your_name"]` | |
| founder_email | Your Business Email | yes | ? | — | `input[name="business_email"]` | business domain expected |
| company_name | Company Name | yes | ? | — | `input[name="company_name"]` | |
| company_position | Company Position | yes | ? | — | `input[name="company_position"]` | job title |
| country | Country | optional | — | country list | `select[name="country"]` | |
| promo_code | Promotional Code | optional | ? | — | `input[name="promo_code"]` | for discount on $249 fee |

## Gotchas

- $249 one-time payment is part of the submission flow — not free. Engine must surface payment step or pause for Paul to enter card.
- Sign-up / sign-in is required before the form is accessible. Account creation step precedes any field input.
- Form is a 5-step wizard, not a single page — autofill must advance through steps and re-locate selectors per step.
- "Short Description" limit is 300 **words**, not characters — most listing directories use char count, so the engine needs a word-counter for this field specifically.
- Disclaimer: Tekpon reserves the right to reject; rejected applicants get full refund. Worth flagging to user before payment.
- Selectors above are best-guess (form is gated behind login) — confirm on first real submission.

## Sources

- https://tekpon.com/get-listed/
- https://tekpon.com/pricing/
- https://tekpon.com/frequently-asked-questions/
- https://launchpointzero.com/blog/tekpon-com-boasts-of-230-million-reviews-and-charges-249-to-be-listed-its-probably-a-scam/
