# Resilio System Architecture - Mermaid Diagrams

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ CLIENT LAYER"]
        Browser["Web Browser"]
        React["React SPA<br/>(Port 5170)"]
        Browser --> React
    end

    subgraph API["🔌 API GATEWAY LAYER"]
        FastAPI["FastAPI REST API<br/>(Port 8001)"]
        CORS["CORS Middleware"]
        Auth["JWT Auth"]
        OrgContext["Organization Context<br/>(X-Org-ID)"]
        
        CORS --> FastAPI
        Auth --> FastAPI
        OrgContext --> FastAPI
    end

    subgraph Business["⚙️ BUSINESS LOGIC LAYER"]
        Routers["Routers<br/>• suppliers<br/>• network<br/>• risk<br/>• alerts<br/>• recommendations<br/>• simulator"]
        Engines["Engines<br/>• risk_engine<br/>• graph_engine<br/>• prediction_engine<br/>• recommendation_engine<br/>• scenario_engine"]
        DataGen["Data Generators<br/>• company_data<br/>• seed_data"]
        
        Routers --> Engines
        Routers --> DataGen
    end

    subgraph Data["💾 DATA LAYER"]
        Supabase["Supabase PostgreSQL<br/>• User Authentication<br/>• User Profiles<br/>• JWT Management"]
        Cache["In-Memory Cache<br/>• Company Data<br/>• Suppliers<br/>• Dependencies<br/>• Alerts"]
    end

    React -->|HTTP/JSON| FastAPI
    FastAPI --> Routers
    Engines --> Supabase
    Engines --> Cache
    DataGen --> Cache

    style Client fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style API fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
    style Business fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
    style Data fill:#581c87,stroke:#a855f7,stroke-width:2px,color:#fff
```

## 2. Frontend Component Architecture

```mermaid
graph LR
    subgraph App["App.jsx"]
        Router["React Router"]
        AuthProvider["Auth Provider"]
        Toaster["Toast Notifications"]
    end

    subgraph Pages["📄 Pages"]
        Login["Login"]
        Signup["Signup"]
        Dashboard["Executive Dashboard"]
        Network["Network Graph"]
        Risk["Risk Intelligence"]
        Alerts["Predictive Alerts"]
        Simulator["Resilience Simulator"]
    end

    subgraph Components["🧩 Components"]
        Sidebar["Sidebar"]
        PrivateRoute["Private Route"]
        KPICard["KPI Card"]
        RiskBadge["Risk Badge"]
    end

    subgraph API_Layer["🌐 API Layer"]
        APIClient["Axios Client<br/>(api/index.js)"]
        Interceptors["Request Interceptors<br/>• Add JWT Token<br/>• Add X-Org-ID"]
    end

    subgraph Context["📦 Context"]
        AuthContext["Auth Context<br/>• User State<br/>• Company Profile<br/>• Sign In/Out"]
    end

    subgraph External["☁️ External"]
        Supabase["Supabase Client"]
    end

    Router --> Pages
    AuthProvider --> AuthContext
    Pages --> Components
    Pages --> API_Layer
    PrivateRoute --> AuthContext
    API_Layer --> Interceptors
    Interceptors --> AuthContext
    AuthContext --> Supabase

    style Pages fill:#1e40af,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Components fill:#0e7490,stroke:#06b6d4,stroke-width:2px,color:#fff
    style API_Layer fill:#047857,stroke:#10b981,stroke-width:2px,color:#fff
    style Context fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
```

## 3. Backend Component Architecture

```mermaid
graph TB
    subgraph Main["main.py"]
        App["FastAPI App"]
        Middleware["CORS Middleware"]
    end

    subgraph Routers["📡 API Routers"]
        SupplierRouter["suppliers.py<br/>GET /suppliers<br/>GET /suppliers/:id"]
        NetworkRouter["network.py<br/>GET /network/graph<br/>GET /network/spof"]
        RiskRouter["risk.py<br/>GET /risk/overview<br/>GET /risk/top-risky"]
        AlertRouter["alerts.py<br/>GET /alerts<br/>GET /alerts/summary"]
        RecRouter["recommendations.py<br/>GET /recommendations"]
        SimRouter["simulator.py<br/>GET /simulator/scenarios<br/>POST /simulator/run"]
    end

    subgraph Engines["⚙️ Processing Engines"]
        RiskEngine["risk_engine.py<br/>• compute_risk_scores<br/>• get_overview<br/>• get_top_risky"]
        GraphEngine["graph_engine.py<br/>• build_graph<br/>• get_centrality<br/>• simulate_disruption"]
        PredEngine["prediction_engine.py<br/>• get_alerts<br/>• get_disruption_probability"]
        RecEngine["recommendation_engine.py<br/>• get_recommendations<br/>• find_alternatives"]
        ScenarioEngine["scenario_engine.py<br/>• run_scenario<br/>• cascade_analysis"]
    end

    subgraph Data["📊 Data Layer"]
        CompanyData["company_data.py<br/>• get_company_data<br/>• generate_suppliers"]
        SeedData["seed_data.py<br/>• get_data<br/>• base_generation"]
        OrgDep["org_dep.py<br/>• get_org<br/>• org_validation"]
        Cache["_caches dict<br/>Per-org cached data"]
    end

    subgraph DB["💾 Database"]
        Supabase["Supabase Client<br/>supabase_client.py"]
    end

    App --> Middleware
    App --> Routers
    
    SupplierRouter --> CompanyData
    NetworkRouter --> GraphEngine
    RiskRouter --> RiskEngine
    AlertRouter --> PredEngine
    RecRouter --> RecEngine
    SimRouter --> ScenarioEngine
    
    Routers --> OrgDep
    
    RiskEngine --> GraphEngine
    PredEngine --> RiskEngine
    RecEngine --> RiskEngine
    ScenarioEngine --> RiskEngine
    ScenarioEngine --> GraphEngine
    
    GraphEngine --> CompanyData
    RiskEngine --> CompanyData
    CompanyData --> Cache
    CompanyData --> SeedData
    
    Engines --> Supabase

    style Routers fill:#1e40af,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Engines fill:#047857,stroke:#10b981,stroke-width:2px,color:#fff
    style Data fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
```

## 4. Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant React
    participant Supabase
    participant FastAPI
    participant Database

    User->>Browser: Open App
    Browser->>React: Load Application
    React->>React: Check AuthContext
    React->>Supabase: getSession()
    
    alt Not Authenticated
        React->>Browser: Redirect to /login
        User->>Browser: Enter Credentials
        Browser->>React: Submit Login
        React->>Supabase: signInWithPassword()
        Supabase->>Database: Validate Credentials
        Database-->>Supabase: User Data
        Supabase-->>React: Session + JWT Token
        React->>React: Store in AuthContext
        React->>React: Extract org from user_metadata
        React->>Browser: Redirect to /dashboard
    end
    
    User->>Browser: Click on Dashboard Feature
    Browser->>React: Navigate
    React->>FastAPI: API Request + JWT + X-Org-ID
    FastAPI->>FastAPI: Validate JWT
    FastAPI->>FastAPI: Extract org from header
    FastAPI->>FastAPI: get_company_data(org)
    FastAPI-->>React: Response Data
    React->>Browser: Render UI
```

## 5. API Request Flow

```mermaid
sequenceDiagram
    participant Component as React Component
    participant API as API Client
    participant Interceptor as Axios Interceptor
    participant Supabase as Supabase Client
    participant FastAPI as FastAPI Server
    participant Router as Router
    participant Engine as Engine
    participant Data as Data Layer

    Component->>API: riskApi.getOverview()
    API->>Interceptor: axios.get('/risk/overview')
    Interceptor->>Supabase: getSession()
    Supabase-->>Interceptor: session data
    Interceptor->>Interceptor: Add Authorization header
    Interceptor->>Interceptor: Add X-Org-ID from user_metadata
    Interceptor->>FastAPI: GET /api/risk/overview
    FastAPI->>Router: risk.risk_overview()
    Router->>Router: get_org() dependency
    Router->>Data: get_company_data(org)
    
    alt Data in Cache
        Data-->>Router: Return cached data
    else Data not in Cache
        Data->>Data: Generate company data
        Data->>Data: Cache data
        Data-->>Router: Return generated data
    end
    
    Router->>Engine: get_overview(suppliers, dependencies)
    Engine->>Engine: get_scored_suppliers()
    Engine->>Engine: compute_risk_scores()
    Engine->>Engine: calculate statistics
    Engine-->>Router: Risk overview data
    Router-->>FastAPI: JSON response
    FastAPI-->>Interceptor: HTTP 200 + JSON
    Interceptor-->>API: Response data
    API-->>Component: Parsed data
    Component->>Component: Update state & render
```

## 6. Data Generation Flow

```mermaid
flowchart TD
    Start([API Request for Org Data]) --> CheckCache{Data in<br/>_caches?}
    
    CheckCache -->|Yes| ReturnCache[Return Cached Data]
    CheckCache -->|No| LoadConfig[Load Company Config]
    
    LoadConfig --> ConfigMap{Which Org?}
    ConfigMap -->|techcorp| Tech[TechCorp Config<br/>Seed: 42]
    ConfigMap -->|pharma| Pharma[PharmaCo Config<br/>Seed: 99]
    ConfigMap -->|auto| Auto[AutoMotive Config<br/>Seed: 77]
    
    Tech --> Generate
    Pharma --> Generate
    Auto --> Generate
    
    Generate[Generate Suppliers] --> Tier1[Generate Tier 1<br/>3-5 suppliers]
    Tier1 --> Tier2[Generate Tier 2<br/>12-18 suppliers]
    Tier2 --> Tier3[Generate Tier 3<br/>22-32 suppliers]
    
    Tier3 --> Dependencies[Generate Dependencies]
    Dependencies --> Dep1[Tier 1 → Tier 2 links]
    Dep1 --> Dep2[Tier 2 → Tier 3 links]
    Dep2 --> AddRandom[Add random cross-tier links]
    
    AddRandom --> GenAlerts[Generate Alerts]
    GenAlerts --> HighRisk[Filter high-risk suppliers]
    HighRisk --> CreateAlerts[Create 15 alerts with<br/>severity & probability]
    
    CreateAlerts --> CacheData[Cache Data by Org]
    CacheData --> ReturnCache
    
    ReturnCache --> End([Return Data Object])
    
    style CheckCache fill:#fbbf24,stroke:#f59e0b,stroke-width:3px
    style Generate fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
    style Dependencies fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style GenAlerts fill:#f97316,stroke:#c2410c,stroke-width:2px,color:#fff
```

## 7. Risk Scoring Algorithm

```mermaid
flowchart LR
    Supplier[Supplier Data] --> Factors[Risk Factors]
    
    Factors --> Geo[Geographic Risk<br/>Weight: 25%]
    Factors --> Fin[Financial Risk<br/>Weight: 20%]
    Factors --> Weather[Weather Risk<br/>Weight: 20%]
    Factors --> Conc[Concentration Risk<br/>Weight: 20%]
    Factors --> Cent[Centrality Risk<br/>Weight: 15%]
    
    Geo --> Calc[Weighted Sum]
    Fin --> Calc
    Weather --> Calc
    Conc --> Calc
    Cent --> Calc
    
    Calc --> Score[Risk Score<br/>0-100]
    
    Score --> Level{Score Value}
    Level -->|>= 75| Critical[Critical]
    Level -->|>= 55| High[High]
    Level -->|>= 35| Medium[Medium]
    Level -->|< 35| Low[Low]
    
    Critical --> Output[Risk Level]
    High --> Output
    Medium --> Output
    Low --> Output
    
    style Factors fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
    style Calc fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style Level fill:#fbbf24,stroke:#f59e0b,stroke-width:3px
    style Critical fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    style High fill:#f97316,stroke:#ea580c,stroke-width:2px,color:#fff
    style Medium fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
    style Low fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
```

## 8. Disruption Cascade Simulation

```mermaid
flowchart TD
    Start([Run Scenario]) --> Input[Input Parameters]
    Input --> Type[Scenario Type]
    Input --> Target[Target Country/Supplier]
    Input --> Severity[Severity Level]
    
    Target --> Filter[Filter Affected Suppliers]
    Filter --> Initial[Initial Affected Set]
    
    Initial --> BuildGraph[Build Network Graph<br/>NetworkX DiGraph]
    BuildGraph --> Queue[Initialize BFS Queue]
    
    Queue --> Process{More Nodes<br/>in Queue?}
    Process -->|Yes| Current[Get Current Node]
    Current --> Successors[Find All Successors]
    Successors --> CheckVisited{Already<br/>Visited?}
    
    CheckVisited -->|No| AddCascade[Add to Cascade]
    AddCascade --> CalcImpact[Calculate Impact %]
    CalcImpact --> AddQueue[Add to Queue]
    AddQueue --> Process
    
    CheckVisited -->|Yes| Process
    Process -->|No| Enrich[Enrich with Risk Data]
    
    Enrich --> Stats[Calculate Statistics]
    Stats --> Direct[Directly Affected Count]
    Stats --> Cascade[Cascade Affected Count]
    Stats --> ImpactPct[Overall Impact %]
    Stats --> Recovery[Recovery Time Estimate]
    
    Recovery --> Result([Return Cascade Result])
    
    style Initial fill:#ef4444,stroke:#dc2626,stroke-width:3px,color:#fff
    style BuildGraph fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
    style Process fill:#fbbf24,stroke:#f59e0b,stroke-width:3px
    style Stats fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
```

## 9. Multi-Organization Architecture

```mermaid
graph TB
    subgraph Users["👥 Users"]
        U1["User 1<br/>org: techcorp"]
        U2["User 2<br/>org: pharma"]
        U3["User 3<br/>org: auto"]
    end

    subgraph Auth["🔐 Supabase Auth"]
        JWT1["JWT with<br/>user_metadata.org"]
        JWT2["JWT with<br/>user_metadata.org"]
        JWT3["JWT with<br/>user_metadata.org"]
    end

    subgraph API["FastAPI"]
        OrgExtract["Extract org from<br/>X-Org-ID header"]
    end

    subgraph Data["💾 Data Cache"]
        Cache["_caches dictionary"]
        Tech["techcorp:<br/>{suppliers, deps, alerts}"]
        Pharma["pharma:<br/>{suppliers, deps, alerts}"]
        Auto["auto:<br/>{suppliers, deps, alerts}"]
    end

    U1 --> JWT1
    U2 --> JWT2
    U3 --> JWT3
    
    JWT1 --> OrgExtract
    JWT2 --> OrgExtract
    JWT3 --> OrgExtract
    
    OrgExtract -->|org=techcorp| Tech
    OrgExtract -->|org=pharma| Pharma
    OrgExtract -->|org=auto| Auto
    
    Tech --> Cache
    Pharma --> Cache
    Auto --> Cache
    
    style Users fill:#1e40af,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Auth fill:#047857,stroke:#10b981,stroke-width:2px,color:#fff
    style Data fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
    style Tech fill:#6366f1,stroke:#4f46e5,stroke-width:2px,color:#fff
    style Pharma fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    style Auto fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
```

## 10. Deployment Architecture

```mermaid
graph TB
    subgraph Dev["🖥️ Development Environment"]
        StartBat["start.bat"]
        Term1["Terminal 1<br/>Backend Server<br/>Port 8001"]
        Term2["Terminal 2<br/>Frontend Dev Server<br/>Port 5170"]
    end

    subgraph Prod["☁️ Production Environment"]
        CDN["CDN/Nginx<br/>Static Frontend"]
        LoadBalancer["Load Balancer"]
        Container1["Backend Container 1<br/>FastAPI"]
        Container2["Backend Container 2<br/>FastAPI"]
        Container3["Backend Container 3<br/>FastAPI"]
    end

    subgraph External["🌐 External Services"]
        SupabaseProd["Supabase Production<br/>PostgreSQL + Auth"]
        Monitoring["Monitoring Service<br/>Logs & Metrics"]
    end

    subgraph Users_Prod["Users"]
        Browser["Web Browsers"]
    end

    StartBat --> Term1
    StartBat --> Term2
    
    Browser --> CDN
    CDN --> LoadBalancer
    LoadBalancer --> Container1
    LoadBalancer --> Container2
    LoadBalancer --> Container3
    
    Container1 --> SupabaseProd
    Container2 --> SupabaseProd
    Container3 --> SupabaseProd
    
    Container1 --> Monitoring
    Container2 --> Monitoring
    Container3 --> Monitoring
    
    style Dev fill:#1e40af,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Prod fill:#047857,stroke:#10b981,stroke-width:2px,color:#fff
    style External fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
```

---

## How to Use These Diagrams

1. **Copy the mermaid code blocks** from any diagram above
2. **Paste into any Mermaid-compatible viewer**:
   - GitHub Markdown (will render automatically)
   - [Mermaid Live Editor](https://mermaid.live/)
   - VS Code with Mermaid extension
   - Notion, Confluence, or other documentation tools
3. **Customize** colors, labels, or structure as needed

## Diagram Types Used

- **graph TB/LR**: Top-to-bottom or left-to-right graphs
- **flowchart TD/LR**: Flowcharts with more shape options
- **sequenceDiagram**: Time-based interaction flows

---

**Generated for**: Resilio Supply Chain Analyzer  
**Date**: February 28, 2026  
**Version**: 1.0.0
