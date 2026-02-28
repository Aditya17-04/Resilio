from fastapi import APIRouter, Depends
from db.org_dep import get_org
from data.company_data import get_company_data
from engines.risk_engine import get_overview, get_top_risky, get_country_exposure, get_industry_breakdown

router = APIRouter(prefix="/api/risk", tags=["risk"])

@router.get("/overview")
def risk_overview(org: str = Depends(get_org)):
    data = get_company_data(org)
    return get_overview(data["suppliers"], data["dependencies"])

@router.get("/top-risky")
def top_risky(limit: int = 10, org: str = Depends(get_org)):
    data = get_company_data(org)
    return get_top_risky(limit, data["suppliers"], data["dependencies"])

@router.get("/country-exposure")
def country_exposure(org: str = Depends(get_org)):
    data = get_company_data(org)
    return get_country_exposure(data["suppliers"], data["dependencies"])

@router.get("/industry-breakdown")
def industry_breakdown(org: str = Depends(get_org)):
    data = get_company_data(org)
    return get_industry_breakdown(data["suppliers"], data["dependencies"])
