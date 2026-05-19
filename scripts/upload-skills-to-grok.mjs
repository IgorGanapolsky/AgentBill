#!/usr/bin/env node
// Drives grok.com → My Skills → upload, for each .zip in ../dist/.
// Reuses your existing Chrome profile so authenticated sessions are NOT re-prompted.
//
// Usage:
//   npm i -D playwright
//   node scripts/upload-skills-to-grok.mjs
//
// Or via MCP from a Claude Code session with @playwright/mcp installed:
//   "Open grok.com, log in to my account, and upload every .zip in grok-apps/dist/"
//
// Flags:
//   --headed          show the browser (default: headed; this is interactive UX)
//   --skill NAME      only upload one bundle (NAME without .zip)
//   --profile PATH    Chrome user-data-dir to reuse (default: ~/Library/Application Support/Google/Chrome)
//
// Notes:
// - Mac: if Chrome is open, close it first OR pass a copied profile dir.
//   Chrome won't share a profile dir between two processes.
// - The Skills upload UI on grok.com changes; this script targets the
//   "Create skill" / "Import" affordance by accessible name with fallbacks.

import { chromium } from "playwright";
import { readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "..", "dist");

const argv = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) => {
    if (!a.startsWith("--")) return [];
    const key = a.replace(/^--/, "");
    const next = arr[i + 1];
    return [[key, next && !next.startsWith("--") ? next : true]];
  })
);

const PROFILE =
  argv.profile ||
  join(homedir(), "Library", "Application Support", "Google", "Chrome");
const HEADED = argv.headed !== false;
const ONLY = typeof argv.skill === "string" ? argv.skill : null;

function bundles() {
  return readdirSync(distDir)
    .filter((f) => f.endsWith(".zip"))
    .filter((f) => !ONLY || basename(f, ".zip") === ONLY)
    .map((f) => join(distDir, f))
    .filter((p) => statSync(p).isFile());
}

async function run() {
  const targets = bundles();
  if (targets.length === 0) {
    console.error(`No .zip bundles in ${distDir}. Did you run the build step?`);
    process.exit(1);
  }
  console.log(`[upload] ${targets.length} bundle(s) to upload`);
  console.log(`[upload] profile dir: ${PROFILE}`);

  const ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: !HEADED,
    viewport: { width: 1280, height: 900 },
    args: ["--no-first-run", "--no-default-browser-check"],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());

  await page.goto("https://grok.com/", { waitUntil: "domcontentloaded" });

  // Probe authentication — if a sign-in CTA is dominant, bail with a clear message.
  const signInVisible = await page
    .getByRole("link", { name: /sign\s*in|log\s*in/i })
    .first()
    .isVisible()
    .catch(() => false);
  if (signInVisible) {
    console.error(
      "[upload] Not signed in to grok.com in this Chrome profile. Sign in once, rerun."
    );
    await ctx.close();
    process.exit(2);
  }

  for (const bundlePath of targets) {
    const name = basename(bundlePath, ".zip");
    console.log(`\n[upload] ${name} ← ${bundlePath}`);

    // Try direct deep-link first.
    await page.goto("https://grok.com/skills/new", {
      waitUntil: "domcontentloaded",
    });

    // Find the file input. xAI's UI shifts — we look for the first <input type=file> on the page.
    const fileInput = page.locator('input[type="file"]').first();
    const hasInput = await fileInput.count();
    if (!hasInput) {
      console.warn(
        `[upload] Could not find file input on /skills/new. ` +
          `Open grok.com/skills, click "Create skill" → "Import", then upload ${bundlePath} manually.`
      );
      continue;
    }

    await fileInput.setInputFiles(bundlePath);
    console.log(`[upload] set file ${name}`);

    // Confirm — try multiple button labels.
    const confirm = page
      .getByRole("button", { name: /upload|import|create|save|publish/i })
      .first();
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.click();
      await page.waitForLoadState("networkidle").catch(() => {});
      console.log(`[upload] confirmed ${name}`);
    } else {
      console.warn(`[upload] no confirm button visible — finish ${name} manually`);
    }

    // Small breather between uploads.
    await page.waitForTimeout(1500);
  }

  console.log("\n[upload] Done. Verify on https://grok.com/skills (My Skills).");
  console.log("[upload] Leaving browser open for 30s in case you want to review.");
  await page.waitForTimeout(30_000);
  await ctx.close();
}

run().catch((err) => {
  console.error("[upload] fatal:", err);
  process.exit(1);
});
