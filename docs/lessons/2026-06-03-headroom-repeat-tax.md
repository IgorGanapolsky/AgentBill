# Lesson: Netflix Headroom validates the Repeat Tax — make detection LOCAL and PROVABLE

## Date
2026-06-03

## Source / trigger
The Register article (2026-05-31): "Netflix wiz creates app to slash AI bills, then open sources it" — about Tejas Chopra's open-source tool **Headroom**.

## Key insight stolen
- ~90% of tokens fed to LLMs are redundant, and the waste is **machine metadata** (verbose JSON schemas, nested API-response templates, identical DB columns, uncompressed logs/tool output, cache-busting timestamps/UUIDs) — NOT human-written prompts.
- Headroom runs as a local proxy (port 8787) compressing context before it hits the model. ~$700K saved across users, 200B tokens reclaimed.

## What this means for AgentBill
- AgentBill's "Repeat Tax" was previously vaporware: every "detection" was delegated to a Grok API call, so the app *claimed* savings without measuring them — and burned tokens doing it. This violated our own "Evidence-Based" mandate.
- Fix: built `RedundancyAnalyzer` (core/analysis) — deterministic, pure-JVM, unit-tested local detection of: exact-duplicate blocks, cache-busting volatile repeats (timestamps/UUIDs masked), retry loops, and tool-output bloat. Produces a measured redundancy % and projected monthly $ waste with zero API calls.
- The measured scan is (a) injected into the Grok system prompt as ground truth so the LLM can't hallucinate the numbers, and (b) surfaced in the AuditScreen UI as a provable "Repeat Tax" headline card.

## Rule / takeaway
When a competitor or article validates our thesis with a hard number, steal the *mechanism*, not just the talking point: convert delegated/claimed logic into local, deterministic, tested code that we can prove with terminal output. Detection that costs an API call to run is the wrong architecture for a cost-reduction product.

## Not yet done (next Ralph iterations)
- Wire retry-loop / tool-bloat fields into the UI card.
- Consider a desktop/CLI proxy port (Headroom's actual delivery vector) — a phone app is not where dev token-burn happens.
