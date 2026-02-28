"""
Company-specific synthetic supply chain datasets for 3 demo organizations.
Each company has a unique risk profile, industry focus, and geographic exposure.
"""
import random

# ── TECHCORP SOLUTIONS (Semiconductors / Electronics) ─────────────────────────
# HIGH RISK: Heavy Taiwan + China exposure, semiconductor focus
TECHCORP = {
    "profile": {
        "org": "techcorp",
        "name": "TechCorp Solutions",
        "industry": "Semiconductors",
        "resilience_base": 52,
        "country_weights": {"TW": 30, "CN": 25, "KR": 20, "US": 15, "JP": 10},
    },
    "industries": ["Semiconductors", "Raw Materials"],
    "components": {
        "Semiconductors": ["Logic Chips (7nm)", "Memory Chips (LPDDR5)", "Power ICs", "RF Chips"],
        "Raw Materials": ["Silicon Wafers (300mm)", "Neon Gas (Ukraine)", "Palladium Targets", "Rare Earth Oxides"],
    },
    "country_risk_boost": {"TW": 75, "CN": 65, "KR": 35, "US": 18, "JP": 30},
    "count": {"tier1": 10, "tier2": 20, "tier3": 15},
}

# ── PHARMACO INDUSTRIES (Pharmaceuticals / Chemicals) ─────────────────────────
# MEDIUM RISK: India API concentration, Germany equipment, China excipients
PHARMA = {
    "profile": {
        "org": "pharma",
        "name": "PharmaCo Industries",
        "industry": "Chemicals",
        "resilience_base": 65,
        "country_weights": {"IN": 35, "DE": 25, "CN": 20, "US": 15, "CH": 5},
    },
    "industries": ["Chemicals", "Raw Materials"],
    "components": {
        "Chemicals": ["Active Pharma Ingredients", "Excipients", "Solvents", "Photoresists"],
        "Raw Materials": ["Rare Earth Oxides", "Polymer Compounds", "Specialty Gases", "Catalysts"],
    },
    "country_risk_boost": {"IN": 48, "DE": 18, "CN": 62, "US": 20, "CH": 12},
    "count": {"tier1": 8, "tier2": 18, "tier3": 14},
}

# ── AUTOMOTIVE GLOBAL (Automotive / Battery) ──────────────────────────────────
# MEDIUM-LOW RISK: Diversified Japan/Germany/Mexico sourcing
AUTO = {
    "profile": {
        "org": "auto",
        "name": "AutoMotive Global",
        "industry": "Batteries",
        "resilience_base": 71,
        "country_weights": {"JP": 30, "DE": 30, "MX": 25, "KR": 10, "US": 5},
    },
    "industries": ["Batteries", "Logistics"],
    "components": {
        "Batteries": ["Lithium Cells (21700)", "Cathode Materials (NMC)", "Electrolytes", "Battery Management ICs"],
        "Logistics": ["Sea Freight (Pacific)", "Rail Logistics", "Port Handling", "Air Freight"],
    },
    "country_risk_boost": {"JP": 28, "DE": 20, "MX": 55, "KR": 32, "US": 18},
    "count": {"tier1": 12, "tier2": 18, "tier3": 12},
}

COUNTRY_INFO = {
    "CN": {"name": "China",       "lat": 35.86, "lng": 104.19},
    "TW": {"name": "Taiwan",      "lat": 23.69, "lng": 120.96},
    "US": {"name": "USA",         "lat": 37.09, "lng": -95.71},
    "IN": {"name": "India",       "lat": 20.59, "lng": 78.96},
    "DE": {"name": "Germany",     "lat": 51.16, "lng": 10.45},
    "JP": {"name": "Japan",       "lat": 36.20, "lng": 138.25},
    "VN": {"name": "Vietnam",     "lat": 14.05, "lng": 108.27},
    "KR": {"name": "South Korea", "lat": 35.90, "lng": 127.76},
    "MX": {"name": "Mexico",      "lat": 23.63, "lng": -102.55},
    "BR": {"name": "Brazil",      "lat": -14.23,"lng": -51.92},
    "CH": {"name": "Switzerland", "lat": 46.81, "lng": 8.23},
}

ADJECTIVES = ["Global","Pacific","Advanced","Premier","Apex","Nova","Quantum","Nexus",
               "Titan","Atlas","Stellar","Meridian","Vanguard","Precision","Core","Prime",
               "Alpha","Sigma","Delta","Omega","Vector","Horizon","Zenith","Synergy"]
NOUNS      = ["Materials","Systems","Solutions","Technologies","Industries","Manufacturing",
               "Components","Resources","Works","Dynamics","Holdings","Fabrication","Supply",
               "Precision","Labs","Ventures","Group","Partners","International","Corp"]

def _pick_country(weights: dict, rng) -> str:
    codes = list(weights.keys())
    wts   = list(weights.values())
    return rng.choices(codes, weights=wts, k=1)[0]

def _name(used, rng):
    while True:
        n = f"{rng.choice(ADJECTIVES)} {rng.choice(NOUNS)}"
        if n not in used:
            used.add(n)
            return n

def _generate_for_company(cfg: dict, seed: int) -> dict:
    rng = random.Random(seed)
    used_names = set()
    suppliers = []
    cnt = cfg["count"]
    geo_boost = cfg["country_risk_boost"]
    sid = 1

    def mk_supplier(tier):
        nonlocal sid
        code = _pick_country(cfg["profile"]["country_weights"], rng)
        info = COUNTRY_INFO.get(code, COUNTRY_INFO["US"])
        industry = rng.choice(cfg["industries"])
        component = rng.choice(cfg["components"][industry])
        geo  = min(100, geo_boost.get(code, 50) + rng.randint(-8, 8))
        fin  = rng.randint(20, 80) if tier == 3 else rng.randint(15, 65) if tier == 2 else rng.randint(10, 50)
        s = {
            "id": sid, "name": _name(used_names, rng), "tier": tier,
            "country_code": code, "country_name": info["name"],
            "industry": industry, "component": component,
            "lat": round(info["lat"] + rng.uniform(-3,3), 4),
            "lng": round(info["lng"] + rng.uniform(-3,3), 4),
            "geographic_risk": geo, "financial_risk": fin,
            "annual_revenue_m": rng.randint(50,500) if tier==3 else rng.randint(200,5000) if tier==2 else rng.randint(1000,50000),
            "employees": rng.randint(500,8000) if tier==3 else rng.randint(1000,30000) if tier==2 else rng.randint(5000,100000),
            "years_operating": rng.randint(3,30) if tier==3 else rng.randint(5,50) if tier==2 else rng.randint(10,70),
            "certifications": rng.randint(1,5) if tier==3 else rng.randint(2,7) if tier==2 else rng.randint(3,10),
            "on_time_delivery_pct": round(rng.uniform(70,98),1),
            "is_active": True,
        }
        sid += 1
        return s

    tier3 = [mk_supplier(3) for _ in range(cnt["tier3"])]
    tier2 = [mk_supplier(2) for _ in range(cnt["tier2"])]
    tier1 = [mk_supplier(1) for _ in range(cnt["tier1"])]
    suppliers = tier3 + tier2 + tier1

    # Dependencies
    deps, dep_id, seen = [], 1, set()
    def add_dep(f, t, comp):
        nonlocal dep_id
        if (f["id"],t["id"]) in seen: return
        seen.add((f["id"],t["id"]))
        deps.append({"id": dep_id, "from_supplier_id": f["id"], "to_supplier_id": t["id"],
                     "component": f["component"],
                     "volume_percent": rng.randint(15,95),
                     "criticality": rng.choice(["high","high","medium","medium","low"])})
        dep_id += 1

    t2c = tier2[:]
    rng.shuffle(t2c)
    for i, t1 in enumerate(tier1):
        for j in range(rng.randint(2,4)):
            add_dep(t2c[(i*4+j) % len(t2c)], t1, t2c[(i*4+j)%len(t2c)]["component"])
    for _ in range(30):
        add_dep(rng.choice(tier2), rng.choice(tier1), rng.choice(tier2)["component"])

    t3c = tier3[:]
    rng.shuffle(t3c)
    for i, t2 in enumerate(tier2):
        for j in range(rng.randint(2,3)):
            add_dep(t3c[(i*3+j) % len(t3c)], t2, t3c[(i*3+j)%len(t3c)]["component"])
    for _ in range(20):
        add_dep(rng.choice(tier3), rng.choice(tier2), rng.choice(tier3)["component"])

    # Alerts
    high_risk = [s for s in suppliers if s["geographic_risk"] + s["financial_risk"] > 100]
    alert_types = ["Weather Event","Political Instability","Supplier Bankruptcy Risk","Port Congestion","Trade Restriction"]
    severities = ["critical","high","medium"]
    alerts = []
    for aid, s in enumerate(rng.sample(high_risk, min(15, len(high_risk))), 1):
        prob = min(95, s["geographic_risk"]//2 + s["financial_risk"]//3 + rng.randint(10,25))
        alerts.append({
            "id": aid, "supplier_id": s["id"], "supplier_name": s["name"],
            "country_code": s["country_code"], "alert_type": rng.choice(alert_types),
            "probability": prob,
            "severity": "critical" if prob>70 else "high" if prob>45 else "medium",
            "expected_days": rng.randint(7,28),
            "affected_component": s["component"],
            "impact_description": f"Risk event in {s['country_name']} threatening {s['component']} supply",
            "triggering_factors": rng.sample(["weather_risk","political_risk","financial_risk","news_sentiment","port_congestion"], rng.randint(2,4)),
        })

    return {"suppliers": suppliers, "dependencies": deps, "alerts": alerts, "profile": cfg["profile"]}

# ── Singleton caches per org ───────────────────────────────────────────────────
_caches = {}

def get_company_data(org: str) -> dict:
    global _caches
    if org not in _caches:
        cfg_map = {"techcorp": (TECHCORP, 42), "pharma": (PHARMA, 99), "auto": (AUTO, 77)}
        cfg, seed = cfg_map.get(org, cfg_map["techcorp"])
        _caches[org] = _generate_for_company(cfg, seed)
    return _caches[org]
