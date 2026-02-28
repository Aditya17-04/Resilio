"""Shared FastAPI dependency: extracts org_id from X-Org-ID header."""
from fastapi import Header

def get_org(x_org_id: str = Header(default="techcorp")) -> str:
    """
    Reads X-Org-ID header sent by the frontend (set in api/index.js from JWT metadata).
    Falls back to 'techcorp' for unauthenticated calls (API docs testing).
    """
    valid_orgs = {"techcorp", "pharma", "auto"}
    org = x_org_id.lower() if x_org_id else "techcorp"
    return org if org in valid_orgs else "techcorp"
