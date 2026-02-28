import { useEffect, useState } from 'react'
import { riskApi, alertsApi, suppliersApi } from '../api'
import KPICard from '../components/KPICard'
import { RiskBadge, RiskBar } from '../components/RiskBadge'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS_RISK = ['#EF4444', '#F97316', '#F59E0B', '#10B981']
const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-slate-300 font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function ExecutiveDashboard() {
  const [overview, setOverview] = useState(null)
  const [alertSummary, setAlertSummary] = useState(null)
  const [industryData, setIndustryData] = useState([])
  const [topRisky, setTopRisky] = useState([])
  const [countryData, setCountryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      riskApi.getOverview(),
      alertsApi.getSummary(),
      riskApi.getIndustryBreakdown(),
      riskApi.getTopRisky(5),
      riskApi.getCountryExposure(),
    ]).then(([ov, al, ind, top, cty]) => {
      setOverview(ov.data)
      setAlertSummary(al.data)
      setIndustryData(ind.data)
      setTopRisky(top.data)
      setCountryData(cty.data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  const pieData = overview ? [
    { name: 'Critical', value: overview.critical_count },
    { name: 'High', value: overview.high_risk_count },
    { name: 'Medium', value: overview.medium_risk_count },
    { name: 'Low', value: overview.low_risk_count },
  ] : []

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 gradient-text">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time supply chain resilience overview</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live · Updated just now
        </div>
      </div>

      {/* Alert Banner */}
      {alertSummary && alertSummary.critical_alerts > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
          <span className="text-xl">🚨</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">
              {alertSummary.critical_alerts} Critical Disruption Alert{alertSummary.critical_alerts > 1 ? 's' : ''} Active
            </p>
            <p className="text-xs text-red-400/70 mt-0.5">
              {alertSummary.overall_disruption_probability}% probability of disruption in the next 4 weeks
            </p>
          </div>
          <button className="text-xs text-red-400 hover:text-red-300 font-medium underline">View Alerts →</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Suppliers"
          value={loading ? '—' : overview?.total_suppliers}
          subtitle="Across 3 tiers, 10 countries"
          icon="🏭"
          color="blue"
          loading={loading}
        />
        <KPICard
          title="High Risk Suppliers"
          value={loading ? '—' : (overview?.critical_count || 0) + (overview?.high_risk_count || 0)}
          subtitle={`${overview?.critical_count || 0} critical · ${overview?.high_risk_count || 0} high`}
          icon="⚠️"
          color="red"
          loading={loading}
        />
        <KPICard
          title="Resilience Score"
          value={loading ? '—' : `${overview?.resilience_score}/100`}
          subtitle="System-wide risk health index"
          icon="🛡️"
          color={overview?.resilience_score > 60 ? 'green' : overview?.resilience_score > 40 ? 'amber' : 'red'}
          loading={loading}
        />
        <KPICard
          title="4-Week Disruption Risk"
          value={loading ? '—' : `${alertSummary?.overall_disruption_probability || 0}%`}
          subtitle={`${alertSummary?.total_alerts || 0} active alerts`}
          icon="📡"
          color="purple"
          loading={loading}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="glass-card p-5">
          <p className="section-title text-sm">Risk Distribution</p>
          <p className="text-xs text-slate-500 mb-4">Across all suppliers</p>
          {loading ? (
            <div className="skeleton h-48 rounded-lg"></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS_RISK[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Industry Risk Breakdown */}
        <div className="glass-card p-5 col-span-2">
          <p className="section-title text-sm">Industry Risk Breakdown</p>
          <p className="text-xs text-slate-500 mb-4">Average risk score by sector</p>
          {loading ? (
            <div className="skeleton h-48 rounded-lg"></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={industryData} layout="vertical" barCategoryGap={8}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="industry" tick={{ fill: '#94A3B8', fontSize: 11 }} width={110} axisLine={false} tickLine={false} />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Bar dataKey="avg_risk" name="Avg Risk" radius={[0, 4, 4, 0]}>
                  {industryData.map((entry, i) => (
                    <Cell key={i} fill={entry.avg_risk >= 60 ? '#EF4444' : entry.avg_risk >= 45 ? '#F97316' : entry.avg_risk >= 30 ? '#F59E0B' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Country Exposure */}
        <div className="glass-card p-5">
          <p className="section-title text-sm">Country Exposure</p>
          <p className="text-xs text-slate-500 mb-4">Supplier concentration by country</p>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-8 rounded"></div>)}</div>
          ) : (
            <div className="space-y-3">
              {countryData.slice(0, 6).map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{c.country_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{c.supplier_count} suppliers</span>
                      <span className="text-xs font-semibold" style={{ color: c.avg_risk >= 55 ? '#EF4444' : c.avg_risk >= 35 ? '#F59E0B' : '#10B981' }}>
                        {c.avg_risk}
                      </span>
                    </div>
                  </div>
                  <RiskBar score={c.avg_risk} showLabel={false} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Critical Suppliers */}
        <div className="glass-card p-5">
          <p className="section-title text-sm">Top Risk Suppliers</p>
          <p className="text-xs text-slate-500 mb-4">Immediate attention required</p>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-10 rounded"></div>)}</div>
          ) : (
            <div className="space-y-2">
              {topRisky.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                  <span className="text-xs font-mono text-slate-600 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.country_name} · {s.tier === 1 ? 'Tier 1' : s.tier === 2 ? 'Tier 2' : 'Tier 3'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge level={s.risk_level} />
                    <span className="text-xs font-bold" style={{ color: s.risk_score >= 75 ? '#EF4444' : '#F97316' }}>
                      {s.risk_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
