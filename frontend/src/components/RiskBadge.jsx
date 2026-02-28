export function RiskBadge({ level }) {
  const map = {
    critical: 'risk-badge-critical',
    high: 'risk-badge-high',
    medium: 'risk-badge-medium',
    low: 'risk-badge-low',
  }
  return (
    <span className={map[level] || 'risk-badge-low'}>
      {level}
    </span>
  )
}

export function RiskBar({ score, showLabel = true }) {
  const color =
    score >= 75 ? '#EF4444' :
    score >= 55 ? '#F97316' :
    score >= 35 ? '#F59E0B' :
    '#10B981'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-semibold w-8 text-right" style={{ color }}>
          {score}
        </span>
      )}
    </div>
  )
}

export function SeverityPulse({ severity }) {
  const colorMap = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  }
  const base = colorMap[severity] || 'bg-slate-500'
  return (
    <span className="relative inline-flex">
      <span className={`w-2.5 h-2.5 rounded-full ${base}`}></span>
      {severity === 'critical' && (
        <span className={`pulse-ring w-2.5 h-2.5 ${base} top-0 left-0`}></span>
      )}
    </span>
  )
}
