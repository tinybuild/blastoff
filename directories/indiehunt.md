# IndieHunt

- **URL:** https://indiehunt.io
- **Submit URL:** https://indiehunt.io/submit (account-gated; dynamic form)
- **Auth:** account (signup required)
- **Captcha:** unknown
- **Approval:** editorial — weekly launch cycle, products go live Monday and stay featured 7 days; top 3 weekly winners get badge + dofollow backlink
- **Free:** yes (paid tier: "Free Launch" requires badge embed; "Nofollow Launch" is $0; paid premium launch tier exists for dofollow without badge)
- **One-line:** Weekly AI-focused launch platform with autofill from website URL.
- **Ease:** 🟢 easy
- **Ease reason:** AI-autofill from URL means most fields auto-populate after signup

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| url | Website URL | yes | ? | — | — | AI autofills name / tagline / description / category from this |
| name | Product name | yes | ? | — | — | AI-prefilled, editable |
| tagline | Tagline | yes | ? | — | — | AI-prefilled, editable |
| description | Description | yes | ? | — | — | AI-prefilled, editable |
| long_description | Long description | likely | ? | — | — | AI-prefilled, editable |
| category | Category | yes | ? | AI / dev tool / productivity / etc. | — | AI-prefilled |
| logo_url | Logo | yes | ? | — | — | image upload |
| screenshot_url | Screenshots | likely | ? | — | — | image upload |
| launch_plan | Launch plan | yes | ? | Free Launch (badge required) / Nofollow Launch ($0) / Premium (paid) | — | three-tier picker |
| badge_embed | Badge embed proof | conditional | ? | — | — | required only when launch_plan = Free Launch |
| founder_name | Maker name | likely | ? | — | — | tied to account |

## Gotchas

- **AI-autofill is the headline feature** — paste the website URL and the form pre-populates most text fields. BlastOff's autofill engine can lean on this: submit the URL first, let IndieHunt's AI fill the rest, then diff against BlastOff's canonical fields before final submit.
- **Three-tier launch plan.** Free Launch is $0 but **requires embedding the IndieHunt badge** on the product site (verified before publish). Nofollow Launch is $0 with no badge but the backlink is nofollow. Premium is paid for dofollow without badge.
- **Weekly cadence.** Submissions slot into the next Monday's cohort, not instant publish — expect a scheduled launch date field.
- **AI-only platform framing.** Listed as "AI-focused launch platform" — non-AI products may still submit (broader copy says "digital product"), but expect the curation lens to favor AI tooling.
- **963+ indie builders on platform** — small but active; top-3 weekly badge is meaningful social proof.
- Form loads dynamically — JS render required before fields are present in DOM.

## Sources

- https://indiehunt.io
- https://indiehunt.io/submit
- https://indiehunt.io/studio/best-weekly-launch-platforms-for-indie-hackers-2026-04-16
- https://launchdirectories.com/directory/indiehunt
- https://github.com/Praneetbrar/indiehunt
