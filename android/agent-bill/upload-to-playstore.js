#!/usr/bin/env node
// CDP-based Play Console uploader for AgentBill.
// Mirrors the Random-Timer/native-android/upload-to-playstore.js pattern.
//
// Prereq: launch Chrome Canary (your authenticated Play Console session) with
// the remote debug port BEFORE running this:
//
//   /Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary \
//     --remote-debugging-port=9222 \
//     --user-data-dir="$HOME/Library/Application Support/Google/Chrome Canary"
//
// Then in another terminal:
//   cd android/agent-bill
//   node upload-to-playstore.js
//
// Flags:
//   --aab PATH     path to AAB (default: app/build/outputs/bundle/release/app-release.aab)
//   --track NAME   track URL slug from Play Console (set --app-url instead for full deep link)
//   --app-url URL  full Play Console deep link to the track release page (recommended)
//   --notes TEXT   release notes; quoted single-line text

const { chromium } = require("playwright");
const path = require("path");

const argv = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) => {
    if (!a.startsWith("--")) return [];
    const key = a.replace(/^--/, "");
    const next = arr[i + 1];
    return [[key, next && !next.startsWith("--") ? next : true]];
  })
);

const AAB =
  argv.aab ||
  path.resolve(__dirname, "app/build/outputs/bundle/release/app-release.aab");

const APP_URL =
  argv["app-url"] ||
  "https://play.google.com/console/u/0/developers"; // fallback: developer list, navigate manually

const NOTES =
  argv.notes ||
  "AgentBill v0.1.0 — initial Internal Track release. Audit AI provider bills for repeat-offender patterns. BYO xAI key.";

async function main() {
  console.log("[upload] connecting to Chrome Canary on :9222");
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const [context] = browser.contexts();
  if (!context) throw new Error("No browser context found over CDP");

  const pages = await context.pages();
  let page = pages.find((p) => p.url().includes("play.google.com/console"));
  if (!page) {
    console.log("[upload] no Play Console tab; opening one");
    page = await context.newPage();
  }

  console.log(`[upload] navigate ${APP_URL}`);
  await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});

  console.log('[upload] click "Create new release"');
  const create = page.getByRole("button", { name: /create new release/i }).first();
  if (await create.count()) {
    await create.click();
    await page.waitForTimeout(2000);
  } else {
    console.log("[upload] no 'Create new release' button; assuming you're on the right view");
  }

  console.log(`[upload] uploading AAB: ${AAB}`);
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(AAB);

  console.log("[upload] waiting for upload to finish (≤2 min)...");
  await page.waitForSelector('button:has-text("Save"):not([disabled])', { timeout: 120_000 });

  console.log("[upload] filling release notes");
  const notesField = page.locator("textarea").first();
  if (await notesField.count()) {
    await notesField.fill(NOTES);
    await page.waitForTimeout(1000);
  }

  console.log("[upload] save → review → rollout");
  await page.click('button:has-text("Save"):not([disabled])');
  await page.waitForTimeout(2500);

  const review = page.getByRole("button", { name: /review release/i }).first();
  if (await review.count()) await review.click();
  await page.waitForTimeout(2000);

  const rollout = page.getByRole("button", { name: /start rollout/i }).first();
  if (await rollout.count()) {
    await rollout.click();
    console.log("[upload] rollout started");
  } else {
    console.warn("[upload] no 'Start rollout' button visible; finish rollout in the UI");
  }

  await browser.close();
  console.log("[upload] done. Verify at https://play.google.com/console");
}

main().catch((err) => {
  console.error("[upload] fatal:", err);
  process.exit(1);
});
