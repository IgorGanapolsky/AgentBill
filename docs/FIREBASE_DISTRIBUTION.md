# Firebase App Distribution — getting test builds to your device

**Why you weren't getting builds:** the CI pipeline only built + tested the app. There was no
step that distributed a build. The `.github/workflows/firebase-distribution.yml` workflow now does
this — but it needs **one secret** you must add (it's a credential, so it can't live in code).

## One-time setup (≈5 min)

1. **Create a Firebase service account**
   - Firebase Console → Project `agentbill-distribution` → ⚙ Project settings → **Service accounts**
     → **Generate new private key** (downloads a JSON file).
   - In Google Cloud IAM, ensure that service account has the role **Firebase App Distribution Admin**.

2. **Add it as a GitHub secret**
   - GitHub → repo **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `FIREBASE_SERVICE_ACCOUNT_JSON`
   - Value: paste the **entire contents** of the JSON file.

3. **Create the tester group**
   - Firebase Console → **App Distribution → Testers & Groups** → create a group named **`internal-testers`**
     and add your own email (and anyone else who should get builds).

## Get a build

- GitHub → **Actions → "Firebase App Distribution" → Run workflow** (optionally type release notes).
- ~3–4 minutes later you (and the `internal-testers` group) get an email / Firebase App Tester notification
  with the installable APK.

## Important caveat

A Firebase-distributed **debug APK is for UI / smoke testing only**. Google Play **Billing
purchases will not work** from it — Play Billing requires the app installed from Play with a matching
signature on a Play track. To test real purchases (RevenueCat / the $49 Pro, $2.99, $1.99 products),
use a **Play Internal Testing** release — see `docs/PUBLISH_CHECKLIST.md`.
