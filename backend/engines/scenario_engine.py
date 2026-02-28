from engines.risk_engine import get_scored_suppliers, get_overview
from engines.graph_engine import simulate_disruption
import random

_rng = random.Random(55)

SCENARIO_DEFINITIONS = {
    "port_closure":        {"label":"Port Closure","description":"Major port is closed due to strike, accident, or blockade.","icon":"🚢","recovery_days_range":(7,35),"impact_multiplier":0.85},
    "supplier_bankruptcy": {"label":"Supplier Bankruptcy","description":"Target supplier declares bankruptcy and halts all shipments.","icon":"📉","recovery_days_range":(60,180),"impact_multiplier":1.0},
    "country_sanctions":   {"label":"Country Sanctions / Trade War","description":"Trade sanctions imposed on goods from the target country.","icon":"🚫","recovery_days_range":(90,365),"impact_multiplier":0.95},
    "weather_event":       {"label":"Extreme Weather Event","description":"Typhoon, flood, or earthquake disrupts manufacturing.","icon":"🌪️","recovery_days_range":(14,60),"impact_multiplier":0.75},
    "pandemic":            {"label":"Pandemic / Workforce Shutdown","description":"Epidemic forces factory shutdowns across the target country.","icon":"🦠","recovery_days_range":(30,90),"impact_multiplier":0.9},
}

def run_scenario(scenario_type: str, target_country: str = None, target_supplier_id: int = None,
                 severity: float = 1.0, suppliers=None, dependencies=None):
    if scenario_type not in SCENARIO_DEFINITIONS:
        return {"error": f"Unknown scenario: {scenario_type}"}

    if suppliers is None:
        from data.seed_data import get_data
        d = get_data(); suppliers, dependencies = d["suppliers"], d["dependencies"]

    scenario_def = SCENARIO_DEFINITIONS[scenario_type]
    scored = get_scored_suppliers(suppliers, dependencies)

    # Determine affected initial nodes
    if target_supplier_id:
        initial_affected = [target_supplier_id]
        target_label = next((s["name"] for s in suppliers if s["id"] == target_supplier_id), f"Supplier {target_supplier_id}")
    elif target_country:
        initial_affected = [s["id"] for s in suppliers if s["country_code"] == target_country or s["country_name"].lower() == target_country.lower()]
        target_label = target_country
    else:
        return {"error": "Must provide target_country or target_supplier_id"}

    if not initial_affected:
        return {"error": f"No suppliers found for: {target_country or target_supplier_id}"}

    cascade = simulate_disruption(initial_affected, suppliers, dependencies)

    score_map = {s["id"]: s for s in scored}
    enriched_cascade = []
    for c in cascade:
        sid = c["supplier_id"]
        scored_data = score_map.get(sid, {})
        enriched_cascade.append({**c, "risk_score": scored_data.get("risk_score", 50), "risk_level": scored_data.get("risk_level", "medium")})

    total_suppliers = len(suppliers)
    directly_affected = len(initial_affected)
    cascaded_affected = len(cascade)
    total_affected_pct = round((directly_affected + cascaded_affected) / total_suppliers * 100, 1)
    recovery_days = _rng.randint(*scenario_def["recovery_days_range"])
    impact_pct = round(min(95, total_affected_pct * scenario_def["impact_multiplier"] * severity), 1)

    before = get_overview(suppliers, dependencies)
    after_resilience = max(0, before["resilience_score"] - (impact_pct * 0.6))

    return {
        "scenario_type": scenario_type,
        "scenario_label": scenario_def["label"],
        "scenario_icon": scenario_def["icon"],
        "scenario_description": scenario_def["description"],
        "target": target_label,
        "directly_affected_count": directly_affected,
        "cascade_affected_count": cascaded_affected,
        "total_affected_pct": total_affected_pct,
        "estimated_production_impact_pct": impact_pct,
        "estimated_recovery_days": recovery_days,
        "before_resilience_score": before["resilience_score"],
        "after_resilience_score": round(after_resilience, 1),
        "cascade_details": sorted(enriched_cascade, key=lambda x: x.get("risk_score", 0), reverse=True)[:30],
        "initial_affected_suppliers": [{"id": sid, "name": next((s["name"] for s in suppliers if s["id"] == sid), f"S{sid}"), "country": next((s["country_name"] for s in suppliers if s["id"] == sid), "")} for sid in initial_affected[:10]],
    }
