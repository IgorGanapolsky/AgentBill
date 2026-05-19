# Grok Skills — grok-apps

Three Grok Skills, each engineered as a lead magnet for one of Igor's existing revenue surfaces. A Skill is a markdown bundle that runs inside Grok's sandbox on web, iOS, and Android — one artifact, three platforms, no app-store wait.

| Skill | Funnels to | Status |
|---|---|---|
| [ai-bill-auditor](ai-bill-auditor/SKILL.md) | ThumbGate Pro ($19/mo) | ✅ v1.0 drafted |
| [approval-inbox](approval-inbox/) | OpenClaw Console install | ⏳ stub, awaiting go-ahead |
| [scam-call-decoder](scam-call-decoder/) | AnswerGuard install | ⏳ stub, awaiting go-ahead |

## How a Skill ships

1. **Local test** — drop the skill directory under `~/.grok/skills/` and invoke `/ai-bill-auditor` inside Grok.
2. **Public listing** — package the directory as a `.zip` or `.skill` bundle and submit to a Skill marketplace (lobehub.com/skills, xAI marketplace when API allows).
3. **Funnel measurement** — all outbound links carry `utm_source=grok-skill&utm_medium=skill&utm_campaign=<skill-name>` so conversions are attributable in the destination site's analytics (PostHog for ThumbGate).

See `../business_os/dashboard.md` for the operator playbook, scoring rubric, and decision thresholds.
