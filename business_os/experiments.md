# Experiments — grok-apps

Running ledger for the Grok-Skills-as-funnel thesis. Every experiment must end in `scale | improve | pivot | stop`.

---

## EXP-001 — AI Bill Auditor → ThumbGate Pro conversion

**Status:** drafted, awaiting dogfood phase
**Owner:** Igor
**Started:** 2026-05-19
**Decision date:** 2026-05-26 (7 days)

### Hypothesis

A Grok Skill that quantifies how much repeated AI mistakes are costing the user — and ends with a UTM-tagged link to ThumbGate Pro — will convert at ≥2% from skill-invocation to `/checkout/pro` click. If true, Grok Skills are a viable distribution surface and we scale by shipping more skills + listing publicly.

### Inputs

- Skill: `.grok/skills/ai-bill-auditor/SKILL.md` v1.0
- Installed at: `~/.grok/skills/ai-bill-auditor/` (local) and `dist/ai-bill-auditor.zip` (My Skills upload bundle)
- Funnel URL: `https://thumbgate.ai/checkout/pro?utm_source=grok-skill&utm_medium=skill&utm_campaign=ai-bill-auditor`
- Measurement: PostHog event `pageview` filtered by `utm_source=grok-skill` and `utm_campaign=ai-bill-auditor`

### Phases

1. **Dogfood (days 1–2):** Igor invokes `/ai-bill-auditor` on his own Grok across grok.com, iOS Grok, Android Grok with 3 real test inputs (his last week of Cursor sessions, an Anthropic invoice line, a free-form "why is my bill high"). Fix any output drift before any public exposure.
2. **Soft share (days 3–4):** Igor manually shares with 5 specific people who run AI agents (no public posts yet). Measure: do they invoke it? Do they click through?
3. **Public listing decision (day 5):** if ≥3 of 5 in soft share invoke the skill at least once → approve public listing on lobehub. Else → improve positioning, re-test.
4. **Announcement post (day 6, only if listing was approved):** Igor approves a single post drafted from `ThumbGate/docs/marketing/` rotation. Default channel = LinkedIn (lowest noise, ThumbGate's existing engaged audience).
5. **Decision (day 7):**

### Success / failure thresholds

| Metric | Success | Failure | Source |
|---|---|---|---|
| Skill invocations | ≥20 | <5 | Manual user reports until xAI ships skill-analytics API |
| Click-through to checkout URL | ≥10 unique | <3 unique | PostHog |
| Conversion to paid (`/checkout/pro` success event) | ≥1 | 0 | Stripe + PostHog |

### Decision tree

- **All three success thresholds hit** → `scale`. Promote skills #2 and #3, list publicly, start a "Skill of the week" cadence in ThumbGate's distribution runbook.
- **Click-through hit, paid conversion missed** → `improve`. Funnel works; checkout page is the bottleneck. Run ThumbGate `/checkout/pro` conversion audit before more skills.
- **Invocations hit, click-through missed** → `improve`. Skill is useful but CTA isn't landing. Rewrite the closing block, test variant.
- **Invocations missed** → `pivot`. Either Grok Skills don't get organic discovery yet, or the positioning is wrong. Try one different skill concept (not from the current 3) before declaring the channel dead.
- **All three missed AND no qualitative learning** → `stop`. Document what we learned, deprioritize the channel for 60 days, revisit when xAI ships marketplace + analytics.

### What we'll measure regardless of outcome

- Time from "user describes pain" → "user sees CTA" (latency of the skill)
- Whether the output actually identifies real repeat-offender patterns on real data
- Whether the funnel URL even loads cleanly on iOS Grok / Android Grok (in-app browser quirks)

---

## EXP-002, EXP-003 — placeholder

Approval Inbox → OpenClaw Console install, and Scam Call Decoder → AnswerGuard install. Both v1.0 drafted. Do not run in parallel with EXP-001 — we need one clean signal first.
