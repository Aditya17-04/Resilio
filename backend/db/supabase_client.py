from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = "https://pdrjjyznrjwjxgkkxdch.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkcmpqeXpucmp3anhna2t4ZGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTEzMTQsImV4cCI6MjA4NzgyNzMxNH0.bbYlRRAPVIloh7TWAGzebtbCjeoqlo-glTUqCbtENZI"

_client: Client = None

def get_supabase() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", SUPABASE_URL)
        key = os.getenv("SUPABASE_ANON_KEY", SUPABASE_KEY)
        try:
            _client = create_client(url, key)
        except Exception as e:
            print(f"[Supabase] Connection failed: {e}")
    return _client
