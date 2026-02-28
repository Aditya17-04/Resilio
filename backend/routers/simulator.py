from fastapi import APIRouter, Depends
from pydantic import BaseModel
from db.org_dep import get_org
from data.company_data import get_company_data
from engines.scenario_engine import run_scenario

router = APIRouter(prefix="/api/simulator", tags=["simulator"])

class ScenarioRequest(BaseModel):
    scenario_type: str   # port_closure | supplier_bankruptcy | country_sanctions | weather_event | pandemic
    target_country: str = "China"
    target_supplier_id: int = None
    severity: float = 1.0

@router.get("/scenarios")
def get_scenarios():
    """Return available scenario types"""
    return [
        {
            "type": "port_closure",
            "label": "Port Closure",
            "icon": "🚢",
            "description": "Simulate major port shutdown affecting logistics"
        },
        {
            "type": "supplier_bankruptcy",
            "label": "Supplier Bankruptcy",
            "icon": "💼",
            "description": "Model sudden supplier failure and supply disruption"
        },
        {
            "type": "country_sanctions",
            "label": "Trade Sanctions",
            "icon": "🚫",
            "description": "Simulate trade restrictions on a specific country"
        },
        {
            "type": "weather_event",
            "label": "Weather Disaster",
            "icon": "🌪️",
            "description": "Model impact of natural disasters on supply chain"
        },
        {
            "type": "pandemic",
            "label": "Pandemic Outbreak",
            "icon": "🦠",
            "description": "Simulate widespread health crisis affecting production"
        }
    ]

@router.post("/run")
def run_simulation(req: ScenarioRequest, org: str = Depends(get_org)):
    data = get_company_data(org)
    return run_scenario(
        req.scenario_type,
        target_country=req.target_country,
        target_supplier_id=req.target_supplier_id,
        severity=req.severity,
        suppliers=data["suppliers"],
        dependencies=data["dependencies"],
    )
