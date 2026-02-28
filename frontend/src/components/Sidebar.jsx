import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', label: 'Executive Dashboard', icon: '📊' },
  { to: '/network', label: 'Supply Network', icon: '🕸️' },
  { to: '/risk', label: 'Risk Intelligence', icon: '⚠️' },
  { to: '/alerts', label: 'Predictive Alerts', icon: '🔔' },
  { to: '/simulator', label: 'Resilience Simulator', icon: '🧪' },
]

const RESILIENCE_COLOR = (r) => {
  if (r < 55) return '#F87171'
  if (r < 68) return '#FBBF24'
  return '#34D399'
}

export default function Sidebar() {
  const { user, company, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
  }

  const initials = company?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'R'

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-30"
      style={{ background: 'linear-gradient(180deg, #0A0F1E 0%, #080C18 100%)', borderRight: '1px solid rgba(51,65,85,0.4)' }}>

      {/* Logo */}
      <div className="p-5 border-b border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-black text-white"
            style={{ background: `linear-gradient(135deg, ${company?.color || '#6366F1'}, #8B5CF6)` }}>
            R
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm tracking-wide">Resilio</div>
            <div className="text-xs text-slate-500">Supply Chain Analyzer</div>
          </div>
        </div>
      </div>

      {/* Company card */}
      {company && (
        <div className="px-3 pt-3">
          <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{company.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">{company.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{company.tagline}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-slate-500">Resilience</span>
                <span className="ml-1 font-bold" style={{ color: RESILIENCE_COLOR(company.resilience) }}>
                  {company.resilience}/100
                </span>
              </div>
              <div className="text-slate-600">·</div>
              <div>
                <span className="text-slate-500">Risk</span>
                <span className={`ml-1 font-bold ${company.risk === 'HIGH' ? 'text-red-400' : company.risk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {company.risk}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs text-emerald-400 font-medium">Live Monitoring</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1">
          Analytics
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 transition-all'
                : 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all'
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-700/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${company?.color || '#6366F1'}, #8B5CF6)` }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-300 truncate">{user?.email}</div>
            <div className="text-[10px] text-slate-600">Authenticated via Supabase</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 py-2 px-3 rounded-lg transition-all text-left border border-transparent hover:border-red-500/20"
        >
          → Sign out
        </button>
      </div>
    </aside>
  )
}
