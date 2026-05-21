# GoodFirms

- **URL:** https://goodfirms.co
- **Submit URL:** https://www.goodfirms.co/add-product
- **Auth:** account
- **Captcha:** unknown
- **Approval:** editorial (timeline varies by category and profile completeness)
- **Free:** yes (paid tier: Start-Up Plan ~$300/mo for sponsorship, priority placement, link insertion, badges, widgets, analytics)
- **One-line:** B2B reviews and ratings directory for software and IT service firms

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| name | Software/Business Name | yes | ? | — | | gated — needs login to map |
| tagline | Tagline | ? | ? | — | | mentioned in public docs |
| description | Description | yes | ? | — | | |
| logo_url | Logo | yes | ? | image upload | | |
| url | Website URL | yes | ? | — | | |
| category | Service Category | yes | — | extensive B2B service + software categories | | cannot be edited later — pick carefully |
| founder_email | Business Email | yes | ? | — | | |
| phone | Phone Number | yes | ? | — | | |
| street_address | Street Address | yes | ? | — | | |
| locality | City / Locality | yes | ? | — | | |
| region | Region / State | yes | ? | — | | |
| postal_code | Postal Code | yes | ? | — | | |
| country | Country | yes | — | country list | | |
| year_established | Year Established | ? | ? | — | | |
| service_area | Service Area | ? | ? | — | | |
| pricing | Prices / Hourly Rate | ? | ? | — | | |
| twitter_url | X / Twitter | optional | ? | — | | |
| linkedin_url | LinkedIn | optional | ? | — | | |
| facebook_url | Facebook | optional | ? | — | | |
| instagram_url | Instagram | optional | ? | — | | |

## Gotchas

- Form is gated — `/add-product` returns 403 to unauthenticated fetchers (bot protection). Field map above is reconstructed from third-party listing guides + help center; needs login to confirm selectors and exact max_lengths.
- Category selection is permanent and cannot be edited after submission.
- Some listing fields ("red items" per mypresences.com) require a paid plan to display — free listings show a reduced field set.
- Listings appear to be permanent: third-party guides note no documented way to remove a business once listed.
- Two distinct submission paths exist: `/add-product` (software) and `/get-listed` or `/vendors` (B2B service firm). The schema overlaps but is not identical — autofill engine should detect path and branch.
- GoodFirms aggressively blocks scrapers (Cloudflare 403). The autofill engine must drive a real browser session, not headless fetchers.

## Sources

- https://www.goodfirms.co/add-product (403 — gated)
- https://help.goodfirms.co/how-can-my-business-get-listed-on-goodfirms/
- https://www.mypresences.com/service/goodfirms/
- https://www.goodfirms.co/sponsors/pricing
- https://www.submitpro.ai/blog/a-comprehensive-guide-to-goodfirms-software-directory-and-how-submitpro-can-improve-your-seo-visibility/
