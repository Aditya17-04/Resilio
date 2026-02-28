# Resilio Supply Chain Analyzer - System Architecture

## Overview

Resilio is a full-stack web application designed to analyze supply chain resilience and risk. It provides real-time visibility into supply network vulnerabilities, predictive alerts, and scenario simulation capabilities.

## Technology Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 5.1
- **Routing**: React Router DOM 7.13.1
- **UI Styling**: Tailwind CSS 3.4
- **Data Visualization**: 
  - Recharts 3.7.0 (charts)
  - D3.js 7.9.0 (network graphs)
  - React Simple Maps 3.0.0 (geographical maps)
- **Authentication**: Supabase Auth 2.98.0
- **HTTP Client**: Axios 1.13.6
- **Notifications**: React Hot Toast 2.6.0

### Backend
- **Framework**: FastAPI (Python)
- **ASGI Server**: Uvicorn
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **Graph Processing**: NetworkX
- **Environment**: Python 3.x with virtual environment

### Development Tools
- **Linting**: ESLint 9.39
- **CSS Processing**: PostCSS, Autoprefixer
- **Version Control**: Git

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React SPA (Port 5170)                        │  │
│  │  - Login/Signup Pages                                     │  │
│  │  - Executive Dashboard                                    │  │
│  │  - Network Graph Visualization                            │  │
│  │  - Risk Intelligence                                      │  │
│  │  - Predictive Alerts                                      │  │
│  │  - Resilience Simulator                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         FastAPI REST API (Port 8001)                     │  │
│  │  - CORS Middleware                                        │  │
│  │  - JWT Authentication                                     │  │
│  │  - Organization Context (X-Org-ID Header)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                        │
│  ┌─────────────┬─────────────┬──────────────┬────────────────┐ │
│  │   Routers   │   Engines   │     Data     │  Dependencies  │ │
│  │             │             │  Generators  │                │ │
│  │ • suppliers │• risk_engine│• company_data│ • org_dep      │ │
│  │ • network   │• graph_eng. │• seed_data   │ • supabase     │ │
│  │ • risk      │• prediction │              │   client       │ │
│  │ • alerts    │• recommend. │              │                │ │
│  │ • recommend │• scenario   │              │                │ │
│  │ • simulator │             │              │                │ │
│  │ • seed      │             │              │                │ │
│  └─────────────┴─────────────┴──────────────┴────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase (PostgreSQL)                        │  │
│  │  - User Authentication & Authorization                    │  │
│  │  - User Profiles with Organization Metadata              │  │
│  │  - JWT Token Management                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         In-Memory Company Data Cache                      │  │
│  │  - Procedurally Generated Supply Chain Data              │  │
│  │  - Suppliers, Dependencies, Alerts                        │  │
│  │  - Per-Organization Data Isolation                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
src/
├── pages/
│   ├── Login.jsx                    # Authentication page with demo accounts
│   ├── Signup.jsx                   # User registration page
│   ├── ExecutiveDashboard.jsx       # Overview KPIs and charts
│   ├── NetworkGraph.jsx             # D3.js supply network visualization
│   ├── RiskIntelligence.jsx         # Risk analysis and breakdowns
│   ├── PredictiveAlerts.jsx         # Alert management and filtering
│   └── ResilienceSimulator.jsx      # Scenario simulation interface
├── components/
│   ├── Sidebar.jsx                  # Navigation and company profile
│   ├── PrivateRoute.jsx             # Auth-protected route wrapper
│   ├── KPICard.jsx                  # Reusable dashboard card
│   └── RiskBadge.jsx                # Risk visualization components
├── context/
│   └── AuthContext.jsx              # Global auth state management
├── api/
│   └── index.js                     # Axios API client with interceptors
└── lib/
    └── supabase.js                  # Supabase client configuration
```

### Backend Components

```
backend/
├── main.py                          # FastAPI app with CORS and routes
├── routers/
│   ├── suppliers.py                 # Supplier listing and filtering
│   ├── network.py                   # Network graph and SPOF endpoints
│   ├── risk.py                      # Risk metrics and analysis
│   ├── alerts.py                    # Alert listing and summaries
│   ├── recommendations.py           # Alternative supplier suggestions
│   ├── simulator.py                 # Scenario simulation
│   └── seed.py                      # Data generation utilities
├── engines/
│   ├── risk_engine.py               # Risk scoring algorithms
│   ├── graph_engine.py              # NetworkX graph analysis
│   ├── prediction_engine.py         # Alert probability calculations
│   ├── recommendation_engine.py     # Supplier alternative matching
│   └── scenario_engine.py           # Disruption cascade simulation
├── data/
│   ├── company_data.py              # Company-specific data generation
│   └── seed_data.py                 # Base synthetic data generation
└── db/
    ├── org_dep.py                   # Organization context dependency
    ├── supabase_client.py           # Supabase connection setup
    └── schema.sql                   # Database schema (reference)
```

## Data Flow

### 1. Authentication Flow

```
User Login Request
    │
    ├─→ Frontend: POST credentials to Supabase
    │
    ├─→ Supabase: Validate credentials, issue JWT
    │
    ├─→ Frontend: Store session in AuthContext
    │
    └─→ Frontend: Extract org from user.user_metadata
                  Attach X-Org-ID header to all API requests
```

### 2. API Request Flow

```
Component Makes API Call (e.g., riskApi.getOverview())
    │
    ├─→ Axios Interceptor: Add Authorization Bearer token
    │                      Add X-Org-ID header
    │
    ├─→ FastAPI Endpoint: Extract org via get_org() dependency
    │
    ├─→ Router: Call get_company_data(org)
    │
    ├─→ Data Layer: Return cached or generate company-specific data
    │
    ├─→ Engine: Process data (risk scoring, graph analysis, etc.)
    │
    └─→ Response: Return JSON to frontend
```

### 3. Data Generation Flow

```
get_company_data(org)
    │
    ├─→ Check if org in _caches
    │   └─→ If exists: return cached data
    │
    ├─→ If not exists:
    │   ├─→ Load company configuration (TECHCORP/PHARMA/AUTO)
    │   ├─→ Generate suppliers with procedural randomization
    │   ├─→ Generate tier-based dependencies
    │   ├─→ Generate risk-based alerts
    │   └─→ Cache and return
    │
    └─→ Return: {suppliers, dependencies, alerts, profile}
```

## API Endpoints

### Authentication Endpoints (Supabase)
- `POST /auth/signup` - Create new user
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `GET /auth/session` - Get current session

### Supply Chain API Endpoints

#### Suppliers
- `GET /api/suppliers` - List all suppliers (with filters)
- `GET /api/suppliers/{id}` - Get supplier details

#### Network & Graph
- `GET /api/network/graph` - Get network visualization data
- `GET /api/network/spof` - Get single points of failure

#### Risk Analysis
- `GET /api/risk/overview` - Get risk summary statistics
- `GET /api/risk/top-risky` - Get highest risk suppliers
- `GET /api/risk/country-exposure` - Get country risk breakdown
- `GET /api/risk/industry-breakdown` - Get industry risk breakdown

#### Alerts
- `GET /api/alerts` - List predictive alerts (with filters)
- `GET /api/alerts/summary` - Get alert summary statistics

#### Recommendations
- `GET /api/recommendations` - Get alternative supplier recommendations

#### Simulation
- `GET /api/simulator/scenarios` - List available scenario types
- `POST /api/simulator/run` - Run disruption scenario

#### Health
- `GET /api/health` - Health check endpoint

## Key Algorithms

### Risk Scoring
```
Risk Score = (
    geographic_risk × 0.25 +
    financial_risk × 0.20 +
    weather_risk × 0.20 +
    concentration_risk × 0.20 +
    centrality_risk × 0.15
)

Risk Level:
- critical: score >= 75
- high: score >= 55
- medium: score >= 35
- low: score < 35
```

### Graph Centrality
- **Algorithm**: Betweenness Centrality (NetworkX)
- **Purpose**: Identify critical nodes in supply network
- **SPOF Criteria**: centrality > 0.04 AND has successors AND <= 3 predecessors

### Disruption Cascade
```
1. Start with affected supplier(s)
2. Follow directed edges to dependent nodes
3. Calculate impact based on volume_percent
4. Track cascade depth and affected count
5. Return enriched cascade data with risk scores
```

## Security Architecture

### Authentication
- **Method**: Supabase JWT-based authentication
- **Token Storage**: Managed by Supabase client in local storage
- **Token Refresh**: Automatic via Supabase auth state management

### Authorization
- **Org Isolation**: X-Org-ID header ensures data separation
- **Valid Orgs**: techcorp, pharma, auto
- **Default**: Falls back to techcorp for unauthenticated requests

### API Security
- **CORS**: Configured for localhost:5170, localhost:3000
- **Headers**: Authorization Bearer token + X-Org-ID
- **Input Validation**: Pydantic models for request validation

## Organization Data Model

### Company Profiles
```javascript
{
  techcorp: {
    id: 'techcorp',
    name: 'TechCorp Solutions',
    tagline: 'Electronics & Semiconductor Manufacturing',
    risk: 'HIGH',
    resilience: 52,
    industry: 'Semiconductors',
    // High Taiwan/China exposure
  },
  pharma: {
    id: 'pharma',
    name: 'PharmaCo Industries',
    tagline: 'Pharmaceutical Supply Chain',
    risk: 'MEDIUM',
    resilience: 65,
    industry: 'Chemicals',
    // High India API dependency
  },
  auto: {
    id: 'auto',
    name: 'AutoMotive Global',
    tagline: 'Automotive Parts Manufacturing',
    risk: 'MEDIUM-LOW',
    resilience: 71,
    industry: 'Batteries',
    // Diversified multi-region strategy
  }
}
```

## Deployment Architecture

### Development Environment
```
Backend:  http://localhost:8001
Frontend: http://localhost:5170
Database: Supabase Cloud (pdrjjyznrjwjxgkkxdch.supabase.co)
```

### Startup Process
```bash
start.bat
    │
    ├─→ Terminal 1: Backend (uvicorn with --reload)
    │   └─→ Activates venv, starts on port 8001
    │
    └─→ Terminal 2: Frontend (vite dev server)
        └─→ Starts on port 5170 with HMR
```

### Production Considerations
- **Frontend**: Static build → CDN/Nginx
- **Backend**: Containerize with Docker, deploy to cloud platform
- **Database**: Migrate to production Supabase project
- **Secrets**: Use environment variables (.env)
- **Scaling**: Horizontal scaling for backend, CDN for frontend

## Performance Optimizations

### Frontend
- **Code Splitting**: React.lazy for page-level components
- **Memoization**: useMemo for expensive calculations
- **Virtual Scrolling**: For large supplier lists
- **Debouncing**: Search and filter inputs

### Backend
- **Caching**: In-memory company data cache (_caches)
- **Lazy Loading**: Data generated only when requested
- **Graph Optimization**: NetworkX algorithms with reasonable limits
- **Response Compression**: FastAPI automatic gzip

## Monitoring & Health

### Health Check
```
GET /api/health
Response: {"status": "ok"}
```

### API Metadata
```
GET /
Response: {
  "app": "Resilio Supply Chain Analyzer",
  "version": "1.0.0",
  "status": "operational",
  "endpoints": [...]
}
```

### Development Logging
- **Frontend**: Browser DevTools console
- **Backend**: Uvicorn stdout logs with INFO level

## Future Enhancements

1. **Real Data Integration**: Connect to actual ERP/supplier databases
2. **Machine Learning**: Predictive models for risk forecasting
3. **WebSocket**: Real-time alert notifications
4. **Export**: PDF/Excel report generation
5. **Multi-tenant**: Full SaaS with database-backed multi-tenancy
6. **Advanced Analytics**: Time-series analysis and trend forecasting
7. **Collaboration**: Team features, shared dashboards
8. **Mobile**: Responsive design improvements and PWA

---

**Last Updated**: February 28, 2026
**Version**: 1.0.0
