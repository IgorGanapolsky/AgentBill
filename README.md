# grok-apps

Grok Skills as cross-platform lead magnets. One markdown bundle ships to grok.com, iOS Grok, and Android Grok — no app-store wait, no Next.js scaffolding, no auth/billing infra.

Each Skill in this repo is engineered as the top of a funnel into a real product:

| Skill | Funnels to | Status |
|---|---|---|
| [`/ai-bill-auditor`](.grok/skills/ai-bill-auditor/SKILL.md) | [ThumbGate Pro](https://thumbgate.ai/checkout/pro?utm_source=grok-skill&utm_medium=skill&utm_campaign=ai-bill-auditor) — block repeat AI mistakes ($19/mo) | v1.0 |
| [`/approval-inbox`](.grok/skills/approval-inbox/SKILL.md) | [OpenClaw Console](https://github.com/IgorGanapolsky/openclaw-console?utm_source=grok-skill&utm_medium=skill&utm_campaign=approval-inbox) — mobile cockpit for self-hosted agents | v1.0 |
| [`/scam-call-decoder`](.grok/skills/scam-call-decoder/SKILL.md) | [AnswerGuard](https://github.com/IgorGanapolsky/AnswerGuard?utm_source=grok-skill&utm_medium=skill&utm_campaign=scam-call-decoder) — native iOS+Android scam-call protection | v1.0 |
| [`/gtm-bottleneck-diagnostic`](.grok/skills/gtm-bottleneck-diagnostic/SKILL.md) | [ThumbGate Pro](https://thumbgate.ai/checkout/pro?utm_source=grok-skill&utm_medium=skill&utm_campaign=gtm-bottleneck-diagnostic) — Monday-morning growth bottleneck | v1.0 |
| [`/random-timer-coach`](.grok/skills/random-timer-coach/SKILL.md) | [Random Tactical Timer](https://github.com/IgorGanapolsky/Random-Timer?utm_source=grok-skill&utm_medium=skill&utm_campaign=random-timer-coach) — MMA/HIIT random-interval timer | v1.0 |

## Install one Skill into your Grok

**Web / iOS / Android Grok (UI):** upload the `.zip` bundle from [`dist/`](dist/) to My Skills.

**Self-hosted CLI Grok:**

```bash
git clone https://github.com/IgorGanapolsky/grok-apps.git
cp -R grok-apps/.grok/skills/<skill-name> ~/.grok/skills/
```

Then invoke `/ai-bill-auditor` (or any other skill name) inside Grok.

## Repo layout

```
.grok/skills/<name>/SKILL.md   # the Skill itself — markdown with YAML frontmatter
dist/<name>.zip                # upload bundle for the My Skills UI
scripts/upload-skills-to-grok.mjs  # Playwright auto-uploader
business_os/                   # operator playbook: dashboard, experiments, sales assets
```

## License

MIT. Fork, modify, strip the CTA, repackage — your call.

## Building your own Skill

A Skill is one folder with one `SKILL.md` file:

```yaml
---
name: my-skill
description: >
  One paragraph that tells Grok when to trigger this skill.
  Be specific about the inputs and outputs.
version: 1.0.0
license: MIT
---

# My Skill

You are <persona>. Your job is <one sentence>.

## Inputs you accept
...

## What you produce
...

## Hard rules
...
```

That's it. Grok reads the frontmatter to decide when to trigger; it reads the body to know what to do.

## Why Grok Skills over building 3 native apps

Building separate iOS, Android, and Web apps to do the same thing is overbuild for a Skill-shaped problem. A Skill is markdown — one author, one artifact, three platforms, zero app-store wait, automatic distribution through Grok's existing user base. The native apps already exist for the destinations the Skills funnel into; the Skills are the top of the funnel, not a duplicate of the destination.

---

Author: [Igor Ganapolsky](https://github.com/IgorGanapolsky) · Built on [Grok Skills](https://x.ai/news/grok-skills).
