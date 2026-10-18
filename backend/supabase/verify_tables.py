"""
Verification script for Supabase tables.
Run: python backend/supabase/verify_tables.py
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import settings
from app.services.store import _supabase_client

TABLES = [
    "user_profiles",
    "linkedin_results",
    "github_results",
    "roadmap_results",
    "chat_messages",
    "quiz_evaluations",
    "quiz_sessions",
    "app_data",
]


def test_supabase_tables():
    print(f"Supabase URL: {settings.supabase_url}")
    print(f"Supabase Enabled: {settings.supabase_enabled}")

    client = _supabase_client()
    if client is None:
        print("[ERROR] Could not initialize Supabase client. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
        return False

    print("\nChecking all respected tables in Supabase:")
    results = {}
    missing_tables = []

    for tbl in TABLES:
        try:
            res = client.table(tbl).select("*").limit(1).execute()
            count = len(res.data) if hasattr(res, "data") and res.data is not None else 0
            print(f"  [OK] Table '{tbl}' exists and is accessible (sample count: {count}).")
            results[tbl] = True
        except Exception as exc:
            err_msg = str(exc)
            if "PGRST205" in err_msg or "Could not find the table" in err_msg:
                print(f"  [MISSING] Table '{tbl}' not found in Supabase schema cache.")
                missing_tables.append(tbl)
            else:
                print(f"  [ERROR] Table '{tbl}': {err_msg}")
            results[tbl] = False

    print("\nSummary:")
    if missing_tables:
        print(f"  Missing tables ({len(missing_tables)}): {', '.join(missing_tables)}")
        print("\n  >> TO CREATE TABLES IN SUPABASE:")
        print("  1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/auxziecrhgzjspadbqaj")
        print("  2. Navigate to SQL Editor (left sidebar).")
        print("  3. Open 'backend/supabase/schema.sql', paste all contents into the SQL Editor, and click 'Run'.")
        print("  4. Re-run this verification script: python backend/supabase/verify_tables.py\n")
        return False
    else:
        print("  All tables exist and are properly configured!\n")
        return True


if __name__ == "__main__":
    test_supabase_tables()
