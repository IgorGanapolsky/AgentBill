import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, estimateTokens } from "./scan.mjs";

test("empty input has no findings", () => {
  const r = analyze("");
  assert.equal(r.totalTokens, 0);
  assert.equal(r.redundantTokens, 0);
  assert.equal(r.redundancyPercent, 0);
  assert.equal(r.hasFindings, false);
});

test("unique content reports no redundancy", () => {
  const r = analyze(
    [
      "Initialize the deployment pipeline for region us-east-1.",
      "Validate the database migration against the staging schema.",
      "Roll forward the feature flag for premium subscribers only.",
    ].join("\n"),
  );
  assert.equal(r.redundantTokens, 0);
  assert.equal(r.hasFindings, false);
});

test("exact-duplicate blocks count as Repeat Tax", () => {
  const dupe = "ERROR: connection refused while calling the inventory service endpoint";
  const r = analyze(Array(5).fill(dupe).join("\n"));
  assert.ok(r.exactDuplicateTokens > 0);
  assert.equal(r.exactDuplicateTokens, estimateTokens(dupe) * 4); // 5 lines => 4 wasted
  assert.ok(r.hasFindings);
});

test("cache-busting timestamps/uuids detected as volatile repeats", () => {
  const r = analyze(
    [
      "[2026-06-03T10:00:01Z] req id=a1b2c3d4-1111-2222-3333-444455556666 fetch user profile",
      "[2026-06-03T10:05:42Z] req id=a1b2c3d4-7777-2222-3333-444455556666 fetch user profile",
      "[2026-06-03T11:15:09Z] req id=a1b2c3d4-8888-2222-3333-444455556666 fetch user profile",
    ].join("\n"),
  );
  assert.ok(r.volatileRepeatTokens > 0);
  assert.ok(r.cacheBustingBlocks >= 2);
});

test("retry loop of repeated error lines detected", () => {
  const r = analyze(
    [
      "ERROR attempt 1 failed: timeout calling payments service id=aaaa1111",
      "ERROR attempt 2 failed: timeout calling payments service id=bbbb2222",
      "ERROR attempt 3 failed: timeout calling payments service id=cccc3333",
      "ERROR attempt 4 failed: timeout calling payments service id=dddd4444",
    ].join("\n"),
  );
  assert.ok(r.retryLoopTokens > 0);
  assert.ok(r.retryLoopHits >= 3);
});

test("giant json line counted as tool bloat", () => {
  const giant = '{"data":"' + "x".repeat(800) + '":endofdump}';
  const r = analyze(giant);
  assert.ok(r.toolBloatTokens > 0);
  assert.ok(r.hasFindings);
});

test("redundant tokens never exceed total with all detectors", () => {
  const retries = Array.from({ length: 30 }, (_, i) =>
    `ERROR retrying attempt ${i}: Traceback failed to reach inventory service id=${i}`,
  ).join("\n");
  const jsonDump = Array.from({ length: 30 }, (_, i) =>
    `  "field_${i}": "verbose machine generated schema value alpha beta gamma delta"`,
  ).join("\n");
  const r = analyze(`${retries}\n${jsonDump}`);
  assert.ok(r.redundantTokens <= r.totalTokens);
  assert.ok(r.redundancyRatio <= 1.0);
  assert.ok(r.redundancyPercent >= 0 && r.redundancyPercent <= 100);
});

test("estimateTokens uses ~4 chars/token heuristic", () => {
  assert.equal(estimateTokens("a".repeat(400)), 100);
});
