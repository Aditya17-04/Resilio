import { useEffect, useState } from 'react'
import { riskApi, networkApi } from '../api'
import { RiskBadge, RiskBar } from '../components/RiskBadge'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
} from 'recharts'

const CUSTOM_TOOLTIP = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#94A3B8' }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function RiskIntelligence() {
  const [topRisky, setTopRisky] = useState([])
  const [countryExposure, setCountryExposure] = useState([])
  const [industryData, setIndustryData] = useState([])
  const [spofData, setSpofData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTier, setFilterTier] = useState('all')
  const [filterIndustry, setFilterIndustry] = useState('all')

  useEffect(() => {
    Promise.all([
      riskApi.getTopRisky(20),
      riskApi.getCountryExposure(),
      riskApi.getIndustryBreakdown(),
      networkApi.getSpof(),
    ]).then(([top, cty, ind, spof]) => {
      setTopRisky(top.data)
      setCountryExposure(cty.data)
      setIndustryData(ind.data)
      setSpofData(spof.data)
      setLoading(false)
    })
  }, [])

  const filtered = topRisky.filter(s => {
    if (filterTier !== 'all' && s.tier !== parseInt(filterTier)) return false
    if (filterIndustry !== 'all' && s.industry !== filterIndustry) return false
    return true
  })

  const industries = [...new Set(topRisky.map(s => s.industry))]

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Risk Intelligence</h1>
        <p className="text-sm text-slate-500 mt-1">Deep-dive risk analysis across tiers, countries, and industries</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Single Points of Failure',
            value: spofData.length,
            sub: 'Critical network bottlenecks',
            color: '#EF4444',
            icon: '⚡'
          },
          {
            label: 'High Concentration Countries',
            value: countryExposure.filter(c => c.avg_risk > 55).length,
            sub: 'Countries with avg risk > 55',
            color: '#F97316',
            icon: '🌍'
          },
          {
            label: 'At-Risk Industries',
            value: industryData.filter(i => i.avg_risk > 50).length,
            sub: 'Sectors needing attention',
            color: '#F59E0B',
            icon: '🏭'
          }
        ].map((item, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{item.label}</p>
                <p className="text-3xl font-bold" style={{ color: item.color }}>{loading ? '—' : item.value}</p>
                <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
              </div>
              <span className="text-2xl">{item.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Country Exposure Chart */}
        <div className="glass-card p-5">
          <p className="section-title text-sm">Geographic Concentration Risk</p>
          <p className="text-xs text-slate-500 mb-4">Average risk score by country</p>
          {loading ? <div className="skeleton h-56 rounded"></div> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={countryExposure} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="country_name" tick={{ fill: '#94A3B8', fontSize: 10 }} width={90} axisLine={false} tickLine={false} />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Bar dataKey="avg_risk" name="Avg Risk" radius={[0, 4, 4, 0]}>
                  {countryExposure.map((entry, i) => (
                    <Cell key={i} fill={entry.avg_risk >= 60 ? '#EF4444' : entry.avg_risk >= 45 ? '#F97316' : entry.avg_risk >= 30 ? '#F59E0B' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* SPOF Panel */}
        <div className="glass-card p-5">
          <p className="section-title text-sm flex items-center gap-2">
            <span>⚡</span> Single Points of Failure
          </p>
          <p className="text-xs text-slate-500 mb-4">Suppliers where removal cascades failure</p>
          {loading ? <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="skeleton h-10 rounded"></div>)}</div> : (
            <div className="space-y-2 overflow-y-auto max-h-56">
              {spofData.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <span className="text-red-400 text-sm">⚡</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{s.supplier_name}</p>
                    <p className="text-xs text-slate-500">{s.country_code} · {s.dependents_count} downstream</p>
                  </div>
                  <div className="text-xs font-mono text-red-400">{Number(s.centrality_score).toFixed(3)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Risk Suppliers Table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="section-title text-sm">Top High-Risk Suppliers</p>
            <p className="text-xs text-slate-500">Filter and analyze critical nodes</p>
          </div>
          <div className="flex gap-2">
            <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="input-field text-xs">
              <option value="all">All Tiers</option>
              <option value="1">Tier 1</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
            </select>
            <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)} className="input-field text-xs">
              <option value="all">All Industries</option>
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
        </div>

        {loading ? <div className="skeleton h-64 rounded"></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/40">
                  {['Supplier', 'Tier', 'Country', 'Industry', 'Component', 'Geo Risk', 'Fin Risk', 'Risk Score', 'Level'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                {filtered.map((s, i) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-200">{s.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">T{s.tier}</td>
                    <td className="py-2.5 px-3 text-slate-400">{s.country_code}</td>
                    <td className="py-2.5 px-3 text-slate-400">{s.industry}</td>
                    <td className="py-2.5 px-3 text-slate-400">{s.component}</td>
                    <td className="py-2.5 px-3">
                      <span style={{ color: s.geographic_risk > 60 ? '#EF4444' : '#94A3B8' }}>{s.geographic_risk}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span style={{ color: s.financial_risk > 60 ? '#EF4444' : '#94A3B8' }}>{s.financial_risk}</span>
                    </td>
                    <td className="py-2.5 px-3 w-32">
                      <RiskBar score={s.risk_score} />
                    </td>
                    <td className="py-2.5 px-3">
                      <RiskBadge level={s.risk_level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
