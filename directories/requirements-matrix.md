# Directory Requirements Matrix

Rolled up from the 15 per-directory recipe files in this folder plus the 5 already-mapped directories in D1. This is the input to (a) BlastOff's master profile schema, (b) the Chrome extension's autofill rules, and (c) the cockpit's per-directory checklist.

## Access tier — where each directory falls

| Tier | What it means | Directories |
|---|---|---|
| **Free + open form** | Form publicly readable or open-source; autofill is straightforward | DevHunt · Launching Next · Stacker News (pay-per-post but trivial sats) |
| **Free + gated form** | Free to list but form behind login; selectors need first-run capture | Indie Hackers · Uneed · OpenAlternative · Peerlist · Microlaunch · Goodfirms · Fazier |
| **Paid-only listing** | No free tier; payment is part of submission flow | There's an AI for That ($49+) · Futurepedia ($247+) · Tekpon ($249) |
| **Sales-led / not autofill-shaped** | Lead form → human onboarding, not a self-serve submission | AppSumo (~10% accept, quarterly) · Software Advice (Gartner Digital Markets) |

Net: **10 are real autofill targets**, **3 are paid-priority targets** (worth a "buy seat" button in the cockpit), **2 are sales-led** (skip autofill, generate a prep brief instead).

## Auth + friction matrix

| Directory | Auth | Captcha | Approval | Avg Days | Notes |
|---|---|---|---|---|---|
| **Already mapped** | | | | | |
| Product Hunt | oauth | yes | editorial | 1 | hero target |
| Hacker News | account | no | community | 0 | Show HN: prefix |
| BetaList | account | no | editorial | 60 | needs signup form on landing |
| AlternativeTo | account | no | manual | 3 | freeform tags |
| SaaSHub | account | no | manual | 2 | pick from their categories |
| **Mapped this session** | | | | | |
| DevHunt | oauth (GH/Google) | no | auto | 0 | open-source form, $49 if week full |
| Indie Hackers | account | unknown | auto | 0 | SPA, needs logged-in capture |
| There's an AI for That | account + email | likely Turnstile | editorial | 1-2 | paid-only $49 min |
| Futurepedia | account | unknown | editorial | 7 | paid-only $247+ |
| Uneed | account | unknown | manual queue | varies | submit path is `/submit-a-tool` |
| OpenAlternative | account | unknown | manual | 5 | github_url likely required |
| Peerlist | verified profile | unknown | editorial | Mondays | individuals only, no upvote asks |
| Launching Next | none | yes (math) | editorial | varies | 2,500-char hard cap, 5-10 tags |
| Microlaunch | account | unknown | unknown | varies | fully gated, needs first-run mapping |
| Goodfirms | account | unknown | editorial | varies | Cloudflare blocks bots; B2B service categories |
| Tekpon | account | unknown | manual | varies | 5-step wizard, 300-word cap |
| AppSumo | HubSpot form | likely | editorial | 30+ | live test creds required |
| Stacker News | LN/nostr/email | unknown | auto (pay) | 0 | 10 sats base, territory matters |
| Software Advice | sales | n/a | sales | 14-42 | one onboarding → SA+Capterra+GetApp |
| Fazier | account | unknown | editorial | 15 free / 0 paid | free tier needs reciprocal backlink |

## The profile schema — union of every field BlastOff needs to collect

These are the fields that show up across one or more directories. BlastOff's master profile needs every row. Char limits show the **tightest** seen — multi-length variants belong in the AI variant generator.

| field | tightest limit | seen in | notes |
|---|---|---|---|
| `name` | 60 | PH, HN, all | the product name |
| `tagline` | 60 (PH), 80 (HN), 140 (BetaList), 5-8 words (LN) | all launch dirs | needs 4-5 length variants in AI gen: 60c / 80c / 140c / ~10 word / ~5-8 word |
| `description` | 260 (PH), 300 words (Tekpon), 2500c (LN) | most | short variant; tagline-adjacent |
| `long_description` | — | Peerlist, LN, OpenAlt | "as much detail as possible" — SEO weighted |
| `url` | — | all | product URL |
| `logo_url` | 240x240 (PH), w=128 (DevHunt) | all visual dirs | needs square + horizontal variants |
| `screenshot_urls` | 1270x760 (PH), 3+ min (PH), max 5 (DevHunt) | PH, BetaList, DevHunt, Peerlist | multi-image |
| `cover_images` | up to 4 (Peerlist) | Peerlist | adjacent to screenshots |
| `video_url` | — | Peerlist, DevHunt, Futurepedia | demo video, auto-generatable on DevHunt |
| `category` | — | all | wildly different taxonomies per dir; matching is a real problem |
| `pricing` | enum | most | Free/Freemium/Paid/Premium/Free trial — varies per dir |
| `tags` | 5-10 (LN), max via UI | most | comma-separated or multi-select |
| `tech_stack` | — | Peerlist | multi-select |
| `is_open_source` | bool | Peerlist, OpenAlt | drives where the listing fits |
| `github_url` | — | DevHunt, OpenAlt (required) | OSS signal |
| `twitter_url` | — | PH, IH, GF | maker profile |
| `linkedin_url` | — | GF | B2B dirs |
| `facebook_url` | — | GF | B2B dirs |
| `instagram_url` | — | GF | B2B dirs |
| `founder_name` | — | BetaList, IH, TAAFT, LN, GF, Tekpon, AppSumo | from profile |
| `founder_email` | — | BetaList, TAAFT, LN, GF, Tekpon, AppSumo, SA | business email expected by some |
| `phone` | — | GF | B2B only |
| `company_name` | — | Tekpon, AppSumo, GF, SA | B2B context |
| `company_position` | — | Tekpon | "Your title" |
| `street_address` · `locality` · `region` · `postal_code` · `country` | — | GF, Tekpon (country) | physical location — B2B dirs only |
| `year_established` | — | GF | optional |
| `service_area` | — | GF | optional |
| `monthly_revenue` (MRR) | — | IH (optional), AppSumo (required) | proof of traction |
| `user_count` | — | AppSumo | active users |
| `funding_type` | enum | IH | self / bootstrap / venture |
| `marketing_spend` | enum | LN | 90-day budget bucket |
| `target_audience` | — | AppSumo | who buys it |
| `deal_structure` | enum | AppSumo | lifetime / annual / hybrid |
| `deal_price` | — | AppSumo | proposed deal price |
| `test_account_url` + `test_account_credentials` | — | AppSumo | live creds, must remain valid through review |
| `support_plan` | — | AppSumo | customer support capacity |
| `team_info` | — | AppSumo | team + runway |
| `launch_date` | — | TAAFT, Uneed (paid), Fazier (paid), DevHunt | scheduled launches |
| `timezone` | IANA list | TAAFT | paired with launch_date |
| `territory` | enum | Stacker News | which SN subreddit |
| `backlink_url` | — | Fazier free tier | reciprocal backlink required |
| `tier` / `package` | enum | TAAFT, Fazier, Uneed | which paid tier (drives form shape) |

## What this means for the dashboard (track #2 — the other tab's work)

The other session is building the editable profile dashboard with AI variant generator. Tell that tab:

1. **Master profile needs ~40 fields** — not the ~15 we originally scoped. Most extras are B2B (Goodfirms address fields, Tekpon company info) + AppSumo's traction/deal fields.
2. **Tagline needs ≥5 length variants** — 60c / 80c / 140c / ~10 words / ~5-8 words. The AI variant generator's job is exactly this.
3. **Description needs 2 variants** — short (260c PH ceiling) and long (2500c LN ceiling, no cap on Peerlist).
4. **Logo needs square (240x240) and small (w=128)**; screenshots need 3+ at 1270x760.
5. **A `category` mapping table is its own subproject** — each directory has its own taxonomy (PH topics, Tekpon's 100+, Goodfirms B2B service tree, Futurepedia AI verticals). We need either AI-driven matching at submit time or a hand-curated category cross-walk.

## What this means for the cockpit (track #3)

Per-directory card needs:
- Status badge: ready / missing fields / paid action required / sales-only
- Field readiness: green checks per directory's required fields
- Friction warnings: "needs login", "needs $X payment", "needs reciprocal backlink", "needs live test account"
- Schedule indicator: "Mondays only" (Peerlist), "quarterly window" (AppSumo), "15-day queue" (Fazier free)
- "Launch" button hands off to the extension with the per-directory recipe

## Open follow-ups

- **7 directories need a first-run capture session** to lock real selectors and char limits — Indie Hackers, Uneed, OpenAlternative, Peerlist, Microlaunch, Goodfirms, Fazier. The extension's first submit to each will record the live DOM and back-fill the recipe file.
- **Category cross-walk is unscoped** — Tekpon has 100+, Goodfirms has hundreds. Either AI-pick at submit time or build a manual map.
- **Strategic competitor noticed:** Uneed sells $249 "Auto-Submit to 100+ directories" — direct overlap with BlastOff's value prop. Worth a positioning think before launch.
- **Sales-led directories (AppSumo, Software Advice) don't fit the autofill loop.** BlastOff should generate a prep brief (PDF or text email template) for these instead of trying to fill a form.
- **Three paid-only directories** — TAAFT ($49+), Futurepedia ($247+), Tekpon ($249). UI needs a clear "this costs money" gate before submit.
