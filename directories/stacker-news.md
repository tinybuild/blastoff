# Stacker News

- **URL:** https://stacker.news
- **Submit URL:** https://stacker.news/post
- **Auth:** account (sign up required; Lightning / nostr / email)
- **Captcha:** unknown
- **Approval:** auto (pay-to-post, no editorial gate)
- **Free:** no (base 10 sats per post; territory founders can set higher; 10x escalation for repetitive posts within 10min)
- **One-line:** Bitcoin-native Hacker News where posts and upvotes cost sats.

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| post_type | Post type | yes | ? | link, discussion, poll, bounty, job | `a[href*="/post?type="]` | choose before form renders; this doc covers `link` |
| territory | territory | yes | ? | user-created territories (e.g. ~bitcoin, ~tech, ~meta) | `select` / combobox | fees vary by territory |
| name | title | yes | 80 | — | `input[name="title"]` | counter shows "80 characters remaining" |
| url | url | yes (link type) | ? | — | `input[name="url"]` | duplicate URLs surface a "this link was already posted" warning |
| description | text / context | no | ? | — | `textarea[name="text"]` | markdown supported; rich "Compose" editor |
| forward_sats | forward sats | no | — | up to 5 stackers + percentage | `input[name="forward"]` | optional revenue split |

## Gotchas

- **Pay-to-post.** Every submission burns sats (10 base). Autofill must surface the cost and require explicit user confirmation before clicking the post button — there is no free preview state.
- **Lightning wallet required.** Account creation accepts Lightning, nostr, or email; posting fee is debited from the user's SN wallet balance, so the account needs funded sats before submitting.
- **Territory selection is load-bearing.** Each territory (subreddit-style) has its own fee, mods, and topical fit. Wrong territory = downzapped to invisibility. Default `~tech` or `~builders` for product launches; `~bitcoin` only if truly relevant.
- **Spam escalation.** Second post within 10 minutes costs 10x, third 100x, etc. Resets after 10min idle. Don't batch-submit.
- **Downzap risk.** Low-effort posts and shameless referral-link drops get downzapped by founders/whales; quality bar is high. Lead with substance in the title, not the URL.
- **No "Show HN" prefix convention** — SN doesn't use HN-style tags. Plain descriptive titles work best.
- **Media uploads** cost 100 sats each (250 MB/24h free for logged-in users).

## Sources

- https://stacker.news/post
- https://stacker.news/post?type=link
- https://stacker.news/faq
