# Software Advice

- **URL:** https://softwareadvice.com
- **Submit URL:** https://www.softwareadvice.com/vendor/signup/
- **Auth:** account (Gartner Digital Markets vendor portal; sales-led onboarding)
- **Captcha:** unknown
- **Approval:** manual / editorial (sales contact + listing review; timeline not published)
- **Free:** yes (basic listing is free; paid PPC/lead-gen tiers via Gartner Digital Markets)
- **One-line:** Gartner-owned B2B software directory with advisor-led buyer matching.

## Fields

All vendor-side fields are gated — needs login / sales contact to map. Public-facing submission flow is a lead form, not a direct product-submission form.

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| founder_name | Your name | ? | ? | — | — | gated — lead form only visible after contact request |
| founder_email | Business email | ? | ? | — | — | gated |
| company_name | Company | ? | ? | — | — | gated |
| name | Product name | ? | ? | — | — | gated; not collected on initial lead form |
| url | Product URL | ? | ? | — | — | gated |
| category | Software category | ? | ? | 150+ Gartner categories | — | gated |
| description | Product description | ? | ? | — | — | gated; collected during onboarding call |

## Gotchas

- **Not a self-serve form.** Software Advice is owned by Gartner Digital Markets (also owns Capterra and GetApp). Vendor onboarding is sales-led — vendors fill a contact form, a Gartner rep reaches out, and listing happens via account-managed portal.
- **One onboarding, three directories.** Listing with Gartner Digital Markets typically syndicates across Software Advice + Capterra + GetApp. Autofill engine should treat these as a single submission target, not three.
- **Free basic listing exists** but lead-generation / PPC placement is the paid product. Vendors are upsold on cost-per-lead campaigns once listed.
- **Review collection is separate.** Vendors invite customers to leave reviews via a Gartner-hosted review-collection link; reviews are independently verified before publishing.
- **Long approval cycle.** Listing creation + first review collection commonly takes 2-6 weeks. Not suitable for "launch day" autofill — this is a long-tail directory play.
- **No public form to scrape.** The `/vendor/signup/` URL renders a marketing page, not a structured form. BlastOff will need to either (a) build a guided checklist of what info to prep before the sales call, or (b) skip live form-fill and prefill an email template + product brief PDF.

## Sources

- https://www.softwareadvice.com/vendor/signup/
- https://www.softwareadvice.com/vendors/
- https://www.softwareadvice.com/about/list-your-product/ (404)
- https://www.gartner.com/en/digital-markets
