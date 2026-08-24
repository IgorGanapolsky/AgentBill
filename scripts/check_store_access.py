#!/usr/bin/env python3
"""Fail-fast store API credential and permission checks.

This script verifies that configured credentials can access:
- Google Play Developer API for the Android package

It is intentionally read-only/safe:
- Android: creates a temporary edit and immediately deletes it

Exit codes:
    0 - All requested checks passed
    1 - Check failed (permission/config/API error)
    2 - Invalid invocation or missing required configuration
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
from typing import Any, Dict, List, Optional, Tuple

ANDROID_PACKAGE_DEFAULT = "com.iganapolsky.agentbill"


def _resolve_google_play_key() -> str:
    value = (os.environ.get("GOOGLE_PLAY_JSON_KEY") or "").strip()
    if value:
        return value
    value = (os.environ.get("GOOGLE_PLAY_JSON_KEY_PATH") or "").strip()
    if value:
        return value
    fallback = os.path.join(tempfile.gettempdir(), "play-service-account.json")
    if os.path.isfile(fallback):
        return fallback
    return ""


def _read_service_account_email(key_value: str) -> Optional[str]:
    try:
        if os.path.isfile(key_value):
            with open(key_value, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = json.loads(key_value)
        email = data.get("client_email")
        return str(email) if email else None
    except Exception:
        return None


def check_android_access(package_name: str) -> Tuple[bool, str]:
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError:
        return (
            False,
            "Missing dependencies. Install: pip install google-api-python-client google-auth",
        )

    key_value = _resolve_google_play_key()
    if not key_value:
        return (
            False,
            "Missing Google Play key. Set GOOGLE_PLAY_JSON_KEY or GOOGLE_PLAY_JSON_KEY_PATH.",
        )

    scopes = ["https://www.googleapis.com/auth/androidpublisher"]
    service_account_email = _read_service_account_email(key_value)

    try:
        if os.path.isfile(key_value):
            credentials = service_account.Credentials.from_service_account_file(
                key_value,
                scopes=scopes,
            )
        else:
            credentials = service_account.Credentials.from_service_account_info(
                json.loads(key_value),
                scopes=scopes,
            )

        service = build("androidpublisher", "v3", credentials=credentials)
        edits = service.edits()
        edit = edits.insert(body={}, packageName=package_name).execute()
        edit_id = edit["id"]
        edits.delete(packageName=package_name, editId=edit_id).execute()

        return (
            True,
            f"Google Play API access OK for package '{package_name}'"
            + (f" via '{service_account_email}'" if service_account_email else ""),
        )
    except Exception as exc:
        details = f"Google Play API access failed: {exc}"
        if "403" in str(exc) and service_account_email:
            details += (
                f"\n  Service account: {service_account_email}\n"
                "  Fix: Grant this account access in Play Console > Users and permissions,"
                " and confirm API access is linked for this app."
            )
        return (False, details)


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Verify store API access and permissions.")
    parser.add_argument(
        "--platform",
        choices=["android"],
        default="android",
        help="Which store(s) to verify.",
    )
    parser.add_argument(
        "--android-package",
        default=ANDROID_PACKAGE_DEFAULT,
        help=f"Android package name (default: {ANDROID_PACKAGE_DEFAULT})",
    )
    return parser.parse_args()


def _print_results(results: List[Dict[str, str]]) -> bool:
    print()
    print("══ Store API Access Check ═══════════════════════════")
    all_passed = True
    for item in results:
        icon = "✅" if item["passed"] == "true" else "❌"
        if item["passed"] != "true":
            all_passed = False
        print(f"{item['platform']:<8} {icon} {item['summary']}")
    print("══════════════════════════════════════════════════════")
    print(f"Result: {'ALL PASSED' if all_passed else 'FAILED'}")
    print()
    return all_passed


def main() -> int:
    args = _parse_args()
    results: List[Dict[str, str]] = []

    ok, summary = check_android_access(args.android_package)
    results.append(
        {
            "platform": "Android",
            "passed": "true" if ok else "false",
            "summary": summary,
        }
    )

    all_passed = _print_results(results)
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
