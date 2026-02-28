from fastapi import APIRouter, Depends
from db.org_dep import get_org
from data.company_data import get_company_data
from engines.recommendation_engine import get_recommendations

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.get("")
def list_recommendations(org: str = Depends(get_org)):
    data = get_company_data(org)
    return get_recommendations(data["suppliers"], data["dependencies"])
