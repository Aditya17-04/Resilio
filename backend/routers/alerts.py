from fastapi import APIRouter, Depends
from db.org_dep import get_org
from data.company_data import get_company_data
from engines.prediction_engine import get_alerts, get_disruption_probability_summary

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("")
def list_alerts(severity: str = None, limit: int = 50, org: str = Depends(get_org)):
    data = get_company_data(org)
    alerts = get_alerts(data["alerts"], data["suppliers"], data["dependencies"])
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    return alerts[:limit]

@router.get("/summary")
def alert_summary(org: str = Depends(get_org)):
    data = get_company_data(org)
    return get_disruption_probability_summary(data["alerts"], data["suppliers"], data["dependencies"])
