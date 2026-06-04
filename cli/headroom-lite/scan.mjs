#!/usr/bin/env node
// headroom-lite — local, deterministic Repeat Tax scanner for agent logs.
//
// A Node port of AgentBill's Kotlin RedundancyAnalyzer, built as a CLI/CI gate because that is
// where LLM token-burn actually happens (the dev machine / pipeline), not on a phone. Inspired by
// Netflix's open-source Headroom proxy: ~90% of tokens fed to an LLM are redundant machine
// metadata (duplicate blocks, cache-busting timestamps/UUIDs, retry loops, bloated tool output)
// rather than human-written prompts. Zero dependencies, zero network — it measures, it never sends.

const CHARS_PER_TOKEN = 4;
const MIN_BLOCK_CHARS = 12;
const RUNS_PER_MONTH = 22;
const RETRY_REPEAT_THRESHOLD = 3;
const MAX_TOOL_BLOCK_TOKENS = 200;
const BLOAT_LINE_CHARS = 600;
const VOLATILE_PLACEHOLDER = " V ";

const ISO_TIMESTAMP = /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?/g;
const UUID_RE = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
const HEX_OR_NUMBER = /\b(?:0x)?[0-9a-fA-F]{8,}\b|\b\d+(?:\.\d+)?\b/g;
const RETRY_MARKER = /retry|retrying|attempt|ERROR|Traceback|failed/i;
const JSON_DUMP_LINE = /^\s*["{].*:/;

export function estimateTokens(text) {
  return text.length === 0 ? 0 : Math.round(text.length / CHARS_PER_TOKEN);
}

function normalize(line) {
  return line
    .replace(ISO_TIMESTAMP, VOLATILE_PLACEHOLDER)
    .replace(UUID_RE, VOLATILE_PLACEHOLDER)
    .replace(HEX_OR_NUMBER, VOLATILE_PLACEHOLDER);
}

/**
 * Analyze a raw log/transcript string. Returns measured redundancy — all four detectors fold into
 * `redundantTokens`, capped at `totalTokens` so overlapping findings never double-count.
 */
export function analyze(input, { usdPerMillionInputTokens = 3.0 } = {}) {
  const lines = input.split("\n");
  const totalTokens = estimateTokens(input);

  // 1. Exact-duplicate blocks — the literal Repeat Tax.
  const exact = new Map();
  // 2. Volatile near-duplicates — cache-busting timestamps/UUIDs/numbers masked out.
  const normalized = new Map();
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_BLOCK_CHARS) continue;
    exact.set(trimmed, (exact.get(trimmed) ?? 0) + 1);
    const norm = normalize(trimmed);
    normalized.set(norm, (normalized.get(norm) ?? 0) + 1);
  }

  let exactDuplicateTokens = 0;
  for (const [line, count] of exact) {
    if (count > 1) exactDuplicateTokens += estimateTokens(line) * (count - 1);
  }

  let volatileRepeatTokens = 0;
  let cacheBustingBlocks = 0;
  for (const [line, count] of normalized) {
    if (count > 1 && line.includes(VOLATILE_PLACEHOLDER)) {
      cacheBustingBlocks += count;
      volatileRepeatTokens += estimateTokens(line) * (count - 1);
    }
  }

  // 3. Retry loops — the same failing operation re-emitted 3+ times after volatile ids are masked.
  const retry = new Map();
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_BLOCK_CHARS || !RETRY_MARKER.test(trimmed)) continue;
    const norm = normalize(trimmed);
    retry.set(norm, (retry.get(norm) ?? 0) + 1);
  }
  let retryLoopTokens = 0;
  let retryLoopHits = 0;
  for (const [line, count] of retry) {
    if (count >= RETRY_REPEAT_THRESHOLD) {
      retryLoopHits += count;
      retryLoopTokens += estimateTokens(line) * (count - 1);
    }
  }

  // 4. Tool-output bloat — a mammoth single line or a contiguous JSON/schema run past the budget.
  let toolBloatTokens = 0;
  let jsonRunTokens = 0;
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (trimmed.length > BLOAT_LINE_CHARS) {
      const overflow = estimateTokens(trimmed) - MAX_TOOL_BLOCK_TOKENS;
      if (overflow > 0) toolBloatTokens += overflow;
    }
    if (JSON_DUMP_LINE.test(raw)) {
      jsonRunTokens += estimateTokens(raw);
    } else if (jsonRunTokens > 0) {
      const overflow = jsonRunTokens - MAX_TOOL_BLOCK_TOKENS;
      if (overflow > 0) toolBloatTokens += overflow;
      jsonRunTokens = 0;
    }
  }
  if (jsonRunTokens > 0) {
    const overflow = jsonRunTokens - MAX_TOOL_BLOCK_TOKENS;
    if (overflow > 0) toolBloatTokens += overflow;
  }

  const redundantTokens = Math.min(
    exactDuplicateTokens + volatileRepeatTokens + retryLoopTokens + toolBloatTokens,
    totalTokens,
  );
  const redundancyRatio = totalTokens === 0 ? 0 : redundantTokens / totalTokens;
  const projectedMonthlyWasteUsd =
    (redundantTokens / 1_000_000) * usdPerMillionInputTokens * RUNS_PER_MONTH;

  return {
    totalTokens,
    redundantTokens,
    redundancyRatio,
    redundancyPercent: Math.round(redundancyRatio * 100),
    exactDuplicateTokens,
    volatileRepeatTokens,
    cacheBustingBlocks,
    retryLoopTokens,
    retryLoopHits,
    toolBloatTokens,
    projectedMonthlyWasteUsd,
    hasFindings: redundantTokens > 0,
  };
}

export function formatReport(r) {
  return [
    "💸 Repeat Tax scan (measured locally, no API call)",
    `  Redundancy:            ${r.redundancyPercent}%  (${r.redundantTokens} / ${r.totalTokens} tokens)`,
    `  Exact-duplicate:       ${r.exactDuplicateTokens} tokens`,
    `  Cache-busting blocks:  ${r.cacheBustingBlocks}  (${r.volatileRepeatTokens} tokens)`,
    `  Retry-loop hits:       ${r.retryLoopHits}  (${r.retryLoopTokens} tokens)`,
    `  Tool-output bloat:     ${r.toolBloatTokens} tokens`,
    `  Projected waste:       $${r.projectedMonthlyWasteUsd.toFixed(2)}/mo (~22 runs/mo @ $3/1M input)`,
  ].join("\n");
}

// ---- CLI entry -------------------------------------------------------------
// Usage:
//   node scan.mjs <logfile> [--fail-over <percent>]
//   cat session.log | node scan.mjs --fail-over 40
// Exits non-zero when redundancy exceeds --fail-over, so it can gate CI.
function isMain() {
  return import.meta.url === `file://${process.argv[1]}`;
}

async function readInput(args) {
  const fileArg = args.find((a) => !a.startsWith("--"));
  if (fileArg) {
    const { readFileSync } = await import("node:fs");
    return readFileSync(fileArg, "utf8");
  }
  // stdin
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

if (isMain()) {
  const args = process.argv.slice(2);
  const failIdx = args.indexOf("--fail-over");
  const failOver = failIdx >= 0 ? Number(args[failIdx + 1]) : null;
  // Strip the flag + its value only when present; otherwise keep all positional args (the filename).
  const positional =
    failIdx >= 0 ? args.filter((_, i) => i !== failIdx && i !== failIdx + 1) : args;
  const input = await readInput(positional);
  const report = analyze(input);
  console.log(formatReport(report));
  if (failOver != null && report.redundancyPercent > failOver) {
    console.error(`\n✗ redundancy ${report.redundancyPercent}% exceeds threshold ${failOver}%`);
    process.exit(2);
  }
}
