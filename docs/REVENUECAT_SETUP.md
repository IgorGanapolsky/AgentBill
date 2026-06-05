# RevenueCat Setup Runbook — AgentBill

Finish wiring **real billing** for AgentBill. The Android code and all 3 Play Console
products are already done — this runbook only covers the RevenueCat dashboard config and the
single code change still required.

## What is already done (do NOT redo)

- **Code** — `core/billing/RevenueCatBilling.kt` calls the RevenueCat `Purchases` SDK. It expects:
  - Entitlement id: `pro`
  - Subscription product: `agentbill_pro_monthly`
  - One-time products: `agentbill_intro_7day`, `agentbill_single_audit`
  - On a verified Pro purchase it sets `subscribed = true`; on `agentbill_intro_7day` it grants
    **10 audit credits**; on `agentbill_single_audit` it grants **1 audit credit**.
- **Play Console** — all 3 products created and **ACTIVE**, app package `com.iganapolsky.agentbill`:
  - `agentbill_pro_monthly` — subscription, base plan `monthly`, **$49/mo**
  - `agentbill_intro_7day` — one-time, **$2.99**
  - `agentbill_single_audit` — one-time, **$1.99**

The only thing missing is connecting RevenueCat to Play + dropping in the real public SDK key.

---

## Steps

### 1. Create / confirm the RevenueCat Project and connect Google Play

1. Go to <https://app.revenuecat.com> and sign in.
2. Create a Project (or open the existing AgentBill project).
3. In the Project, go to **Project settings → Apps → + New** and choose **Google Play Store**.
4. Set the **Package name** to exactly: `com.iganapolsky.agentbill`
5. Upload the **Google Play service-account credentials JSON** in the app's
   *Service Account credentials JSON* field. This is what lets RevenueCat call the Google Play
   Developer API to verify and validate purchases server-side.
   - The service account must have access to your Play Console (Play Console → **Users and
     permissions**) with at least **View financial data** and **Manage orders and subscriptions**.
   - If you have not created one: Google Play Console → **Setup → API access** → create/link a
     Google Cloud project → create a service account → grant it Play permissions → download its
     JSON key. Then upload that JSON here.
6. Save. RevenueCat will show the connection as healthy once it can reach the Play API (this can
   take a few minutes after granting permissions).

### 2. Get the public Google SDK API key and put it in the code

1. In RevenueCat: **Project settings → API keys**.
2. Copy the **Google / Public app-specific SDK key** for the Android app you just added
   (it is the *public* SDK key — usually prefixed `goog_…`).
   - This is the **public SDK key**, NOT a secret/server key. It is safe to ship in the app.
     Do **not** use a secret key (`sk_…`) here.
3. Open `core/telemetry/TelemetryService.kt`. Replace the placeholder string
   `"placeholder_revenuecat_api_key"` (in the `Purchases.configure(...)` call) with the real key.

   **Recommended (not hardcoded):** put the key in a `BuildConfig` field instead of inlining it.
   - In `app/build.gradle(.kts)`, inside the relevant `buildType`/`defaultConfig`:
     ```kotlin
     buildConfigField("String", "REVENUECAT_PUBLIC_KEY", "\"goog_your_real_key_here\"")
     ```
     (and ensure `buildFeatures { buildConfig = true }` is enabled)
   - Then in `TelemetryService.kt`, use `BuildConfig.REVENUECAT_PUBLIC_KEY` in place of the
     placeholder string. This keeps the key out of source and lets you vary it per build type.

### 3. Import the 3 Play products into RevenueCat

1. In RevenueCat: **Products → + New** (or **Import** from Google Play).
2. Add each of these so their RevenueCat product identifiers match the Play product ids **exactly**:
   - `agentbill_pro_monthly` (subscription — select base plan `monthly`)
   - `agentbill_intro_7day` (one-time)
   - `agentbill_single_audit` (one-time)
3. The identifiers must match character-for-character — the app passes these exact ids to
   `getProducts` / `purchase`.

### 4. Create the `pro` Entitlement and attach the subscription

1. In RevenueCat: **Entitlements → + New**.
2. Set the Entitlement **identifier** to exactly: `pro`
   (the app checks `customerInfo.entitlements["pro"].isActive`, so this string must match).
3. **Attach** the `agentbill_pro_monthly` product to the `pro` entitlement.
4. Do **not** attach the one-time products to `pro` — the app grants their credits directly in
   `grantEntitlement(...)` based on the product id, independent of the entitlement.

### 5. (Optional) Offerings + Packages

- Creating an **Offering** with packages is **optional** for AgentBill. The current code purchases
  by **product id directly** via `getProducts` / `purchaseWith(PurchaseParams.Builder(activity, product))`,
  so it does not read Offerings.
- Set one up only if you later want to drive paywalls/AB-testing from the dashboard. It will not
  change current behavior.

### 6. Testing (sandbox)

1. **Play Console → Setup → License testing**: add your tester Google account(s) as license
   testers (these get sandbox / no-charge purchases).
2. The tester account must also be on an **internal testing** track and have **opted in** to test
   the app.
3. Build a **release/internal AAB** that includes the real billing key (Step 2) — sandbox billing
   does **not** work on plain debug builds installed via Android Studio; install via an internal
   testing track link.
4. Install on a device signed in with the license-tester account, open AgentBill, and attempt a
   purchase.

---

## Acceptance check

You are done when, signed in as a **license tester** on an internal-testing build with the real
public SDK key:

1. **Pro unlocks the app** — purchase `agentbill_pro_monthly` ($49/mo). The purchase completes,
   RevenueCat reports the `pro` entitlement `isActive = true`, and the app flips to subscribed
   (Pro features unlocked).
2. **Intro grants credits** — purchase `agentbill_intro_7day` ($2.99). The app grants **10 audit
   credits**.
3. **Single grants a credit** — purchase `agentbill_single_audit` ($1.99). The app grants **1
   audit credit**.

If a purchase returns "Product ... is not available", recheck Steps 1–3 (Play connection, product
ids imported and matching exactly, products ACTIVE in Play). If Pro purchases succeed but the app
does not unlock, recheck Step 4 (entitlement id is exactly `pro` and `agentbill_pro_monthly` is
attached to it).
