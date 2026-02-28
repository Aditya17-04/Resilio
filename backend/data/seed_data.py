import random
import json
import os

random.seed(42)

COUNTRIES = [
    {"code": "CN", "name": "China", "lat": 35.86, "lng": 104.19},
    {"code": "TW", "name": "Taiwan", "lat": 23.69, "lng": 120.96},
    {"code": "US", "name": "USA", "lat": 37.09, "lng": -95.71},
    {"code": "IN", "name": "India", "lat": 20.59, "lng": 78.96},
    {"code": "DE", "name": "Germany", "lat": 51.16, "lng": 10.45},
    {"code": "JP", "name": "Japan", "lat": 36.20, "lng": 138.25},
    {"code": "VN", "name": "Vietnam", "lat": 14.05, "lng": 108.27},
    {"code": "KR", "name": "South Korea", "lat": 35.90, "lng": 127.76},
    {"code": "MX", "name": "Mexico", "lat": 23.63, "lng": -102.55},
    {"code": "BR", "name": "Brazil", "lat": -14.23, "lng": -51.92},
]

INDUSTRIES = ["Semiconductors", "Chemicals", "Batteries", "Raw Materials", "Logistics"]

COMPONENTS = {
    "Semiconductors": ["Logic Chips", "Memory Chips", "Power ICs", "RF Chips"],
    "Chemicals": ["Rare Earth Oxides", "Photoresists", "Specialty Gases", "Polymer Compounds"],
    "Batteries": ["Lithium Cells", "Cathode Materials", "Electrolytes", "Battery Management ICs"],
    "Raw Materials": ["Silicon Wafers", "Copper Foil", "Aluminum Ingots", "Rare Earth Minerals"],
    "Logistics": ["Sea Freight", "Air Freight", "Rail Logistics", "Port Handling"],
}

COUNTRY_BASE_RISK = {
    "CN": 62, "TW": 70, "US": 20, "IN": 45, "DE": 18,
    "JP": 28, "VN": 42, "KR": 35, "MX": 55, "BR": 50,
}

SUPPLIER_ADJECTIVES = [
    "Global", "Pacific", "Advanced", "Premier", "Dynamic", "Apex", "Nova",
    "Quantum", "Nexus", "Titan", "Atlas", "Stellar", "Meridian", "Vanguard",
    "Precision", "Synergy", "Fusion", "Core", "Prime", "Alpha",
]

SUPPLIER_NOUNS = [
    "Materials", "Systems", "Solutions", "Technologies", "Industries",
    "Manufacturing", "Components", "Resources", "Works", "Dynamics",
    "Holdings", "Ventures", "Fabrication", "Precision", "Supply",
]

def generate_supplier_name(used_names):
    while True:
        name = f"{random.choice(SUPPLIER_ADJECTIVES)} {random.choice(SUPPLIER_NOUNS)}"
        if name not in used_names:
            used_names.add(name)
            return name

def generate_suppliers():
    suppliers = []
    used_names = set()
    sid = 1

    # Tier 3 - 40 suppliers (raw/deep)
    for _ in range(40):
        country = random.choice(COUNTRIES)
        industry = random.choice(["Raw Materials", "Chemicals"])
        geo_risk = COUNTRY_BASE_RISK[country["code"]] + random.randint(-10, 10)
        fin_risk = random.randint(20, 85)
        lat_jitter = country["lat"] + random.uniform(-3, 3)
        lng_jitter = country["lng"] + random.uniform(-3, 3)
        suppliers.append({
            "id": sid, "name": generate_supplier_name(used_names),
            "tier": 3, "country_code": country["code"], "country_name": country["name"],
            "industry": industry,
            "component": random.choice(COMPONENTS[industry]),
            "lat": round(lat_jitter, 4), "lng": round(lng_jitter, 4),
            "geographic_risk": min(100, max(5, geo_risk)),
            "financial_risk": fin_risk,
            "annual_revenue_m": random.randint(50, 500),
            "employees": random.randint(500, 10000),
            "years_operating": random.randint(3, 40),
            "certifications": random.randint(1, 5),
            "on_time_delivery_pct": round(random.uniform(72, 99), 1),
            "is_active": True,
        })
        sid += 1

    # Tier 2 - 50 suppliers (mid-level)
    for _ in range(50):
        country = random.choice(COUNTRIES)
        industry = random.choice(INDUSTRIES)
        geo_risk = COUNTRY_BASE_RISK[country["code"]] + random.randint(-8, 8)
        fin_risk = random.randint(15, 75)
        lat_jitter = country["lat"] + random.uniform(-3, 3)
        lng_jitter = country["lng"] + random.uniform(-3, 3)
        suppliers.append({
            "id": sid, "name": generate_supplier_name(used_names),
            "tier": 2, "country_code": country["code"], "country_name": country["name"],
            "industry": industry,
            "component": random.choice(COMPONENTS[industry]),
            "lat": round(lat_jitter, 4), "lng": round(lng_jitter, 4),
            "geographic_risk": min(100, max(5, geo_risk)),
            "financial_risk": fin_risk,
            "annual_revenue_m": random.randint(200, 5000),
            "employees": random.randint(1000, 50000),
            "years_operating": random.randint(5, 60),
            "certifications": random.randint(2, 8),
            "on_time_delivery_pct": round(random.uniform(78, 99), 1),
            "is_active": True,
        })
        sid += 1

    # Tier 1 - 35 suppliers (direct)
    for _ in range(35):
        country = random.choice(COUNTRIES[:5])  # prefer stable countries for Tier 1
        industry = random.choice(INDUSTRIES)
        geo_risk = COUNTRY_BASE_RISK[country["code"]] + random.randint(-5, 5)
        fin_risk = random.randint(10, 55)
        lat_jitter = country["lat"] + random.uniform(-2, 2)
        lng_jitter = country["lng"] + random.uniform(-2, 2)
        suppliers.append({
            "id": sid, "name": generate_supplier_name(used_names),
            "tier": 1, "country_code": country["code"], "country_name": country["name"],
            "industry": industry,
            "component": random.choice(COMPONENTS[industry]),
            "lat": round(lat_jitter, 4), "lng": round(lng_jitter, 4),
            "geographic_risk": min(100, max(5, geo_risk)),
            "financial_risk": fin_risk,
            "annual_revenue_m": random.randint(1000, 50000),
            "employees": random.randint(5000, 200000),
            "years_operating": random.randint(10, 80),
            "certifications": random.randint(3, 10),
            "on_time_delivery_pct": round(random.uniform(85, 99), 1),
            "is_active": True,
        })
        sid += 1

    return suppliers

def generate_dependencies(suppliers):
    deps = []
    tier1 = [s for s in suppliers if s["tier"] == 1]
    tier2 = [s for s in suppliers if s["tier"] == 2]
    tier3 = [s for s in suppliers if s["tier"] == 3]

    dep_id = 1
    seen_pairs = set()

    def add_dep(from_id, to_id, from_comp):
        nonlocal dep_id
        pair = (from_id, to_id)
        if pair in seen_pairs:
            return
        seen_pairs.add(pair)
        deps.append({
            "id": dep_id,
            "from_supplier_id": from_id,
            "to_supplier_id": to_id,
            "component": from_comp,
            "volume_percent": random.randint(15, 95),
            "criticality": random.choice(["high", "high", "medium", "medium", "low"]),
        })
        dep_id += 1

    # Guaranteed: round-robin Tier2 → Tier1
    # Each Tier-1 gets exactly 3–5 Tier-2 suppliers
    t2_cycle = tier2[:]
    random.shuffle(t2_cycle)
    t2_idx = 0
    for t1 in tier1:
        n = random.randint(3, 5)
        for _ in range(n):
            t2 = t2_cycle[t2_idx % len(t2_cycle)]
            add_dep(t2["id"], t1["id"], t2["component"])
            t2_idx += 1

    # Extra random Tier2 → Tier1 connections (cross-industry)
    for _ in range(80):
        t2 = random.choice(tier2)
        t1 = random.choice(tier1)
        add_dep(t2["id"], t1["id"], t2["component"])

    # Guaranteed: round-robin Tier3 → Tier2
    # Each Tier-2 gets 2–4 Tier-3 suppliers
    t3_cycle = tier3[:]
    random.shuffle(t3_cycle)
    t3_idx = 0
    for t2 in tier2:
        n = random.randint(2, 4)
        for _ in range(n):
            t3 = t3_cycle[t3_idx % len(t3_cycle)]
            add_dep(t3["id"], t2["id"], t3["component"])
            t3_idx += 1

    # Extra random Tier3 → Tier2 connections
    for _ in range(60):
        t3 = random.choice(tier3)
        t2 = random.choice(tier2)
        add_dep(t3["id"], t2["id"], t3["component"])

    return deps


def generate_country_risk():
    risk_data = []
    for c in COUNTRIES:
        risk_data.append({
            "country_code": c["code"],
            "country_name": c["name"],
            "political_risk": COUNTRY_BASE_RISK[c["code"]] + random.randint(-5, 5),
            "weather_risk": random.randint(20, 75),
            "economic_risk": random.randint(15, 70),
            "trade_restriction_risk": random.randint(10, 80),
            "port_congestion_risk": random.randint(10, 65),
        })
    return risk_data

def generate_alerts(suppliers):
    alerts = []
    high_risk = [s for s in suppliers if s["geographic_risk"] + s["financial_risk"] > 110]
    alert_types = ["Weather Event", "Political Instability", "Supplier Bankruptcy Risk",
                   "Port Congestion", "Trade Restriction", "Natural Disaster"]
    severities = ["critical", "high", "medium"]
    aid = 1
    for s in random.sample(high_risk, min(20, len(high_risk))):
        alert_type = random.choice(alert_types)
        prob = min(95, s["geographic_risk"] // 2 + s["financial_risk"] // 3 + random.randint(10, 25))
        alerts.append({
            "id": aid,
            "supplier_id": s["id"],
            "supplier_name": s["name"],
            "country_code": s["country_code"],
            "alert_type": alert_type,
            "probability": prob,
            "severity": severities[0] if prob > 70 else severities[1] if prob > 45 else severities[2],
            "expected_days": random.randint(7, 28),
            "affected_component": s["component"],
            "impact_description": f"{alert_type} in {s['country_name']} threatening {s['component']} supply",
            "triggering_factors": random.sample(
                ["weather_risk", "political_risk", "financial_risk", "news_sentiment", "port_congestion"],
                random.randint(2, 4)
            ),
        })
        aid += 1
    return alerts

def get_all_data():
    """Return all synthetic data as in-memory dict (no DB required)."""
    suppliers = generate_suppliers()
    dependencies = generate_dependencies(suppliers)
    country_risk = generate_country_risk()
    alerts = generate_alerts(suppliers)
    return {
        "suppliers": suppliers,
        "dependencies": dependencies,
        "country_risk": country_risk,
        "alerts": alerts,
    }

# Singleton cache
_data_cache = None

def get_data():
    global _data_cache
    if _data_cache is None:
        _data_cache = get_all_data()
    return _data_cache
