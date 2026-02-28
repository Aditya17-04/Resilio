from fastapi import APIRouter, Depends
from typing import Optional
from db.org_dep import get_org
from data.company_data import get_company_data

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])

@router.get("")
def list_suppliers(
    tier: Optional[int] = None,
    country: Optional[str] = None,
    industry: Optional[str] = None,
    limit: int = 200,
    org: str = Depends(get_org),
):
    data = get_company_data(org)
    suppliers = data["suppliers"]
    if tier:
        suppliers = [s for s in suppliers if s["tier"] == tier]
    if country:
        suppliers = [s for s in suppliers if s["country_code"].upper() == country.upper()]
    if industry:
        suppliers = [s for s in suppliers if s["industry"].lower() == industry.lower()]
    return suppliers[:limit]

@router.get("/{supplier_id}")
def get_supplier(supplier_id: int, org: str = Depends(get_org)):
    data = get_company_data(org)
    for s in data["suppliers"]:
        if s["id"] == supplier_id:
            return s
    return {"error": "Supplier not found"}
