#!/usr/bin/env python3
"""Post-upload release verification for Google Play.

Queries official APIs to confirm that uploaded builds landed on the correct
track and processed successfully.

Exit codes:
    0 - All checks passed
    1 - Verification failed (build missing, wrong track, processing error)
    2 - Configuration error (missing credentials, invalid arguments)

Usage:
    python scripts/verify_release.py --platform android --track alpha --version-code 5
"""

import argparse
import json
import os
import sys
import tempfile
import time
from pathlib import Path
from typing import Optional

try:
    from repo_dotenv import load_repo_dotenv

    load_repo_dotenv(Path(__file__).resolve().parent.parent)
except Exception:
    pass


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ANDROID_PACKAGE = "com.iganapolsky.agentbill"

DEFAULT_POLL_INTERVAL = 30  # seconds
DEFAULT_TIMEOUT = 600  # 10 minutes


# ---------------------------------------------------------------------------
# Google Play Verifier
# ---------------------------------------------------------------------------

class GooglePlayVerifier:
    """Verify a build exists on the expected Google Play track (read-only)."""

    def __init__(self, package_name: str = ANDROID_PACKAGE):
        self.package_name = package_name
        self.service = None
        self._service_account_email: Optional[str] = None

    @staticmethod
    def _patch_importlib_metadata():
        """Patch stdlib importlib.metadata for Python < 3.10 compatibility."""
        try:
            import importlib.metadata as md  # stdlib
            if hasattr(md, "packages_distributions"):
                return
            import importlib_metadata as md_backport  # type: ignore
            md.packages_distributions = md_backport.packages_distributions  # type: ignore[attr-defined]
        except Exception:
            pass

    @staticmethod
    def _resolve_google_play_key() -> str:
        """Return GOOGLE_PLAY_JSON_KEY(_PATH) or a conventional fallback path."""
        key_env = (os.environ.get("GOOGLE_PLAY_JSON_KEY") or "").strip()
        if key_env:
            return key_env

        key_path = (os.environ.get("GOOGLE_PLAY_JSON_KEY_PATH") or "").strip()
        if key_path:
            return key_path

        fallback = os.path.join(tempfile.gettempdir(), "play-service-account.json")
        if os.path.isfile(fallback):
            return fallback

        return ""

    def _extract_service_account_email(self, key_value: str) -> Optional[str]:
        """Return client_email from a service account JSON (path or raw JSON)."""
        try:
            if os.path.isfile(key_value):
                with open(key_value, "r", encoding="utf-8") as f:
                    info = json.load(f)
            else:
                info = json.loads(key_value)
            email = info.get("client_email")
            return str(email) if email else None
        except Exception:
            return None

    def authenticate(self):
        """Build the androidpublisher service from GOOGLE_PLAY_JSON_KEY."""
        self._patch_importlib_metadata()
        try:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build
        except ImportError:
            print("❌ Missing google-api-python-client / google-auth. "
                  "Install: pip install google-api-python-client google-auth",
                  file=sys.stderr)
            sys.exit(2)

        key_env = self._resolve_google_play_key()
        if not key_env:
            print(
                "❌ Missing Google Play service account key.\n"
                "Set one of:\n"
                "  - GOOGLE_PLAY_JSON_KEY (path or raw JSON)\n"
                "  - GOOGLE_PLAY_JSON_KEY_PATH (path)\n"
                "Or ensure the temp fallback exists "
                f"({os.path.join(tempfile.gettempdir(), 'play-service-account.json')}).",
                  file=sys.stderr)
            sys.exit(2)

        self._service_account_email = self._extract_service_account_email(key_env)

        scopes = ["https://www.googleapis.com/auth/androidpublisher"]

        if os.path.isfile(key_env):
            credentials = service_account.Credentials.from_service_account_file(
                key_env, scopes=scopes
            )
        else:
            info = json.loads(key_env)
            credentials = service_account.Credentials.from_service_account_info(
                info, scopes=scopes
            )

        self.service = build("androidpublisher", "v3", credentials=credentials)

    def verify(self, track: str, version_code: int) -> dict:
        """Check that version_code appears on the given track."""
        if self.service is None:
            self.authenticate()

        edits = self.service.edits()
        edit_id = None

        try:
            edit = edits.insert(body={}, packageName=self.package_name).execute()
            edit_id = edit["id"]

            track_info = edits.tracks().get(
                packageName=self.package_name,
                editId=edit_id,
                track=track,
            ).execute()

            releases = track_info.get("releases", [])
            for release in releases:
                codes = [int(c) for c in release.get("versionCodes", [])]
                if version_code in codes:
                    status = release.get("status", "unknown")
                    return {
                        "passed": status in ("completed", "inProgress", "draft", "halted"),
                        "status": status,
                        "details": (
                            f"versionCode {version_code} found on '{track}' "
                            f"track with status '{status}'"
                        ),
                    }

            all_codes = []
            for r in releases:
                all_codes.extend(r.get("versionCodes", []))
            return {
                "passed": False,
                "status": "NOT_FOUND",
                "details": (
                    f"versionCode {version_code} not found on '{track}' track. "
                    f"Codes on track: {all_codes or 'none'}"
                ),
            }

        except Exception as e:
            details = f"Google Play API error: {e}"
            if "403" in str(e) and self._service_account_email:
                details += (
                    f"\n  Service account: {self._service_account_email}\n"
                    "  Fix: Add this service account as a user in Play Console with\n"
                    "  sufficient access to the app, and ensure 'API access' is set up."
                )
            return {
                "passed": False,
                "status": "ERROR",
                "details": details,
            }
        finally:
            if edit_id is not None:
                try:
                    edits.delete(
                        packageName=self.package_name, editId=edit_id
                    ).execute()
                except Exception:
                    pass


# ---------------------------------------------------------------------------
# Output Formatting
# ---------------------------------------------------------------------------

def print_results(results: list[dict]):
    """Print a formatted verification table."""
    print()
    print("══ Release Verification ══════════════════════════════")
    print(f"{'Platform':<10}{'Track':<12}{'Version':<10}{'Status'}")
    print(f"{'────────':<10}{'──────────':<12}{'─────────':<10}{'──────────────────'}")

    all_passed = True
    for r in results:
        icon = "✅" if r["passed"] else "❌"
        print(f"{r['platform']:<10}{r['track']:<12}{r['version']:<10}{icon} {r['status']}")
        if not r["passed"]:
            all_passed = False
            print(f"{'':>10}{r['details']}")

    print("══════════════════════════════════════════════════════")
    if all_passed:
        print("Result: ALL PASSED")
    else:
        print("Result: FAILED — see details above")
    print()
    return all_passed


# ---------------------------------------------------------------------------
# Polling
# ---------------------------------------------------------------------------

def poll_until_done(verify_fn, poll_interval: int, timeout: int, terminal_statuses: Optional[set[str]] = None) -> dict:
    """Call verify_fn repeatedly until it passes or times out."""
    deadline = time.time() + timeout
    attempt = 0
    terminal_statuses = terminal_statuses or {"ERROR"}

    while True:
        attempt += 1
        result = verify_fn()

        if result["passed"]:
            return result

        if result["status"] in terminal_statuses:
            return result

        remaining = deadline - time.time()
        if remaining <= 0:
            result["details"] += f" (timed out after {timeout}s, {attempt} attempts)"
            return result

        wait = min(poll_interval, remaining)
        print(f"  ⏳ {result['status']} — retrying in {int(wait)}s "
              f"({int(remaining)}s remaining)...")
        time.sleep(wait)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Verify that uploaded builds landed on the correct store track."
    )
    parser.add_argument(
        "--platform",
        choices=["android"],
        required=True,
        help="Platform to verify",
    )
    parser.add_argument(
        "--track",
        default="alpha",
        help="Google Play track to check (default: alpha)",
    )
    parser.add_argument(
        "--version-code",
        type=int,
        required=True,
        help="Android versionCode to look for",
    )
    parser.add_argument(
        "--version",
        help="Android versionName",
    )
    parser.add_argument(
        "--wait",
        action="store_true",
        help="Poll until build finishes processing",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT,
        help=f"Max seconds to wait in --wait mode (default: {DEFAULT_TIMEOUT})",
    )
    parser.add_argument(
        "--poll-interval",
        type=int,
        default=DEFAULT_POLL_INTERVAL,
        help=f"Seconds between polls in --wait mode (default: {DEFAULT_POLL_INTERVAL})",
    )
    parser.add_argument(
        "--json-out",
        help="Optional path for machine-readable verification evidence JSON.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    results = []

    print(f"🔍 Verifying Android: versionCode {args.version_code} on '{args.track}' track...")
    gp = GooglePlayVerifier()

    if args.wait:
        result = poll_until_done(
            lambda: gp.verify(args.track, args.version_code),
            args.poll_interval,
            args.timeout,
            terminal_statuses={"ERROR"},
        )
    else:
        result = gp.verify(args.track, args.version_code)

    results.append({
        "platform": "Android",
        "track": args.track,
        "version": f"{args.version_code}" + (f" ({args.version})" if args.version else ""),
        **result,
    })

    all_passed = print_results(results)
    if args.json_out:
        output_path = Path(args.json_out)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(
            json.dumps(
                {
                    "passed": all_passed,
                    "platform": args.platform,
                    "track": args.track,
                    "version": args.version,
                    "version_code": args.version_code,
                    "results": results,
                },
                indent=2,
                sort_keys=True,
            )
            + "\n",
            encoding="utf-8",
        )
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
