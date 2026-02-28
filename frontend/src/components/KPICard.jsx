export default function KPICard({ title, value, subtitle, icon, color = 'blue', trend, loading }) {
  const colorMap = {
    blue: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', text: '#3B82F6', icon_bg: 'rgba(59,130,246,0.15)' },
    red: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', text: '#EF4444', icon_bg: 'rgba(239,68,68,0.15)' },
    amber: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#F59E0B', icon_bg: 'rgba(245,158,11,0.15)' },
    green: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: '#10B981', icon_bg: 'rgba(16,185,129,0.15)' },
    purple: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', text: '#8B5CF6', icon_bg: 'rgba(139,92,246,0.15)' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className="glass-card p-5 animate-fade-in" style={{ borderColor: c.border }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          {loading ? (
            <div className="skeleton h-8 w-24 rounded mb-2"></div>
          ) : (
            <p className="text-3xl font-bold tracking-tight" style={{ color: c.text }}>
              {value}
            </p>
          )}
          {subtitle && <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              <span>{trend > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% vs last week</span>
            </div>
          )}
        </div>
        <div className="ml-4 w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: c.icon_bg }}>
          {icon}
        </div>
      </div>
    </div>
  )
}
