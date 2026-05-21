# Launching Next

- **URL:** https://launchingnext.com
- **Submit URL:** https://www.launchingnext.com/submit/
- **Auth:** none
- **Captcha:** yes (math question, e.g. "What is 2+3?")
- **Approval:** manual editorial (timeline unstated for free; expedited = 1 business day on paid)
- **Free:** yes (paid tier: $99 expedited review, 1-business-day publication)
- **One-line:** Directory of 45,000+ tech startups, side projects, and business ideas.

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| name | Startup Name | yes | ? | — | `input[name="startup_name"]` | best-guess selector |
| url | Startup URL | yes | ? | — | `input[name="startup_url"]` | best-guess |
| tagline | Your headline | yes | ? | — | `input[name="headline"]` | guidance: 5-8 words |
| long_description | Full startup description | yes | 2500 | — | `textarea[name="description"]` | hard char cap |
| tags | Tags | yes | ? | — | `input[name="tags"]` | comma-separated, 5-10 tags |
| category | Which describes submission? | yes | — | Side project / Bootstrapped / Investor funded / None | `input[name="category"]` | radio group |
| marketing_spend | 90-day marketing budget | yes | — | $0 / <$1k / $1-5k / $5-15k / >$15k | `input[name="marketing_spend"]` | radio group |
| founder_name | Your Name | yes | ? | — | `input[name="name"]` | best-guess |
| founder_email | Your Email Address | yes | ? | — | `input[name="email"]` | best-guess |
| newsletter_optin | Newsletter opt-in | no | — | checkbox | `input[type="checkbox"][name="newsletter"]` | optional |
| captcha | Quick Check (math) | yes | — | — | `input[name="captcha"]` | dynamic math question, must parse + answer |

## Gotchas

- **Math captcha** ("What is 2+3?") — autofill engine must parse the question text and evaluate; values rotate.
- Description hard-capped at **2,500 characters** — truncate long_description before submit.
- Tags accept **5-10** comma-separated values — enforce min/max client-side.
- Headline guidance is **5-8 words** — soft rule but editorial may reject if ignored.
- Pricing tier ($0 free vs $99 expedited) is selected on the **next page** after the form — multi-step.
- No image/logo upload visible on submit form — listing imagery likely pulled from URL meta or added editorially.
- Field `name` attributes are best-guesses; verify on a real submit attempt before locking selectors.

## Sources

- https://www.launchingnext.com/submit/
