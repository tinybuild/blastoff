# DevHunt

- **URL:** https://devhunt.org
- **Submit URL:** https://devhunt.org/account/tools/new
- **Auth:** oauth (GitHub or Google via Supabase Auth)
- **Captcha:** no (none observed in source)
- **Approval:** auto (listing publishes immediately; activates on chosen launch week — staff removes non-dev tools)
- **Free:** practically no — every launch week for the next 13 months is $49 (one free slot exists 13 months out where the queue has <15 tools, but it's the exception not the rule)
- **One-line:** Weekly Product Hunt-style launch board for developer tools.

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| logo_url | Logo | yes | — | — | `input[type="file"]` (LogoUploader) | image upload, server resizes to w=128 |
| name | Tool name | yes | min 3 | — | `input[name="tool_name"]` | unique; slug-collision check on submit |
| tagline | Catchy slogan | yes | min 10 | — | `input[name="slogan"]` | placeholder: "Supercharge Your Development Workflow!" |
| url | Tool website URL | yes | ? | — | `input[name="tool_website"]` | URL regex validated |
| github_url | GitHub repo URL | no | ? | — | `input[name="github_repo"]` | URL regex validated |
| description | Quick Description | yes | ? | — | `textarea[name="tool_description"]` | HTML supported |
| pricing | Tool pricing type | yes | — | Free / Subscription / One time fee (verified live 2026-05-22; recipe previously listed 5 values that no longer exist) | `input[name="pricing-type"]` (radio) | radios rendered as `<input type="radio">`; match by label text |
| tags | Tool categories | no | — | dev-tool taxonomy (live from Supabase) | CategoryInput component | multi-select autocomplete |
| demo_video_url | Demo video | no | ? | — | `input[name="demo_video"]` | YouTube or mp4 URL; auto-generated via paracast.io if empty |
| screenshot_urls | Tool screenshots | yes | — | — | `input[type="file"]` (ImagesUploader, max=5) | min 3 screenshots required; first is social preview, resized w=750 |
| launch_week | Launch week | yes | — | upcoming ISO weeks; nearly all show 15+ queued = $49. Only sparse slots ~13 months out are free | `select[name="launch_week"]` (combobox) | $49 in practice; skill should warn the user before they pick a paid week |

## Gotchas

- Auth is OAuth via Supabase — GitHub and Google supported. No email/password path documented for new submitters.
- Two image upload widgets (logo + screenshots) handled separately, each via Supabase storage. Logo and at least 3 screenshots are required for the submit handler to pass `validateImages()`.
- Submit type is decided dynamically at submit time: if the chosen launch week has fewer than 15 tools queued it's `normal` (free), otherwise it's `paid` ($49). The form can also queue for the nearest free slot — there's a secondary "Queue to launch for free" button.
- A race-condition refetch happens at submit: if the user's selected week filled up between page load and click, the form silently downgrades to the nearest free slot.
- Tool-name uniqueness is enforced via slug collision check before insert — duplicates trigger an `alert()` and abort.
- Demo video is auto-generated from `paracast.io` if the user leaves it blank.
- Optional ProductHunt import modal exists: paste a PH slug and the form auto-fills name / slogan / description / logo / screenshots. Useful as a fallback signal for the autofill engine.
- Hard rule shown at top of form: "Any non-dev tools will be subject to removal." Staff post-moderates and yanks off-topic listings.
- Submission also pings a Discord webhook (announcement only — no approval queue).
- **Live-verified 2026-05-22:** form is at `/account/tools/new` (not `/submit` — that 404s). Pricing radios are only `Free / Subscription / One time fee` (not the 5 values the Supabase schema docs suggest). Launch week is $49 for every slot in the next year except a single free slot 13 months out. Form fill on the visible fields (name, slogan, website, description, pricing radio) works cleanly via claude-in-chrome.

## Sources

- https://devhunt.org/submit (JS-rendered, blocked unauthenticated)
- https://github.com/MarsX-dev/devhunt (open-source repo)
- https://github.com/MarsX-dev/devhunt/blob/main/app/account/tools/new/page.tsx (submission form source)
- https://github.com/MarsX-dev/devhunt/blob/main/README.md
