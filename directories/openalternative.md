# OpenAlternative

- **URL:** https://openalternative.co
- **Submit URL:** https://openalternative.co/submit
- **Auth:** account (sign-in required for dashboard / submit form)
- **Captcha:** unknown
- **Approval:** manual (editorial; auto-publishes once accepted)
- **Free:** yes (paid advertising tiers separate: Silver $147/mo, Gold $297/mo, Platinum $597/mo — these are ads, not listings)
- **One-line:** Community-driven directory of open-source alternatives to proprietary software.

## Fields

| field_name | field_label | required | max_length | dropdown values | selector | notes |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | gated — needs sign-in to map; CONTRIBUTING.md confirms only "fill out the form at /submit" |

## Gotchas

- Open-source focused — submissions must be OSS projects with a public GitHub repo. `github_url` is almost certainly required and likely the primary key (stars + license pulled automatically from the repo).
- Listings are auto-generated from accepted submissions back into the GitHub repo as an awesome-list (`piotrkulpinski/openalternative` README) — so submission shape mirrors awesome-list rows: name, description, license, GitHub repo, category, "alternative to" mapping.
- Distinct from ads: free submission gets you a directory listing; paid Silver/Gold/Platinum tiers are ad rotations, not listing upgrades. Do not confuse the two in autofill engine.
- Submission form is React-rendered behind sign-in — WebFetch can't see fields. Reverse-engineer by logging in once and inspecting, or check Network tab for the POST endpoint shape.
- Likely required fields based on directory shape: name, tagline, description, website_url, github_url, category, alternative_to (which proprietary tools this replaces), license, founder/maintainer contact.
- Maintainer (Piotr Kulpinski) is solo + responsive on X — manual approval queue, expect days not minutes.

## Sources

- https://openalternative.co/submit
- https://openalternative.co/about
- https://openalternative.co/advertise
- https://github.com/piotrkulpinski/openalternative/blob/main/CONTRIBUTING.md
- https://github.com/piotrkulpinski/openalternative/blob/main/README.md
