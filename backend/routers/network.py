from fastapi import APIRouter, Depends
from db.org_dep import get_org
from data.company_data import get_company_data
from engines.graph_engine import get_graph_json, get_single_points_of_failure

router = APIRouter(prefix="/api/network", tags=["network"])

@router.get("/graph")
def network_graph(org: str = Depends(get_org)):
    data = get_company_data(org)
    return get_graph_json(data["suppliers"], data["dependencies"])

@router.get("/spof")
def single_points_of_failure(org: str = Depends(get_org)):
    data = get_company_data(org)
    return get_single_points_of_failure(data["suppliers"], data["dependencies"])
