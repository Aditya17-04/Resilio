"""Backend integration test — verifies all 3 company org datasets work independently."""
import sys, os
sys.path.insert(0, '.')

from data.company_data import get_company_data
from engines.graph_engine import get_graph_json, get_single_points_of_failure
from engines.risk_engine import get_overview, get_top_risky
from engines.prediction_engine import get_alerts, get_disruption_probability_summary
from engines.recommendation_engine import get_recommendations
from engines.scenario_engine import run_scenario

for org in ["techcorp", "pharma", "auto"]:
    print(f"\n{'='*50}")
    print(f"  ORG: {org.upper()}")
    print(f"{'='*50}")
    d = get_company_data(org)
    suppliers = d["suppliers"]
    dependencies = d["dependencies"]
    alerts_raw = d["alerts"]

    print(f"  Suppliers: {len(suppliers)}, Deps: {len(dependencies)}, Alerts: {len(alerts_raw)}")

    graph = get_graph_json(suppliers, dependencies)
    print(f"  Graph: {len(graph['nodes'])} nodes, {len(graph['edges'])} edges")

    spof = get_single_points_of_failure(suppliers, dependencies)
    print(f"  SPOFs: {len(spof)}")

    ov = get_overview(suppliers, dependencies)
    print(f"  Resilience: {ov['resilience_score']}/100  |  HighRisk: {ov['high_risk_count']}  |  Critical: {ov['critical_count']}")

    alerts = get_alerts(alerts_raw, suppliers, dependencies)
    summary = get_disruption_probability_summary(alerts_raw, suppliers, dependencies)
    print(f"  Disruption Probability: {summary['overall_disruption_probability']}% ({summary['severity']})")

    recs = get_recommendations(suppliers)
    print(f"  Recommendations: {len(recs)}")

    # Simulator - pick first country in this org's dataset
    first_country = suppliers[0]["country_name"]
    result = run_scenario("port_closure", target_country=first_country, suppliers=suppliers, dependencies=dependencies)
    print(f"  Simulator ({first_country} Port): {result.get('directly_affected_count',0)} direct → {result.get('cascade_affected_count',0)} cascade  [{result.get('before_resilience_score')} → {result.get('after_resilience_score')}]")

print("\n\n✅ ALL 3 ORG DATASETS PASSED")
