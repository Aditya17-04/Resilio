import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, COMPANY_PROFILES } from '../context/AuthContext'

const DEMO_ACCOUNTS = [
  {
    org: 'techcorp',
    email: 'techcorp.rebel@gmail.com',
    password: 'Demo1234!',
    description: 'Semiconductor manufacturer with HIGH Taiwan/China risk exposure',
    resilience: 52,
    suppliers: 45,
  },
  {
    org: 'pharma',
    email: 'pharma.rebel@gmail.com',
    password: 'Demo1234!',
    description: 'Pharmaceutical company with India API dependency concentration',
    resilience: 65,
    suppliers: 40,
  },
  {
    org: 'auto',
    email: 'auto.rebel@gmail.com',
    password: 'Demo1234!',
    description: 'Automotive manufacturer with Japan/Germany/Mexico exposure',
    resilience: 71,
    suppliers: 42,
  },
]

const RISK_COLOR = { HIGH: 'text-red-400 bg-red-400/10 border-red-400/30', MEDIUM: 'text-amber-400 bg-amber-400/10 border-amber-400/30', 'MEDIUM-LOW': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' }
const RESILIENCE_COLOR = (r) => r < 55 ? 'text-red-400' : r < 68 ? 'text-amber-400' : 'text-emerald-400'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  const fillDemo = (account) => {
    setSelectedDemo(account.org)
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-black text-white">R</div>
            <span className="text-2xl font-black text-white tracking-tight">Resilio</span>
          </div>
          <p className="text-slate-500 text-sm">Supply Chain Resilience & Risk Analyzer</p>
        </div>

        <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-slate-400 mb-8">Sign in to your organization's dashboard</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : 'Sign In →'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign up
          </Link>
        </p>

        <p className="mt-4 text-xs text-slate-600">
          Powered by Supabase Auth · All data encrypted at rest
        </p>
      </div>

      {/* Right: Demo Accounts Panel */}
      <div className="hidden lg:flex flex-col w-[480px] bg-slate-900 border-l border-slate-800 p-8 justify-center">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
            🎯 HACKATHON DEMO
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Quick Access</h2>
          <p className="text-slate-400 text-sm">Click any company to auto-fill credentials and see their unique supply chain risk profile</p>
        </div>

        <div className="space-y-3">
          {DEMO_ACCOUNTS.map((account) => {
            const profile = COMPANY_PROFILES[account.org]
            const isSelected = selectedDemo === account.org
            return (
              <button
                key={account.org}
                onClick={() => fillDemo(account)}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:border-slate-600 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{profile.flag}</span>
                    <span className="font-semibold text-white text-sm">{profile.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RISK_COLOR[profile.risk]}`}>
                    {profile.risk}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{account.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Resilience</span>
                    <span className={`ml-1.5 font-bold ${RESILIENCE_COLOR(account.resilience)}`}>{account.resilience}/100</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Suppliers</span>
                    <span className="ml-1.5 font-bold text-slate-300">{account.suppliers}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Pwd</span>
                    <code className="ml-1.5 text-slate-400 font-mono">{account.password}</code>
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-2 text-xs text-indigo-400 font-medium">✓ Credentials filled — click Sign In</div>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-800 border border-slate-700">
          <p className="text-xs text-slate-400">
            <span className="text-slate-300 font-medium">Tip:</span> Each company has a different risk profile. TechCorp shows high Taiwan semiconductor exposure. PharmaCo shows India API dependency. AutoMotive shows a more resilient multi-region strategy.
          </p>
        </div>
      </div>
    </div>
  )
}
