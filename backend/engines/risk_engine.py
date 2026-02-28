from engines.graph_engine import get_centrality

def compute_risk_scores(suppliers, dependencies):
    dependencies = dependencies or []
    centrality = get_centrality(suppliers, dependencies)

    scored = []
    for s in suppliers:
        geo_risk = s["geographic_risk"]
        fin_risk = s["financial_risk"]
        weather_risk = min(100, geo_risk * 0.8 + 10)

        max_conc = 0
        for dep in dependencies:
            if dep["to_supplier_id"] == s["id"]:
                max_conc = max(max_conc, dep["volume_percent"])
        concentration_risk = min(100, max_conc)

        cent_score = centrality.get(s["id"], 0)
        centrality_risk = min(100, cent_score * 500)

        risk_score = (
            geo_risk * 0.25 + fin_risk * 0.20 +
            weather_risk * 0.20 + concentration_risk * 0.20 +
            centrality_risk * 0.15
        )
        risk_score = round(min(100, max(0, risk_score)), 1)
        risk_level = (
            "critical" if risk_score >= 75 else
            "high" if risk_score >= 55 else
            "medium" if risk_score >= 35 else "low"
        )
        scored.append({
            **s, "risk_score": risk_score, "risk_level": risk_level,
            "geo_risk": round(geo_risk, 1), "fin_risk": round(fin_risk, 1),
            "weather_risk": round(weather_risk, 1),
            "concentration_risk": round(concentration_risk, 1),
            "centrality_risk": round(centrality_risk, 1),
            "centrality_score": round(cent_score, 4),
        })
    return scored

def get_scored_suppliers(suppliers, dependencies):
    return compute_risk_scores(suppliers, dependencies)

def get_overview(suppliers=None, dependencies=None):
    if suppliers is None:
        from data.seed_data import get_data
        d = get_data(); suppliers, dependencies = d["suppliers"], d["dependencies"]
    scored = get_scored_suppliers(suppliers, dependencies)
    total = len(scored)
    critical = sum(1 for s in scored if s["risk_level"] == "critical")
    high     = sum(1 for s in scored if s["risk_level"] == "high")
    medium   = sum(1 for s in scored if s["risk_level"] == "medium")
    low      = sum(1 for s in scored if s["risk_level"] == "low")
    avg_risk = sum(s["risk_score"] for s in scored) / total
    resilience_score = round(100 - avg_risk, 1)
    country_counts = {}
    for s in scored:
        country_counts[s["country_code"]] = country_counts.get(s["country_code"], 0) + 1
    top = sorted(country_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    return {
        "total_suppliers": total, "critical_count": critical,
        "high_risk_count": high, "medium_risk_count": medium, "low_risk_count": low,
        "avg_risk_score": round(avg_risk, 1), "resilience_score": resilience_score,
        "top_country_exposure": [{"country": k, "count": v} for k, v in top],
    }

def get_top_risky(limit=10, suppliers=None, dependencies=None):
    if suppliers is None:
        from data.seed_data import get_data
        d = get_data(); suppliers, dependencies = d["suppliers"], d["dependencies"]
    scored = get_scored_suppliers(suppliers, dependencies)
    return sorted(scored, key=lambda x: x["risk_score"], reverse=True)[:limit]

def get_country_exposure(suppliers=None, dependencies=None):
    if suppliers is None:
        from data.seed_data import get_data
        d = get_data(); suppliers, dependencies = d["suppliers"], d["dependencies"]
    scored = get_scored_suppliers(suppliers, dependencies)
    country_data = {}
    for s in scored:
        cc, cn = s["country_code"], s["country_name"]
        if cc not in country_data:
            country_data[cc] = {"country_code": cc, "country_name": cn,
                                 "supplier_count": 0, "avg_risk": 0, "total_risk": 0, "critical_count": 0}
        country_data[cc]["supplier_count"] += 1
        country_data[cc]["total_risk"] += s["risk_score"]
        if s["risk_level"] == "critical":
            country_data[cc]["critical_count"] += 1
    result = []
    for d in country_data.values():
        d["avg_risk"] = round(d["total_risk"] / d["supplier_count"], 1)
        del d["total_risk"]
        result.append(d)
    return sorted(result, key=lambda x: x["avg_risk"], reverse=True)

def get_industry_breakdown(suppliers=None, dependencies=None):
    if suppliers is None:
        from data.seed_data import get_data
        d = get_data(); suppliers, dependencies = d["suppliers"], d["dependencies"]
    scored = get_scored_suppliers(suppliers, dependencies)
    industry_data = {}
    for s in scored:
        ind = s["industry"]
        if ind not in industry_data:
            industry_data[ind] = {"industry": ind, "count": 0, "avg_risk": 0, "total_risk": 0}
        industry_data[ind]["count"] += 1
        industry_data[ind]["total_risk"] += s["risk_score"]
    result = []
    for d in industry_data.values():
        d["avg_risk"] = round(d["total_risk"] / d["count"], 1)
        del d["total_risk"]
        result.append(d)
    return sorted(result, key=lambda x: x["avg_risk"], reverse=True)
