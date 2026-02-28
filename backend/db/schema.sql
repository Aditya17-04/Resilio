-- ============================================================
-- REBEL Supply Chain Analyzer — Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
    country_code TEXT NOT NULL,
    country_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    component TEXT NOT NULL,
    lat FLOAT,
    lng FLOAT,
    geographic_risk FLOAT DEFAULT 50,
    financial_risk FLOAT DEFAULT 50,
    annual_revenue_m INTEGER,
    employees INTEGER,
    years_operating INTEGER,
    certifications INTEGER,
    on_time_delivery_pct FLOAT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dependencies table
CREATE TABLE IF NOT EXISTS dependencies (
    id INTEGER PRIMARY KEY,
    from_supplier_id INTEGER REFERENCES suppliers(id),
    to_supplier_id INTEGER REFERENCES suppliers(id),
    component TEXT NOT NULL,
    volume_percent INTEGER DEFAULT 50,
    criticality TEXT DEFAULT 'medium' CHECK (criticality IN ('high', 'medium', 'low')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disruption alerts table
CREATE TABLE IF NOT EXISTS disruption_alerts (
    id INTEGER PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    supplier_name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    probability INTEGER DEFAULT 50,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    expected_days INTEGER DEFAULT 14,
    affected_component TEXT,
    impact_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Country risk table
CREATE TABLE IF NOT EXISTS country_risk (
    country_code TEXT PRIMARY KEY,
    country_name TEXT NOT NULL,
    political_risk INTEGER DEFAULT 50,
    weather_risk INTEGER DEFAULT 30,
    economic_risk INTEGER DEFAULT 40,
    trade_restriction_risk INTEGER DEFAULT 30,
    port_congestion_risk INTEGER DEFAULT 25,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security but allow anon read (for demo)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE disruption_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_risk ENABLE ROW LEVEL SECURITY;

-- Allow anon users to SELECT (read) all data
CREATE POLICY "Allow anon read suppliers" ON suppliers FOR SELECT TO anon USING (TRUE);
CREATE POLICY "Allow anon read dependencies" ON dependencies FOR SELECT TO anon USING (TRUE);
CREATE POLICY "Allow anon read alerts" ON disruption_alerts FOR SELECT TO anon USING (TRUE);
CREATE POLICY "Allow anon read country_risk" ON country_risk FOR SELECT TO anon USING (TRUE);

-- Allow anon users to INSERT (for seeding via API)
CREATE POLICY "Allow anon insert suppliers" ON suppliers FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "Allow anon insert dependencies" ON dependencies FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "Allow anon insert alerts" ON disruption_alerts FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "Allow anon insert country_risk" ON country_risk FOR INSERT TO anon WITH CHECK (TRUE);

-- Allow anon DELETE (for re-seeding)
CREATE POLICY "Allow anon delete suppliers" ON suppliers FOR DELETE TO anon USING (TRUE);
CREATE POLICY "Allow anon delete dependencies" ON dependencies FOR DELETE TO anon USING (TRUE);
CREATE POLICY "Allow anon delete alerts" ON disruption_alerts FOR DELETE TO anon USING (TRUE);
CREATE POLICY "Allow anon delete country_risk" ON country_risk FOR DELETE TO anon USING (TRUE);
