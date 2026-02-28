from engines.risk_engine import get_scored_suppliers
import random

_rng = random.Random(77)

def get_recommendations(suppliers=None, dependencies=None):
    if suppliers is None:
        from data.seed_data import get_data
        d = get_data(); suppliers, dependencies = d["suppliers"], d["dependencies"]
    scored = get_scored_suppliers(suppliers, dependencies)

    # Only recommend for high/critical risk suppliers
    high_risk = [s for s in scored if s["risk_score"] >= 55]

    recommendations = []
    for risky in high_risk:
        # Find alternative suppliers: same industry, same component or similar, different country, lower risk
        alternatives = [
            s for s in scored
            if s["id"] != risky["id"]
            and s["industry"] == risky["industry"]
            and s["country_code"] != risky["country_code"]
            and s["risk_score"] < risky["risk_score"] - 10
            and s["tier"] == risky["tier"]
        ]

        if not alternatives:
            alternatives = [
                s for s in scored
                if s["id"] != risky["id"]
                and s["country_code"] != risky["country_code"]
                and s["risk_score"] < risky["risk_score"] - 15
                and s["tier"] == risky["tier"]
            ]

        if alternatives:
            best_alt = min(alternatives, key=lambda x: x["risk_score"])
            risk_reduction = round(risky["risk_score"] - best_alt["risk_score"], 1)
            cost_change = round(_rng.uniform(-5, 18), 1)
            lead_time_change = _rng.randint(-5, 15)

            recommendations.append({
                "risky_supplier_id": risky["id"],
                "risky_supplier_name": risky["name"],
                "risky_country": risky["country_name"],
                "risky_risk_score": risky["risk_score"],
                "risky_risk_level": risky["risk_level"],
                "industry": risky["industry"],
                "component": risky["component"],
                "alt_supplier_id": best_alt["id"],
                "alt_supplier_name": best_alt["name"],
                "alt_country": best_alt["country_name"],
                "alt_risk_score": best_alt["risk_score"],
                "risk_reduction_pct": risk_reduction,
                "cost_change_pct": cost_change,
                "lead_time_change_days": lead_time_change,
                "recommendation_strength": (
                    "Strong" if risk_reduction > 30 and cost_change < 10
                    else "Moderate" if risk_reduction > 15
                    else "Weak"
                ),
            })

    return sorted(recommendations, key=lambda x: x["risky_risk_score"], reverse=True)[:25]
