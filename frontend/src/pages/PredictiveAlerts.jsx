import { useEffect, useState } from 'react'
import { alertsApi } from '../api'
import { RiskBadge, SeverityPulse } from '../components/RiskBadge'

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

const FACTOR_ICONS = {
  weather_risk: '🌪️',
  political_risk: '⚡',
  financial_risk: '📉',
  news_sentiment: '📰',
  port_congestion: '🚢',
}

export default function PredictiveAlerts() {
  const [alerts, setAlerts] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterTimeline, setFilterTimeline] = useState('all')

  useEffect(() => {
    Promise.all([alertsApi.getAll(), alertsApi.getSummary()])
      .then(([al, sum]) => {
        setAlerts(al.data)
        setSummary(sum.data)
        setLoading(false)
      })
  }, [])

  const filtered = alerts
    .filter(a => filterSeverity === 'all' || a.severity === filterSeverity)
    .filter(a => filterTimeline === 'all' || a.timeline_label === filterTimeline)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  const timelines = [...new Set(alerts.map(a => a.timeline_label))]

  const probColor = (p) => p >= 70 ? '#EF4444' : p >= 50 ? '#F97316' : p >= 30 ? '#F59E0B' : '#10B981'

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Predictive Alerts</h1>
          <p className="text-sm text-slate-500 mt-1">Disruption forecasts for the next 2–4 weeks</p>
        </div>
        {summary && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <SeverityPulse severity="critical" />
            <div>
              <p className="text-sm font-bold text-red-400">{summary.overall_disruption_probability}%</p>
              <p className="text-xs text-red-400/60">4-week disruption probability</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Alerts', value: summary.total_alerts, color: '#3B82F6', icon: '🔔' },
            { label: 'Critical', value: summary.critical_alerts, color: '#EF4444', icon: '🚨' },
            { label: 'High Severity', value: summary.high_alerts, color: '#F97316', icon: '⚠️' },
            { label: 'Disruption Risk', value: `${summary.overall_disruption_probability}%`, color: '#8B5CF6', icon: '📡' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 font-medium">Filter by:</span>
        <div className="flex gap-1.5">
          {['all', 'critical', 'high', 'medium'].map(s => (
            <button key={s}
              onClick={() => setFilterSeverity(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all capitalize ${
                filterSeverity === s
                  ? s === 'critical' ? 'bg-red-500/15 border-red-500/30 text-red-400'
                    : s === 'high' ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                    : s === 'medium' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}>
              {s === 'all' ? 'All Alerts' : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-2">
          {['all', ...timelines].map(t => (
            <button key={t}
              onClick={() => setFilterTimeline(t)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                filterTimeline === t
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}>
              {t === 'all' ? '🕐 Any Time' : `⏱ ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-28 rounded-xl"></div>)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert, i) => (
            <div key={alert.id} className="glass-card-hover p-5 animate-fade-in"
              style={{
                borderColor: alert.severity === 'critical' ? 'rgba(239,68,68,0.25)' :
                  alert.severity === 'high' ? 'rgba(249,115,22,0.2)' : 'rgba(51,65,85,0.4)',
                animationDelay: `${i * 40}ms`,
              }}>
              <div className="flex items-start gap-4">
                {/* Severity indicator */}
                <div className="mt-1">
                  <SeverityPulse severity={alert.severity} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{alert.alert_type}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{alert.impact_description}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <RiskBadge level={alert.severity} />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40">
                        {alert.timeline_label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-3">
                    {/* Supplier info */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs">Supplier:</span>
                      <span className="text-xs font-medium text-slate-300">{alert.supplier_name}</span>
                      <span className="text-xs text-slate-600">({alert.country_code})</span>
                    </div>

                    {/* Component */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs">Component:</span>
                      <span className="text-xs font-medium text-slate-300">{alert.affected_component}</span>
                    </div>

                    {/* Triggering factors */}
                    <div className="flex items-center gap-1">
                      {alert.triggering_factors?.map(f => (
                        <span key={f} title={f} className="text-sm">{FACTOR_ICONS[f] || '❓'}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Probability */}
                <div className="flex-shrink-0 text-center pl-4 border-l border-slate-700/40">
                  <p className="text-2xl font-bold" style={{ color: probColor(alert.probability) }}>
                    {alert.probability}%
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">probability</p>
                  <p className="text-xs text-slate-600 mt-0.5">~{alert.expected_days_out}d out</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-3xl mb-2">✅</p>
              <p className="font-medium">No alerts matching your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
