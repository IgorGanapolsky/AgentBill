# headroom-lite

Local, deterministic **Repeat Tax** scanner for agent logs / LLM transcripts. Zero dependencies,
zero network — it measures redundancy, it never sends your data anywhere.

This is the CLI/CI delivery vector for AgentBill's `RedundancyAnalyzer`: it catches wasted tokens
on the dev machine and in the pipeline, which is where LLM token-burn actually happens. Inspired by
Netflix's open-source Headroom proxy — the finding that ~90% of tokens fed to an LLM are redundant
*machine metadata* (duplicate blocks, cache-busting timestamps/UUIDs, retry loops, bloated tool
output) rather than human-written prompts.

## Usage

```bash
# Scan a log file
node scan.mjs sample-agent-log.txt

# Pipe from stdin
cat session.log | node scan.mjs

# Gate CI: exit non-zero if redundancy exceeds 40%
node scan.mjs session.log --fail-over 40
```

## What it detects

| Detector | What it catches |
|----------|-----------------|
| Exact-duplicate blocks | The literal Repeat Tax — identical lines re-sent every turn |
| Cache-busting volatility | Same payload, only a timestamp/UUID/number changes → silently busts the prompt cache |
| Retry loops | The same failing operation re-emitted 3+ times |
| Tool-output bloat | Mammoth single lines or raw JSON/schema dumps past a reasonable budget |

Output reports a measured redundancy %, a per-detector breakdown, and a projected monthly $ waste.

## Tests

```bash
node --test
```

> Note: this is a JS port of the Kotlin `RedundancyAnalyzer` in the Android app
> (`core/analysis/RedundancyAnalyzer.kt`). Keep the two in sync when changing detector logic.
