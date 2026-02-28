from engines.risk_engine import get_scored_suppliers

def get_alerts(raw_alerts=None, suppliers=None, dependencies=None):
    if raw_alerts is None:
        from data.seed_data import get_data
        d = get_data()
        raw_alerts = d["alerts"]
        suppliers = d["suppliers"]
        dependencies = d["dependencies"]
    scored = get_scored_suppliers(suppliers, dependencies)
    score_map = {s["id"]: s["risk_score"] for s in scored}

    enriched = []
    for alert in raw_alerts:
        sid = alert["supplier_id"]
        risk_score = score_map.get(sid, 50)
        adjusted_prob = min(95, alert["probability"] + int(risk_score * 0.15))
        expected_date_days = alert["expected_days"]
        enriched.append({
            **alert,
            "probability": adjusted_prob,
            "risk_score": risk_score,
            "expected_days_out": expected_date_days,
            "timeline_label": (
                "This Week" if expected_date_days <= 7
                else "2 Weeks Out" if expected_date_days <= 14
                else "3 Weeks Out" if expected_date_days <= 21
                else "4 Weeks Out"
            ),
        })
    return sorted(enriched, key=lambda x: x["probability"], reverse=True)

def get_disruption_probability_summary(raw_alerts=None, suppliers=None, dependencies=None):
    alerts = get_alerts(raw_alerts, suppliers, dependencies)
    critical = [a for a in alerts if a["severity"] == "critical"]
    high = [a for a in alerts if a["severity"] == "high"]

    if critical:
        overall_prob = max(a["probability"] for a in critical)
        severity = "critical"
    elif high:
        overall_prob = max(a["probability"] for a in high)
        severity = "high"
    else:
        overall_prob = max((a["probability"] for a in alerts), default=15)
        severity = "medium"

    return {
        "overall_disruption_probability": overall_prob,
        "severity": severity,
        "critical_alerts": len(critical),
        "high_alerts": len(high),
        "total_alerts": len(alerts),
    }
