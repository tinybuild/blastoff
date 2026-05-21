# AppSumo

- **URL:** https://appsumo.com
- **Submit URL:** https://sell.appsumo.com/ (application via https://appsumo.com/partner-apply/, hosted form on HubSpot)
- **Auth:** account (AppSumo Partner Portal login after acceptance)
- **Captcha:** unknown (HubSpot-hosted form, likely yes)
- **Approval:** editorial (~10% acceptance rate; reviewed on functionality, stability, market fit, value)
- **Free:** yes to apply (paid model: negotiated revenue share on deal sales — no upfront fee)
- **One-line:** Lifetime-deal marketplace launching SaaS to small-business and creator buyers

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| founder_name | Your Name | yes | ? | — | | gated — HubSpot form |
| founder_email | Email | yes | ? | — | | business email expected |
| company_name | Company / Product Name | yes | ? | — | | |
| name | Product Name | yes | ? | — | | |
| url | Product Website | yes | ? | — | | |
| tagline | One-line Pitch | yes | ? | — | | |
| description | Product Description | yes | ? | — | | what it does, who it's for |
| category | Product Category | yes | — | SaaS categories (marketing, productivity, AI, etc.) | | |
| target_audience | Target Audience | yes | ? | — | | who buys it |
| pricing_model | Current Pricing Model | yes | — | subscription / one-time / freemium / other | | |
| monthly_revenue | Current MRR / Revenue | yes | ? | — | | proof of traction |
| user_count | Active Users / Customers | yes | ? | — | | |
| deal_structure | Proposed Deal Type | yes | — | lifetime / annual / hybrid | | not lifetime-only anymore |
| deal_price | Proposed Deal Price | yes | ? | — | | |
| test_account_url | Test Account / Demo URL | yes | ? | — | | functioning credentials required |
| test_account_credentials | Test Login | yes | ? | — | | must stay live through review |
| support_plan | Customer Support Plan | yes | ? | — | | capacity to handle volume |
| team_info | Team / Runway | yes | ? | — | | proof of stability |
| referral_source | How did you hear about us? | optional | — | dropdown | | |

## Gotchas

- Form is a HubSpot-hosted external form (share.hsforms.com or equivalent), not a native AppSumo form — selectors will be HubSpot-generic (`input[name="firstname"]`, `input[name="email"]`, plus custom property names with `0-1/` HubSpot prefixes).
- AppSumo requires **live, working test account credentials** that remain valid through the entire review period — engine must surface this as a human-in-loop step, not autofill a throwaway.
- Pre-launch / beta / vaporware products are explicitly disqualified. B2C-only products are also rejected — must serve SMB, marketers, creators, or agencies.
- "Accepting applications for Q2 2026" — submission windows are quarterly, not always open. Check current window before submitting.
- ~10% acceptance rate — set user expectations.
- Revenue share is negotiated post-acceptance, not part of the application form — no pricing field to fill.
- Deal structure is no longer lifetime-only as of 2026; annual and other models are accepted, so the engine shouldn't force "lifetime deal" framing.
- Field map above reconstructed from public guides + help center — the actual HubSpot form is gated and field names need confirmation on first real submission.

## Sources

- https://sell.appsumo.com/
- https://appsumo.com/partner-apply/
- https://help.appsumo.com/article/92-how-do-i-submit-my-product
- https://help.appsumo.com/article/701-how-we-vet-new-new-listing-applications
- https://help.appsumo.com/article/17-partner-with-appsumo
