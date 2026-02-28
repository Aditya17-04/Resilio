import { useEffect, useState } from 'react'
import { simulatorApi, recommendationsApi } from '../api'
import { RiskBadge, RiskBar } from '../components/RiskBadge'

const COUNTRIES = [
  'China', 'Taiwan', 'USA', 'India', 'Germany', 'Japan', 'Vietnam', 'South Korea', 'Mexico', 'Brazil'
]

export default function ResilienceSimulator() {
  const [scenarios, setScenarios] = useState([])
  const [selectedScenario, setSelectedScenario] = useState('')
  const [targetType, setTargetType] = useState('country')
  const [targetCountry, setTargetCountry] = useState('China')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [recLoading, setRecLoading] = useState(true)

  useEffect(() => {
    simulatorApi.getScenarios().then(r => {
      setScenarios(r.data)
      setSelectedScenario(r.data[0]?.type || '')
    })
    recommendationsApi.getAll().then(r => {
      setRecommendations(r.data)
      setRecLoading(false)
    })
  }, [])

  const runSimulation = async () => {
    if (!selectedScenario) return
    setRunning(true)
    setResult(null)
    try {
      const payload = {
        scenario_type: selectedScenario,
        target_country: targetType === 'country' ? targetCountry : null,
      }
      const r = await simulatorApi.run(payload)
      setResult(r.data)
    } catch (err) {
      console.error(err)
    } finally {
      setRunning(false)
    }
  }

  const scenarioObj = scenarios.find(s => s.type === selectedScenario)

  const impactColor = (pct) =>
    pct >= 60 ? '#EF4444' : pct >= 35 ? '#F97316' : pct >= 15 ? '#F59E0B' : '#10B981'

  return (
    <div className="p-8 overflow-y-auto h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Resilience Simulator</h1>
        <p className="text-sm text-slate-500 mt-1">Simulate disruptions and see cascading impact across your supply network</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Scenario Builder */}
        <div className="glass-card p-6 space-y-5">
          <p className="text-sm font-bold text-slate-100">⚙️ Configure Scenario</p>

          {/* Scenario Type */}
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-2">DISRUPTION TYPE</label>
            <div className="grid grid-cols-1 gap-2">
              {scenarios.map(s => (
                <button
                  key={s.type}
                  onClick={() => setSelectedScenario(s.type)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedScenario === s.type
                      ? 'border-blue-500/40 bg-blue-500/08'
                      : 'border-slate-700/40 bg-slate-800/30 hover:border-slate-600'
                  }`}
                  style={selectedScenario === s.type ? { background: 'rgba(59,130,246,0.08)' } : {}}>
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{s.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.description}</p>
                  </div>
                  {selectedScenario === s.type && (
                    <span className="ml-auto text-blue-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-2">TARGET COUNTRY</label>
            <select
              value={targetCountry}
              onChange={e => setTargetCountry(e.target.value)}
              className="input-field w-full">
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Run Button */}
          <button
            onClick={runSimulation}
            disabled={running || !selectedScenario}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: running ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              color: 'white',
              opacity: running || !selectedScenario ? 0.7 : 1,
              cursor: running || !selectedScenario ? 'not-allowed' : 'pointer',
            }}>
            {running ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Simulating cascade...
              </>
            ) : (
              <>
                🧪 Run Simulation
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {!result && !running ? (
            <div className="glass-card p-6 h-full flex items-center justify-center text-center">
              <div>
                <p className="text-4xl mb-4">🧪</p>
                <p className="text-slate-400 font-medium text-sm">Select a scenario and run simulation</p>
                <p className="text-slate-600 text-xs mt-2">Results will show cascading impact across your supply network</p>
              </div>
            </div>
          ) : running ? (
            <div className="glass-card p-6 h-full flex items-center justify-center text-center">
              <div>
                <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-300 font-medium text-sm">Propagating disruption through network...</p>
                <p className="text-slate-600 text-xs mt-2">Running BFS cascade simulation</p>
              </div>
            </div>
          ) : result?.error ? (
            <div className="glass-card p-6 text-center">
              <p className="text-red-400">Error: {result.error}</p>
            </div>
          ) : result && (
            <div className="space-y-4">
              {/* Impact Summary */}
              <div className="glass-card p-5"
                style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{result.scenario_icon}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-100">{result.scenario_label}</p>
                    <p className="text-xs text-slate-500">Target: {result.target}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Directly Affected', value: result.directly_affected_count, color: '#EF4444' },
                    { label: 'Cascade Affected', value: result.cascade_affected_count, color: '#F97316' },
                    { label: 'Network Impact', value: `${result.total_affected_pct}%`, color: '#F59E0B' },
                    { label: 'Recovery Est.', value: `${result.estimated_recovery_days}d`, color: '#8B5CF6' },
                  ].map((m, i) => (
                    <div key={i} className="bg-navy-800/60 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                      <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Resilience Before/After */}
                <div className="mt-4 p-3 rounded-lg bg-slate-800/50">
                  <p className="text-xs text-slate-500 mb-2">Resilience Score Impact</p>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-400">{result.before_resilience_score}</p>
                      <p className="text-xs text-slate-600">Before</p>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-emerald-500/20 rounded-full">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                          style={{ width: `${result.before_resilience_score}%` }}></div>
                      </div>
                      <span className="text-red-400 text-lg">→</span>
                      <div className="flex-1 h-1.5 bg-red-500/20 rounded-full">
                        <div className="h-full bg-red-500 rounded-full transition-all duration-1000"
                          style={{ width: `${result.after_resilience_score}%` }}></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-400">{result.after_resilience_score}</p>
                      <p className="text-xs text-slate-600">After</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cascade Details */}
              {result.cascade_details?.length > 0 && (
                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-3">
                    Cascade Impact Chain ({result.cascade_details.length} suppliers)
                  </p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {result.cascade_details.slice(0, 15).map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.risk_level === 'critical' ? 'bg-red-500' : c.risk_level === 'high' ? 'bg-orange-500' : 'bg-amber-500'}`}></span>
                        <span className="text-slate-300 font-medium truncate flex-1">{c.supplier_name}</span>
                        <span className="text-slate-600">{c.country_code} · T{c.tier}</span>
                        <span className="text-red-400 font-mono">{c.impact_pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="section-title text-sm">💡 Resilience Recommendations</p>
            <p className="text-xs text-slate-500">Alternative suppliers for high-risk nodes</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            {recommendations.length} recommendations
          </span>
        </div>
        {recLoading ? (
          <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="skeleton h-16 rounded-lg"></div>)}</div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recommendations.slice(0, 15).map((rec, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/40 transition-colors border border-slate-700/20">
                {/* From */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-red-400 font-semibold truncate">{rec.risky_supplier_name}</span>
                    <span className="text-xs text-slate-600">({rec.risky_country})</span>
                    <RiskBadge level={rec.risky_risk_level} />
                  </div>
                  <p className="text-xs text-slate-500">{rec.component}</p>
                </div>

                {/* Arrow */}
                <div className="text-slate-600 flex-shrink-0">→</div>

                {/* To */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-emerald-400 font-semibold truncate">{rec.alt_supplier_name}</span>
                    <span className="text-xs text-slate-600">({rec.alt_country})</span>
                  </div>
                  <p className="text-xs text-slate-500">Risk: {rec.alt_risk_score}</p>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                  <div className="text-center">
                    <p className="text-emerald-400 font-semibold">-{rec.risk_reduction_pct}%</p>
                    <p className="text-slate-600">risk</p>
                  </div>
                  <div className="text-center">
                    <p className={rec.cost_change_pct > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {rec.cost_change_pct > 0 ? '+' : ''}{rec.cost_change_pct}%
                    </p>
                    <p className="text-slate-600">cost</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    rec.recommendation_strength === 'Strong' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    : rec.recommendation_strength === 'Moderate' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    : 'text-slate-400 border-slate-600 bg-slate-800'
                  }`}>
                    {rec.recommendation_strength}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
