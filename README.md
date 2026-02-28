# Resilio — Supply Chain Resilience & Risk Analyzer

> Hackathon project: map multi-tier supply networks, score risks, predict disruptions, simulate scenarios.

## 🚀 Quick Start

**Double-click `start.bat`** in this folder. It launches:
- **Backend** (FastAPI) → `http://localhost:8001`  
- **Frontend** (React) → `http://localhost:5170`

Open `http://localhost:5170` in your browser.

---

## Manual Start

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Dashboard Pages

| Page | Route | What It Shows |
|------|-------|---------------|
| Executive Dashboard | `/` | KPI cards, risk donut, industry breakdown, country exposure |
| Supply Network | `/network` | D3 force-directed graph (125 nodes), click to inspect |
| Risk Intelligence | `/risk` | SPOF list, country exposure, filterable risk table |
| Predictive Alerts | `/alerts` | 20 alerts with probability, severity, timeline |
| Resilience Simulator | `/simulator` | Run disruption scenarios, see cascade + recommendations |

---

## API Endpoints (`http://localhost:8001`)

```
GET  /api/risk/overview          # KPI summary
GET  /api/suppliers              # All 125 suppliers (filter: tier, country, industry)
GET  /api/network/graph          # Full graph: nodes + edges
GET  /api/network/spof           # Single points of failure
GET  /api/alerts                 # Disruption alerts (filter: severity)
GET  /api/alerts/summary         # 4-week disruption probability
GET  /api/recommendations        # Alternative supplier recommendations
POST /api/simulator/run          # Run disruption scenario
/docs                            # Swagger UI
```

**Simulator example:**
```bash
curl -X POST http://localhost:8001/api/simulator/run \
  -H "Content-Type: application/json" \
  -d '{"scenario_type":"port_closure","target_country":"China"}'
```

---

## API Keys (all optional — works on synthetic data by default)

Edit `backend/.env`:
```
OPENWEATHER_API_KEY=   # https://openweathermap.org/api (free signup)
SUPABASE_URL=          # https://supabase.com (free)
SUPABASE_ANON_KEY=
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + Tailwind CSS + D3.js + Recharts |
| Backend | FastAPI + NetworkX + Pandas + NumPy |
| Database | Supabase (PostgreSQL) — optional, defaults to in-memory |
| Graph | NetworkX DiGraph, betweenness centrality, BFS cascade |
| Data | 125 synthetic suppliers, 3 tiers, 10 countries, 5 industries |
