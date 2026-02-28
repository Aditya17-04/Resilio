"""
Creates 3 demo company accounts in Supabase Auth.
Run once: python db/create_demo_users.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client

SUPABASE_URL = "https://pdrjjyznrjwjxgkkxdch.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkcmpqeXpucmp3anhna2t4ZGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTEzMTQsImV4cCI6MjA4NzgyNzMxNH0.bbYlRRAPVIloh7TWAGzebtbCjeoqlo-glTUqCbtENZI"

DEMO_ACCOUNTS = [
    {
        "email": "techcorp.rebel@gmail.com",
        "password": "Demo1234!",
        "options": {"data": {"org": "techcorp", "company": "TechCorp Solutions", "industry": "Semiconductors"}}
    },
    {
        "email": "pharma.rebel@gmail.com",
        "password": "Demo1234!",
        "options": {"data": {"org": "pharma", "company": "PharmaCo Industries", "industry": "Chemicals"}}
    },
    {
        "email": "auto.rebel@gmail.com",
        "password": "Demo1234!",
        "options": {"data": {"org": "auto", "company": "AutoMotive Global", "industry": "Batteries"}}
    },
]

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Creating demo accounts in Supabase Auth...\n")
for account in DEMO_ACCOUNTS:
    try:
        result = sb.auth.sign_up({
            "email": account["email"],
            "password": account["password"],
            "options": account["options"],
        })
        if result.user:
            org = account["options"]["data"]["org"]
            company = account["options"]["data"]["company"]
            print(f"  ✓ Created: {account['email']} ({company}) | org={org}")
        else:
            print(f"  ⚠ No user returned for {account['email']} (may already exist)")
    except Exception as e:
        if "already registered" in str(e).lower() or "already been registered" in str(e).lower():
            print(f"  ℹ Already exists: {account['email']}")
        else:
            print(f"  ✗ Failed: {account['email']} — {e}")

print("\n✅ Done! You can now log in with:")
for a in DEMO_ACCOUNTS:
    print(f"   {a['email']} / {a['password']}")
