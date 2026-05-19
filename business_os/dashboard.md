# Business OS Dashboard — grok-apps

_Last updated: 2026-05-19_

## Mission

Ship Grok Skills that monetize Igor's existing IP across the three Grok surfaces (grok.com, iOS Grok, Android Grok) with one artifact per skill. Funnel Grok users into the existing revenue stacks below rather than building new app-store SKUs.

## Existing revenue surfaces (assets in workspace/git/igor)

| Surface | Repo | Live commerce? | Notes |
|---|---|---|---|
| **ThumbGate Pro** | `ThumbGate`, `ThumbGate-Core` | Yes — Stripe checkout, $19/mo or $149/yr | Most mature: npm package, hosted dashboard at thumbgate.ai, full GTM doc set. Bottleneck = distribution, not product. |
| **OpenClaw Console** | `openclaw-console` | Not yet — pre-revenue native iOS/Android | "Daily Active Approvers" north star. Skills already an internal concept (`openclaw-skills/`). |
| **AnswerGuard** | `AnswerGuard` | App store apps | Spam/scam call protection. Free + paid tiers possible. |
| **Random Tactical Timer** | `Random-Timer` | Store apps | MMA/HIIT timer. Pro voice callouts. |
| **grok-apps (this repo)** | `grok-apps` | New — empty | Fresh canvas. Existing Gemini-CLI "App Factory" plan from May 19 — being repurposed to ship Grok Skills first. |

## Strategic thesis

xAI shipped Grok Skills on 2026-05-12. Skills are markdown bundles that run inside Grok's sandbox on web/iOS/Android simultaneously, callable via slash command, supporting connectors (Gmail/GitHub/Notion) and code execution. A Skill is the cheapest cross-platform "app" available right now: zero app-store wait, zero auth/billing infra, instant distribution.

**Why Skills beat the Gemini-CLI App Factory plan for first revenue:**

- 24-hour MVP becomes a 1-hour MVP (one SKILL.md file, no Next.js, no Supabase).
- iOS/Android coverage is automatic via Grok's mobile apps.
- Distribution piggybacks on Grok's user base; competing Skill marketplaces (lobehub) already exist.
- Each Skill becomes a top-of-funnel lead magnet for a paid Igor product.

The Next.js + Supabase apps in `IDEAS.md` are not killed — they become the destination pages Skills funnel to, after one Skill validates demand.

## Top-3 Skill picks (ranked by offer-scoring rubric)

| # | Skill | Funnels to | Pain | Score (target ≥35) |
|---|---|---|---|---|
| 1 | **AI Bill Auditor** | ThumbGate Pro $19/mo | "My Claude/Cursor bill is bleeding from repeated mistakes" | 42 |
| 2 | **Approval Inbox** | OpenClaw Console install | "Agents do dangerous things while I'm AFK" | 36 |
| 3 | **Scam Call Decoder** | AnswerGuard install | "Was that voicemail real or a scam?" | 35 |

Scoring detail in `experiments.md` (TBD).

## Current bottleneck

**Distribution, not product.** ThumbGate has a complete sales funnel and Stripe checkout but conversion data is the unknown. Until we see whether Skills can move qualified leads to `/checkout/pro`, building more products is premature.

## Fastest path to revenue (next 7 days)

1. ✅ Ship **AI Bill Auditor SKILL.md** (this commit).
2. Publish to user's personal Grok (`~/.grok/skills/`) and one public Skill marketplace (lobehub or x.ai marketplace when API allows).
3. Wire UTM-tagged links to `thumbgate.ai/checkout/pro` inside skill output.
4. Author one Reddit + one LinkedIn post in ThumbGate's existing distribution rotation announcing the Skill — copy reuses existing assets in `ThumbGate/docs/marketing/`.
5. Measure: PostHog clicks on `utm_source=grok-skill&utm_campaign=ai-bill-auditor`.
6. Decision threshold: ≥10 qualified clicks in 7 days → build Skill #2. Else pivot Skill #1's positioning before adding more.

## Hard constraints (per operator framework)

- No spend without approval.
- No outreach >20 messages/batch without approval.
- No publishing to public marketplaces without approval (reputation-sensitive — links your name to the Skill).
- No edits to Stripe pricing, Gumroad listings, or existing repo `main` branches as part of this initiative.

## Approval queue (waiting on user)

- [ ] Confirm Top-3 Skill picks above or substitute alternatives.
- [ ] Authorize publishing Skill #1 to (a) personal `~/.grok/skills/`, (b) lobehub, (c) any other public marketplace.
- [ ] Confirm UTM parameters and destination URLs match `thumbgate.ai` conventions.
- [ ] Authorize the announcement post (will be drafted into `business_os/sales_assets/` first, not sent).
