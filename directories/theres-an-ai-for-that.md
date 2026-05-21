# There's An AI For That (TAAFT)

- **URL:** https://theresanaiforthat.com
- **Submit URL:** https://theresanaiforthat.com/submit/
- **Auth:** account (email verification — edit access granted post-submit via verified email)
- **Captcha:** unknown (Cloudflare challenge gates anonymous fetch; likely Turnstile)
- **Approval:** manual / editorial (~1-2 days, human-vetted for functionality, accuracy, pricing clarity, safety, duplicates)
- **Free:** no — paid only (paid tier: $49 Website Only, $347 Maximum Exposure with newsletter feature + $300 PPC credit, custom plans available)
- **One-line:** Largest human-curated AI tool directory; 80M+ monthly visitors.

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| url | Tool URL | yes | ? | — | — | gated — needs login to map; populates the tool page on submit |
| launch_date | Launch date | no | — | date picker | — | optional scheduling |
| timezone | Timezone | no | — | full IANA tz list (Africa/Abidjan ... UTC) | — | paired with launch_date |
| package | Submission package | yes | — | Website only ($49) / Maximum Exposure ($347) / Custom | — | radio; gates Stripe checkout |
| founder_email | Email | yes | ? | — | — | edit access link sent here post-submit |
| name | Tool name | yes | ? | — | — | gated — appears after URL submitted (likely auto-scraped, editable) |
| tagline | Tagline | yes | ? | — | — | gated |
| description | Description | yes | ? | — | — | gated |
| category | Category | yes | — | Personal / Work / Creativity + nested task taxonomy | — | gated |
| pricing | Pricing model | yes | — | Free / Freemium / Paid / Free trial / Contact for pricing | — | inferred from public filter facets |
| tags | Tags | ? | — | — | — | gated |
| logo_url | Logo | yes | — | — | — | image upload, gated |
| screenshot_urls | Screenshots | ? | — | — | — | gated |

## Gotchas

- Submission is paid-only — there is no free tier. Cheapest path is **$49 Website Only**; flagship is **$347 Maximum Exposure** (newsletter blast to 2.5M+ subscribers + $300 ad credit).
- Anonymous fetches return Cloudflare 403; the form is gated behind a Cloudflare challenge and likely a Turnstile captcha. Autofill engine must run inside a real browser context.
- Submission is a multi-step funnel: **(1)** enter Tool URL, **(2)** pick launch date + timezone, **(3)** pick package, **(4)** Stripe checkout, **(5)** email verification grants edit access to the auto-scraped tool page where name/description/category/etc. are finalized.
- All listings are **manually reviewed by staff**. Accepted: AI tools, GPTs, and "AI influencers (non-human)."
- Most field labels and constraints (max lengths, exact category list, captcha widget) are not visible publicly — fields after package selection are gated by Stripe + email verification.
- Plan to autofill in two passes: pass 1 hits the public funnel (URL + package + email + payment); pass 2 hits the post-verification edit screen.

## Sources

- https://theresanaiforthat.com (homepage)
- https://theresanaiforthat.com/launch/ (package + funnel detail)
- https://theresanaiforthat.com/about/
- https://theresanaiforthat.com/submit/ (Cloudflare 403 anonymous)
