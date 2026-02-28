from fastapi import APIRouter
from db.supabase_client import get_supabase
from data.seed_data import get_data

router = APIRouter(prefix="/api/seed", tags=["seed"])

@router.post("")
def seed_database():
    """Push all synthetic data into Supabase tables."""
    sb = get_supabase()
    if not sb:
        return {"error": "Supabase not connected. Check credentials in .env"}

    data = get_data()
    results = {}

    # Clear existing data
    try:
        sb.table("disruption_alerts").delete().neq("id", 0).execute()
        sb.table("dependencies").delete().neq("id", 0).execute()
        sb.table("suppliers").delete().neq("id", 0).execute()
        sb.table("country_risk").delete().neq("country_code", "").execute()
    except Exception as e:
        return {"error": f"Failed to clear tables: {e}. Did you run schema.sql in Supabase?"}

    # Insert suppliers
    try:
        suppliers_to_insert = []
        for s in data["suppliers"]:
            suppliers_to_insert.append({
                "id": s["id"],
                "name": s["name"],
                "tier": s["tier"],
                "country_code": s["country_code"],
                "country_name": s["country_name"],
                "industry": s["industry"],
                "component": s["component"],
                "lat": s["lat"],
                "lng": s["lng"],
                "geographic_risk": s["geographic_risk"],
                "financial_risk": s["financial_risk"],
                "annual_revenue_m": s["annual_revenue_m"],
                "employees": s["employees"],
                "years_operating": s["years_operating"],
                "certifications": s["certifications"],
                "on_time_delivery_pct": s["on_time_delivery_pct"],
                "is_active": s["is_active"],
            })
        # Insert in batches of 50
        for i in range(0, len(suppliers_to_insert), 50):
            batch = suppliers_to_insert[i:i+50]
            sb.table("suppliers").insert(batch).execute()
        results["suppliers"] = f"{len(suppliers_to_insert)} inserted"
    except Exception as e:
        results["suppliers_error"] = str(e)

    # Insert dependencies
    try:
        deps_to_insert = []
        for d in data["dependencies"]:
            deps_to_insert.append({
                "id": d["id"],
                "from_supplier_id": d["from_supplier_id"],
                "to_supplier_id": d["to_supplier_id"],
                "component": d["component"],
                "volume_percent": d["volume_percent"],
                "criticality": d["criticality"],
            })
        for i in range(0, len(deps_to_insert), 50):
            batch = deps_to_insert[i:i+50]
            sb.table("dependencies").insert(batch).execute()
        results["dependencies"] = f"{len(deps_to_insert)} inserted"
    except Exception as e:
        results["dependencies_error"] = str(e)

    # Insert alerts
    try:
        alerts_to_insert = []
        for a in data["alerts"]:
            alerts_to_insert.append({
                "id": a["id"],
                "supplier_id": a["supplier_id"],
                "supplier_name": a["supplier_name"],
                "country_code": a["country_code"],
                "alert_type": a["alert_type"],
                "probability": a["probability"],
                "severity": a["severity"],
                "expected_days": a["expected_days"],
                "affected_component": a["affected_component"],
                "impact_description": a["impact_description"],
            })
        sb.table("disruption_alerts").insert(alerts_to_insert).execute()
        results["alerts"] = f"{len(alerts_to_insert)} inserted"
    except Exception as e:
        results["alerts_error"] = str(e)

    # Insert country risk
    try:
        country_risk_to_insert = []
        for cr in data["country_risk"]:
            country_risk_to_insert.append({
                "country_code": cr["country_code"],
                "country_name": cr["country_name"],
                "political_risk": cr["political_risk"],
                "weather_risk": cr["weather_risk"],
                "economic_risk": cr["economic_risk"],
                "trade_restriction_risk": cr["trade_restriction_risk"],
                "port_congestion_risk": cr["port_congestion_risk"],
            })
        sb.table("country_risk").insert(country_risk_to_insert).execute()
        results["country_risk"] = f"{len(country_risk_to_insert)} inserted"
    except Exception as e:
        results["country_risk_error"] = str(e)

    results["status"] = "Seed complete"
    return results

@router.get("/status")
def seed_status():
    """Check how many rows exist in Supabase."""
    sb = get_supabase()
    if not sb:
        return {"connected": False, "error": "Supabase not connected"}
    try:
        suppliers = sb.table("suppliers").select("id", count="exact").execute()
        deps = sb.table("dependencies").select("id", count="exact").execute()
        alerts = sb.table("disruption_alerts").select("id", count="exact").execute()
        return {
            "connected": True,
            "suppliers": suppliers.count,
            "dependencies": deps.count,
            "alerts": alerts.count,
        }
    except Exception as e:
        return {"connected": True, "error": str(e), "hint": "Run schema.sql in Supabase SQL Editor first"}
