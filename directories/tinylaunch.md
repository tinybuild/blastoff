# TinyLaunch

- **URL:** https://www.tinylaunch.com
- **Submit URL:** https://www.tinylaunch.com/submit (account-gated; auth wall before form)
- **Auth:** account (Email/Password or Google / GitHub / X OAuth)
- **Captcha:** unknown (gated behind login)
- **Approval:** editorial — weekly cohorts; one batch per week stays in spotlight 7 days; top 3 of the week get a TinyLaunch badge
- **Free:** yes (paid tier: "Premium Launches" exists for priority placement / submission-service add-on)
- **One-line:** Weekly indie product launch board with badge for top 3 per week.
- **Ease:** 🟡 medium
- **Ease reason:** free + account-gated form, needs first-run capture

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| name | Product name | yes | ? | — | — | gated — needs login |
| tagline | Tagline | yes | ? | — | — | gated |
| url | Website URL | yes | ? | — | — | gated |
| description | Description | yes | ? | — | — | gated |
| logo_url | Logo | yes | ? | — | — | image upload, gated |
| screenshot_url | Screenshots | likely | ? | — | — | gated |
| category | Category | likely | ? | gated | — | gated |
| founder_name | Maker / founder | likely | ? | — | — | gated |

## Gotchas

- **Form is fully gated** behind a TinyLaunch account — `/submit` redirects to login. Map fields after first OAuth pass.
- **Weekly cadence, not daily** — submissions slot into the next week's cohort rather than going live immediately. Autofill engine should expect a scheduled-launch field or queue position rather than instant publish.
- **DR 71 dofollow backlink** is the SEO draw — listings link back to the submitted site (high-value placement).
- **Premium / submission-service tier** exists (they offer to submit you to up to 110 directories as a paid add-on). Don't trigger it on the free path.
- Top 3 weekly winners get a **badge** to display — embed code may be a follow-up field after winning.

## Sources

- https://www.tinylaunch.com
- https://www.tinylaunch.com/submit
- https://www.tinylaunch.com/directories
- https://launchdirectories.com/directory/tinylaunch
