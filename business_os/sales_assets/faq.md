# FAQ — grok-apps Skills

For the GitHub README, the future grok-apps landing page, and inline answers to comments on Reddit/HN/LinkedIn.

---

### What's the difference between a Grok Skill and a custom GPT?

A Grok Skill ships across grok.com, iOS Grok, and Android Grok from one markdown bundle. Custom GPTs are ChatGPT-only. Skills also support file imports (.zip, .skill, .md) and Grok's connector layer (Gmail, GitHub, Notion).

### Are these Skills free?

Yes. The five Skills in this repo are MIT-licensed. The destination tools each Skill funnels to have their own pricing: ThumbGate has a free tier and a $19/mo Pro tier; OpenClaw Console and AnswerGuard are free; Random Tactical Timer has a Pro upgrade in-app.

### Do you need a Grok subscription to use the Skills?

Some require Grok's paid tier (depends on xAI's current Skill access policy — check grok.com/pricing). The Skill bundles themselves are free to inspect, fork, modify.

### Can I modify the Skills?

Yes. Fork the repo or download the .zip from `dist/`, edit `SKILL.md`, re-import to your own Grok. The MIT license covers private and commercial modifications.

### How do I install a Skill locally instead of using grok.com?

Drop the skill directory into `~/.grok/skills/<skill-name>/`. Grok will discover it. Invoke with `/<skill-name>`.

### Why does each Skill recommend a specific Igor product at the end?

Transparency: this is a lead-magnet experiment. The Skills are useful standalone, but they're authored by the maintainer of those products, and the CTA names the related tool. If you'd rather not see the CTA, fork and delete that section — the MIT license covers it.

### What gets sent to your servers when I run a Skill?

Nothing. The Skill runs inside Grok's sandbox on xAI's infrastructure. Igor doesn't get any usage data unless you click through the UTM-tagged link in the Skill's CTA, which lands in the destination product's PostHog like any other URL parameter.

### Why these 5 Skills specifically?

Each one corresponds to an existing product Igor maintains (ThumbGate, OpenClaw, AnswerGuard, Random Timer) plus one cross-product diagnostic. Building Skills for products you don't ship is a recipe for hallucinated CTAs.

### How do I report a bug or request a Skill?

Open an issue on github.com/IgorGanapolsky/grok-apps. Tag with `skill:<name>` if it's about a specific Skill.

### Are you going to add more Skills?

Yes — but only after the existing ones validate. The decision threshold is in `business_os/experiments.md` (EXP-001). If the funnel doesn't move, the project pivots before adding more.

### How does ThumbGate work with token compression tools like Project Headroom?

Project Headroom is a "token barber" that compresses prompt context (logs, DOM trees, database schemas) to reduce raw model input costs. ThumbGate is an "agent bouncer" (governance/safety gate) that blocks repetitive loops, risky commands, and incorrect logic runs. Using them together provides both low token counts and safe agent execution.
