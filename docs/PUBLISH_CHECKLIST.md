# AgentBill — Production Publish Checklist

App: **AgentBill — AI Cost Auditor**
Package: `com.iganapolsky.agentbill`
Play Console app id: `4973243580627455820`
Developer account: `8239620436488925047`

## Status snapshot (factual)

- The Play Console dashboard **still shows the "Release your app" onboarding** and only a partial Production progress bar. The app has **NOT** completed a production launch.
- Internal / Closed test tracks **CANNOT bill**. Only the **Production** track bills (open testing can in some cases). To collect money, this app must reach a Production release.
- A signed release AAB exists locally and signing is configured (versionCode 7, versionName 0.1.3, applicationId `com.iganapolsky.agentbill`). **The build is not the blocker** — the App content paperwork plus an actual Production release are.
- Real billing code was merged to `main` (commit `f59cfea`). The existing local AAB **predates** real billing, so a **new AAB built from merged `main`** must be uploaded.
- The 3 in-app products are already created and **ACTIVE**.

> POLICY RISK — read before submitting: If the **"Watch Sponsor Ad"** feature is still present at submission, it is a **policy-rejection risk** (a fake / non-functional ad violates Play policy). Remove it or wire it to a real ad SDK before sending for review.

---

## A. App content declarations (gate Production — all currently UNCHECKED)

Play Console → **Policy → App content**. Production rollout is blocked until each of these is completed.

- [ ] **A1. Privacy policy URL** — provide a live, public privacy policy URL in App content (a GH Pages privacy policy already exists from prior work; confirm the URL resolves and is current for the billing build).
- [ ] **A2. Data safety form** — complete and submit. Declare what data the app collects/shares (note any account, purchase, device, or analytics data), encryption in transit, and deletion options. Must match actual app behavior, including the billing code merged in `f59cfea`.
- [ ] **A3. Content rating questionnaire** — complete the IARC questionnaire and apply the resulting rating.
- [ ] **A4. Target audience and content** — select target age groups (not children-directed) and confirm appeal-to-children settings.
- [ ] **A5. Ads declaration** — declare whether the app **contains ads**. NOTE: this must be consistent with the "Watch Sponsor Ad" feature decision above — do not declare "no ads" while shipping an ad-styled feature, and do not declare real ads for a fake one.
- [ ] **A6. Government apps** — declare (almost certainly **not** a government app).
- [ ] **A7. Financial features** — review the Financial features declaration. AgentBill audits AI **cost/billing data**; confirm whether any financial-features categories apply and declare accordingly (likely "none of these" if it only reports spend and does not handle banking/lending/payments beyond Play billing).
- [ ] **A8. News declaration** — declare it is **not** a news app.

---

## B. Store listing assets (repo notes images "not yet produced")

Play Console → **Grow → Store presence → Main store listing**. Production requires:

- [ ] **B1. App icon** — 512 × 512 PNG (32-bit, with alpha).
- [ ] **B2. Feature graphic** — 1024 × 500 PNG or JPG.
- [ ] **B3. Phone screenshots** — **minimum 2** (PNG/JPG; 2:1 to 1:2 aspect, 320–3840 px per side).
- [ ] **B4. Listing text** — app name ("AgentBill — AI Cost Auditor"), short description, full description.

---

## C. Build and upload (new AAB from merged `main`)

- [ ] **C1. Bump versionCode** above 7 (e.g. 8) for the Production AAB. Update versionName if desired.
- [ ] **C2. Confirm working tree is on merged `main` including billing commit `f59cfea`** before building.
- [ ] **C3. Build a signed release AAB** from merged `main` using the configured signing config (applicationId `com.iganapolsky.agentbill`). The previously committed local AAB is stale and must not be reused.
- [ ] **C4. Create a Production release** (Play Console → **Release → Production → Create new release**) and **upload the new AAB**.
- [ ] **C5. Add release notes / what's new** for the release.

---

## D. Pricing / Countries + Play billing

- [ ] **D1. In-app products** — already created and **ACTIVE** (3 products). *(Done — confirm they still show Active.)*
- [ ] **D2. App pricing** — set the app as **Free** (with in-app purchases). Play does not bill for the app install itself; revenue comes through the active IAPs.
- [ ] **D3. Countries / regions** — select the countries/regions where the app is available for the Production release.

---

## E. Send for review → Production rollout

- [ ] **E1.** Resolve every blocker flagged on the Production release page (all of section A complete, listing assets in B uploaded, AAB from C attached, pricing/countries from D set).
- [ ] **E2. Re-check the "Watch Sponsor Ad" decision** — confirm it is removed or backed by a real ad integration so the submission is not rejected.
- [ ] **E3.** Click **Send for review** on the Production release.
- [ ] **E4.** After approval, **roll out to Production** (set rollout percentage to 100% or staged as desired).
- [ ] **E5.** Verify the dashboard "Release your app" onboarding clears and the Production track shows **live**, then run a real purchase to confirm billing works end-to-end.
