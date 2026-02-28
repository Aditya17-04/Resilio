import networkx as nx

def _build_graph(suppliers, dependencies):
    dependencies = dependencies or []
    G = nx.DiGraph()
    for s in suppliers:
        G.add_node(s["id"], **s)
    for dep in dependencies:
        G.add_edge(
            dep["from_supplier_id"], dep["to_supplier_id"],
            component=dep["component"],
            volume_percent=dep["volume_percent"],
            criticality=dep["criticality"],
        )
    return G

def _get_centrality(suppliers, dependencies):
    G = _build_graph(suppliers, dependencies)
    return G, nx.betweenness_centrality(G, normalized=True)

def get_centrality(suppliers=None, dependencies=None):
    """Legacy: called by risk_engine with no args uses global data."""
    if suppliers is None:
        from data.seed_data import get_data
        d = get_data()
        suppliers, dependencies = d["suppliers"], d["dependencies"]
    G, cent = _get_centrality(suppliers, dependencies)
    return cent

def get_graph_json(suppliers=None, dependencies=None):
    if suppliers is None:
        from data.seed_data import get_data
        d = get_data()
        suppliers, dependencies = d["suppliers"], d["dependencies"]
    G, centrality = _get_centrality(suppliers, dependencies)
    nodes, edges = [], []
    for node_id, data in G.nodes(data=True):
        nodes.append({
            "id": node_id, "name": data.get("name",""),
            "tier": data.get("tier",1), "country_code": data.get("country_code",""),
            "country_name": data.get("country_name",""), "industry": data.get("industry",""),
            "component": data.get("component",""), "lat": data.get("lat",0), "lng": data.get("lng",0),
            "geographic_risk": data.get("geographic_risk",0),
            "financial_risk": data.get("financial_risk",0),
            "centrality": round(centrality.get(node_id,0), 4),
        })
    for u, v, data in G.edges(data=True):
        edges.append({
            "source": u, "target": v, "component": data.get("component",""),
            "volume_percent": data.get("volume_percent",0),
            "criticality": data.get("criticality","medium"),
        })
    return {"nodes": nodes, "edges": edges}

def get_single_points_of_failure(suppliers=None, dependencies=None):
    if suppliers is None:
        from data.seed_data import get_data
        d = get_data()
        suppliers, dependencies = d["suppliers"], d["dependencies"]
    G, centrality = _get_centrality(suppliers, dependencies)
    spofs = []
    for node_id, cent in centrality.items():
        successors = list(G.successors(node_id))
        predecessors = list(G.predecessors(node_id))
        if cent > 0.04 and len(successors) > 0 and len(predecessors) <= 3:
            nd = G.nodes[node_id]
            spofs.append({
                "supplier_id": node_id, "supplier_name": nd.get("name"),
                "tier": nd.get("tier"), "country_code": nd.get("country_code"),
                "centrality_score": round(cent, 4),
                "dependents_count": len(successors), "suppliers_count": len(predecessors),
                "component": nd.get("component"),
            })
    return sorted(spofs, key=lambda x: x["centrality_score"], reverse=True)[:15]

def simulate_disruption(affected_node_ids: list, suppliers, dependencies):
    G = _build_graph(suppliers, dependencies)
    affected = set(affected_node_ids)
    queue = list(affected_node_ids)
    cascade = {}
    visited = set(affected_node_ids)
    while queue:
        current = queue.pop(0)
        for successor in G.successors(current):
            if successor not in visited:
                visited.add(successor)
                queue.append(successor)
                nd = G.nodes[successor]
                edge_data = G.get_edge_data(current, successor, {})
                cascade[successor] = {
                    "supplier_id": successor, "supplier_name": nd.get("name"),
                    "tier": nd.get("tier"), "country_code": nd.get("country_code"),
                    "component": nd.get("component"),
                    "impact_pct": edge_data.get("volume_percent", 50),
                    "criticality": edge_data.get("criticality", "medium"),
                }
    return list(cascade.values())
