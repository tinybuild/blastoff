# DevHunt

- **URL:** https://devhunt.org
- **Submit URL:** https://devhunt.org/account/tools/new
- **Auth:** oauth (GitHub or Google via Supabase Auth)
- **Captcha:** no (none observed in source)
- **Approval:** auto (listing publishes immediately; activates on chosen launch week — staff removes non-dev tools)
- **Free:** yes (paid tier: $49 to launch a specific week when free queue full, or to skip to a paid week)
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
| pricing | Tool pricing type | yes | — | Free / Freemium / Paid / Free + From $X / Paid with Free Trial (loaded from Supabase `product_pricing_types`) | `input[name="pricing-type"]` (radio) | exact list pulled live from DB |
| tags | Tool categories | no | — | dev-tool taxonomy (live from Supabase) | CategoryInput component | multi-select autocomplete |
| demo_video_url | Demo video | no | ? | — | `input[name="demo_video"]` | YouTube or mp4 URL; auto-generated via paracast.io if empty |
| screenshot_urls | Tool screenshots | yes | — | — | `input[type="file"]` (ImagesUploader, max=5) | min 3 screenshots required; first is social preview, resized w=750 |
| launch_week | Launch week | yes | — | upcoming ISO weeks (free if <15 tools queued; $49 if 15+) | SelectLaunchDate component | drives free vs paid flow |

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

## Sources

- https://devhunt.org/submit (JS-rendered, blocked unauthenticated)
- https://github.com/MarsX-dev/devhunt (open-source repo)
- https://github.com/MarsX-dev/devhunt/blob/main/app/account/tools/new/page.tsx (submission form source)
- https://github.com/MarsX-dev/devhunt/blob/main/README.md
