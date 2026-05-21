# Uneed

- **URL:** https://uneed.best
- **Submit URL:** https://uneed.best/submit-a-tool
- **Auth:** account
- **Captcha:** unknown
- **Approval:** manual (queue-based launch slot; "Skip the Line" paid option)
- **Free:** yes (free queue slot; paid: Skip the Line $29.99, Relaunch $15, Pro $89/yr early bird, Auto-Submit to 100+ directories $249)
- **One-line:** Launch platform for makers — homepage feature, SEO backlink, community feedback.

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | gated — must create account at /signup before form renders |

## Gotchas

- The real submit path is `/submit-a-tool`, not `/submit` (the prompt's URL returns 404). Update routing in autofill engine.
- Account required before form is visible: "You must have an account to submit a product to Uneed. This will allow you to modify it later."
- Free path is "Join the line" — auto-assigned next available launch date. Paying $29.99 lets the user pick the launch date.
- Categories observed from nav: Development, Design, Marketing, Business, Personal life, Products For Sale — likely the `category` dropdown values on the form.
- Form fields not publicly mappable — needs login. Likely fields based on a launch directory: name, tagline, description, long_description, url, logo_url, screenshot_url, category, pricing, founder info, social links (twitter, github), launch_date (paid tiers).
- Adjacent monetization layer: Uneed also sells $249 "Auto-Submit to 100+ directories" — direct competitor to BlastOff's value prop. Worth noting strategically.

## Sources

- https://uneed.best
- https://uneed.best/submit-a-tool
- https://uneed.best/pricing
