#!/usr/bin/env bash
# preflight-release.sh — Pre-release validation for AgentBill
# Ensures store listing metadata, privacy policy, changelogs, and build
# integrity are all present and correct before publishing.
#
# Usage:
#   ./scripts/preflight-release.sh --platform android [--layer 1|2] [--skip-store-assets]
#
# Layers:
#   1 (default) — Metadata & file checks only (fast, no build)
#   2           — Full validation including Gradle builds

set -euo pipefail

# ── Globals ──────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PLATFORM="android"
LAYER=1
SKIP_STORE_ASSETS=false
ERRORS=()
WARNINGS=()

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Helpers ──────────────────────────────────────────────────────────────────

usage() {
  cat <<EOF
Usage: $(basename "$0") --platform android [--layer 1|2]
EOF
  exit 0
}

err() { ERRORS+=("❌ $1"); }
warn() { WARNINGS+=("⚠️  $1"); }
info() { echo -e "${CYAN}▸${RESET} $1"; }
header() { echo -e "\n${BOLD}═══ $1 ═══${RESET}"; }

check_file_exists() {
  local path="$1" label="$2"
  if [[ ! -f "$path" ]]; then
    err "$label missing: $path"
    return 1
  fi
  return 0
}

check_file_nonempty() {
  local path="$1" label="$2"
  if [[ ! -f "$path" ]]; then
    err "$label missing: $path"
    return 1
  fi
  if [[ ! -s "$path" ]]; then
    err "$label is empty: $path"
    return 1
  fi
  return 0
}

check_dir_has_files() {
  local dir="$1" pattern="$2" label="$3" min="${4:-1}"
  local count
  count=$(find "$dir" -maxdepth 1 -name "$pattern" -type f 2>/dev/null | wc -l | tr -d ' ')
  if (( count < min )); then
    err "$label: expected at least $min file(s) matching '$pattern' in $dir, found $count"
    return 1
  fi
  return 0
}

# ── Parse args ───────────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    --platform)          PLATFORM="$2"; shift 2 ;;
    --layer)             LAYER="$2";    shift 2 ;;
    --skip-store-assets) SKIP_STORE_ASSETS=true; shift ;;
    -h|--help)           usage ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

if [[ "$PLATFORM" != "android" ]]; then
  echo "Invalid --platform: $PLATFORM (must be android)"
  exit 2
fi

if [[ "$LAYER" != "1" && "$LAYER" != "2" ]]; then
  echo "Invalid --layer: $LAYER (must be 1 or 2)"
  exit 2
fi

echo -e "${BOLD}AgentBill — Preflight Release Check${RESET}"
echo "Platform: $PLATFORM | Layer: $LAYER"
echo "Project:  $PROJECT_ROOT"
if [[ "$SKIP_STORE_ASSETS" == "true" ]]; then
  info "Store screenshot/media checks skipped for internal distribution"
fi

# ── Extract versions ─────────────────────────────────────────────────────────

header "Version Detection"

ANDROID_VERSION_NAME=""
ANDROID_VERSION_CODE=""

GRADLE_FILE="$PROJECT_ROOT/android/Agent-Bill/app/build.gradle.kts"
if [[ -f "$GRADLE_FILE" ]]; then
  ANDROID_VERSION_NAME=$(sed -n 's/.*versionName *= *"\([^"]*\)".*/\1/p' "$GRADLE_FILE" | head -1)
  ANDROID_VERSION_CODE=$(sed -n 's/.*versionCode *= *\([0-9][0-9]*\).*/\1/p' "$GRADLE_FILE" | head -1)
  if [[ -z "$ANDROID_VERSION_CODE" ]]; then
    ANDROID_VERSION_CODE=$(sed -n 's/.*versionCode *=.*?: *\([0-9][0-9]*\).*/\1/p' "$GRADLE_FILE" | head -1)
  fi
  info "Android: v${ANDROID_VERSION_NAME:-?} (code ${ANDROID_VERSION_CODE:-?})"
else
  err "Gradle build file not found: $GRADLE_FILE"
fi

# ══════════════════════════════════════════════════════════════════════════════
# LAYER 1 — Metadata & File Checks
# ══════════════════════════════════════════════════════════════════════════════

# ── Privacy Policy ───────────────────────────────────────────────────────────

header "Privacy Policy"

PRIVACY_FILE="$PROJECT_ROOT/PRIVACY_POLICY.md"
PRIVACY_DRAFT_FILE="$PROJECT_ROOT/android/Agent-Bill/privacy-policy-draft.md"

if [[ -f "$PRIVACY_FILE" ]]; then
  info "PRIVACY_POLICY.md present ($(wc -l < "$PRIVACY_FILE" | tr -d ' ') lines)"
elif [[ -f "$PRIVACY_DRAFT_FILE" ]]; then
  info "privacy-policy-draft.md present ($(wc -l < "$PRIVACY_DRAFT_FILE" | tr -d ' ') lines)"
else
  warn "Neither PRIVACY_POLICY.md nor privacy-policy-draft.md was found"
fi

# ── Android Metadata ─────────────────────────────────────────────────────────

header "Android Store Listing"

ANDROID_META="$PROJECT_ROOT/android/Agent-Bill/fastlane/metadata/android/en-US"

# Required text files
for f in title.txt short_description.txt full_description.txt; do
  check_file_nonempty "$ANDROID_META/$f" "Android $f" || true
done

if [[ "$SKIP_STORE_ASSETS" != "true" ]]; then
  # Changelog for current version code
  if [[ -n "$ANDROID_VERSION_CODE" ]]; then
    CHANGELOG="$ANDROID_META/changelogs/${ANDROID_VERSION_CODE}.txt"
    if check_file_nonempty "$CHANGELOG" "Android changelog (versionCode $ANDROID_VERSION_CODE)"; then
      info "Changelog $ANDROID_VERSION_CODE.txt present"
    fi
  else
    warn "Could not detect Android versionCode — skipping changelog check"
  fi

  # Screenshots
  SCREENSHOTS_DIR="$ANDROID_META/images/phoneScreenshots"
  if [[ -d "$SCREENSHOTS_DIR" ]]; then
    check_dir_has_files "$SCREENSHOTS_DIR" "*.png" "Android phone screenshots" 1
    SHOT_COUNT=$(find "$SCREENSHOTS_DIR" -name "*.png" -type f | wc -l | tr -d ' ')
    info "Phone screenshots: $SHOT_COUNT found"
  else
    warn "Android phoneScreenshots directory missing: $SCREENSHOTS_DIR"
  fi

  # Feature graphic
  FG_DIR="$ANDROID_META/images/featureGraphic"
  if [[ -d "$FG_DIR" ]]; then
    check_dir_has_files "$FG_DIR" "*.png" "Android feature graphic" 1
  else
    warn "Android featureGraphic directory missing"
  fi

  # App icon
  if [[ -f "$ANDROID_META/images/icon.png" ]]; then
    info "Android store icon present"
  fi
fi

# Description length checks
if [[ -f "$ANDROID_META/short_description.txt" ]]; then
  SHORT_LEN=$(wc -c < "$ANDROID_META/short_description.txt" | tr -d ' ')
  if (( SHORT_LEN > 80 )); then
    err "Android short_description.txt exceeds 80 char limit ($SHORT_LEN chars)"
  fi
fi

if [[ -f "$ANDROID_META/title.txt" ]]; then
  TITLE_LEN=$(wc -c < "$ANDROID_META/title.txt" | tr -d ' ')
  if (( TITLE_LEN > 30 )); then
    err "Android title.txt exceeds 30 char limit ($TITLE_LEN chars)"
  fi
fi

# ══════════════════════════════════════════════════════════════════════════════
# LAYER 2 — Build Validation (optional)
# ══════════════════════════════════════════════════════════════════════════════

if [[ "$LAYER" == "2" ]]; then
  header "Android Build Check"
  info "Running: ./gradlew assembleDebug (dry-run build)"
  if (cd "$PROJECT_ROOT/android/Agent-Bill" && ./gradlew assembleDebug --no-daemon 2>&1); then
    info "Android debug build succeeded"
  else
    err "Android debug build failed — check Gradle output above"
  fi
fi

# ══════════════════════════════════════════════════════════════════════════════
# RESULTS
# ══════════════════════════════════════════════════════════════════════════════

header "Results"

if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo -e "${YELLOW}Warnings (${#WARNINGS[@]}):${RESET}"
  for w in "${WARNINGS[@]}"; do
    echo -e "  ${YELLOW}$w${RESET}"
  done
fi

if [[ ${#ERRORS[@]} -gt 0 ]]; then
  echo -e "\n${RED}Errors (${#ERRORS[@]}):${RESET}"
  for e in "${ERRORS[@]}"; do
    echo -e "  ${RED}$e${RESET}"
  done
  echo ""
  echo -e "${RED}${BOLD}PREFLIGHT FAILED${RESET} — fix the errors above before releasing."
  exit 1
fi

echo ""
echo -e "${GREEN}${BOLD}✅ PREFLIGHT PASSED${RESET} — all checks clear for ${PLATFORM}."
if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo -e "${YELLOW}  (${#WARNINGS[@]} warning(s) — review above)${RESET}"
fi
exit 0
