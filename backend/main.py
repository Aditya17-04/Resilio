from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Resilio Supply Chain Analyzer API",
    description="Supply Chain Resilience & Risk Analyzer — Hackathon Edition",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5170", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import suppliers, network, risk, alerts, recommendations, simulator, seed

app.include_router(suppliers.router)
app.include_router(network.router)
app.include_router(risk.router)
app.include_router(alerts.router)
app.include_router(recommendations.router)
app.include_router(simulator.router)
app.include_router(seed.router)

@app.get("/")
def root():
    return {
        "app": "Resilio Supply Chain Analyzer",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": [
            "/api/suppliers",
            "/api/network/graph",
            "/api/network/spof",
            "/api/risk/overview",
            "/api/risk/top-risky",
            "/api/risk/country-exposure",
            "/api/risk/industry-breakdown",
            "/api/alerts",
            "/api/alerts/summary",
            "/api/recommendations",
            "/api/simulator/scenarios",
            "/api/simulator/run",
            "/api/health",
            "/docs",
        ]
    }

@app.get("/api/health")
def health():
    return {"status": "ok"}
