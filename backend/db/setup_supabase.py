"""
Run this AFTER running schema.sql in Supabase SQL Editor.
Usage: python db/setup_supabase.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client
from data.seed_data import get_data

SUPABASE_URL = "https://pdrjjyznrjwjxgkkxdch.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkcmpqeXpucmp3anhna2t4ZGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTEzMTQsImV4cCI6MjA4NzgyNzMxNH0.bbYlRRAPVIloh7TWAGzebtbCjeoqlo-glTUqCbtENZI"

sb = create_client(SUPABASE_URL, SUPABASE_KEY)
data = get_data()

print("✓ Connected to Supabase!")
print(f"  Seeding: {len(data['suppliers'])} suppliers · {len(data['dependencies'])} deps · {len(data['alerts'])} alerts")
print()

def batch_insert(table_name, rows, batch_size=50):
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        sb.table(table_name).upsert(batch).execute()
    print(f"  ✓ {len(rows)} rows → {table_name}")

# Suppliers
batch_insert("suppliers", [{
    "id": s["id"], "name": s["name"], "tier": s["tier"],
    "country_code": s["country_code"], "country_name": s["country_name"],
    "industry": s["industry"], "component": s["component"],
    "lat": s["lat"], "lng": s["lng"],
    "geographic_risk": s["geographic_risk"], "financial_risk": s["financial_risk"],
    "annual_revenue_m": s["annual_revenue_m"], "employees": s["employees"],
    "years_operating": s["years_operating"], "certifications": s["certifications"],
    "on_time_delivery_pct": s["on_time_delivery_pct"], "is_active": s["is_active"],
} for s in data["suppliers"]])

# Dependencies
batch_insert("dependencies", [{
    "id": d["id"], "from_supplier_id": d["from_supplier_id"],
    "to_supplier_id": d["to_supplier_id"], "component": d["component"],
    "volume_percent": d["volume_percent"], "criticality": d["criticality"],
} for d in data["dependencies"]])

# Alerts
batch_insert("disruption_alerts", [{
    "id": a["id"], "supplier_id": a["supplier_id"],
    "supplier_name": a["supplier_name"], "country_code": a["country_code"],
    "alert_type": a["alert_type"], "probability": a["probability"],
    "severity": a["severity"], "expected_days": a["expected_days"],
    "affected_component": a["affected_component"],
    "impact_description": a["impact_description"],
} for a in data["alerts"]])

# Country risk
batch_insert("country_risk", [{
    "country_code": cr["country_code"], "country_name": cr["country_name"],
    "political_risk": cr["political_risk"], "weather_risk": cr["weather_risk"],
    "economic_risk": cr["economic_risk"],
    "trade_restriction_risk": cr["trade_restriction_risk"],
    "port_congestion_risk": cr["port_congestion_risk"],
} for cr in data["country_risk"]])

print("\n🎉 Supabase fully seeded!")
