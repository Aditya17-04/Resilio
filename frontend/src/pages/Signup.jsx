import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, COMPANY_PROFILES } from '../context/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    org: 'techcorp'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const { data, error } = await signUp(
      formData.email,
      formData.password,
      {
        full_name: formData.fullName,
        company_name: formData.companyName,
        org: formData.org
      }
    )

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Check if email confirmation is required
      if (data?.user && !data.session) {
        setSuccess(true)
        setLoading(false)
      } else {
        // Auto-signed in (email confirmation disabled)
        navigate('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left: Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-black text-white">R</div>
            <span className="text-2xl font-black text-white tracking-tight">Resilio</span>
          </div>
          <p className="text-slate-500 text-sm">Supply Chain Resilience & Risk Analyzer</p>
        </div>

        {success ? (
          /* Success Message */
          <div className="max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl mb-6">
              ✓
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-slate-400 mb-6">
              We've sent a verification link to <span className="text-white font-medium">{formData.email}</span>
            </p>
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <p className="text-sm text-slate-300 mb-2">
                <span className="font-semibold text-white">Next steps:</span>
              </p>
              <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                <li>Open your email inbox</li>
                <li>Click the verification link</li>
                <li>Return here and sign in</li>
              </ol>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <p className="text-xs text-amber-200">
                <span className="font-semibold">For Demo/Development:</span> To disable email verification, go to your Supabase project → Authentication → Settings → Email Auth → Disable "Confirm email"
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-center font-semibold transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-slate-400 mb-8">Join organizations monitoring their supply chain resilience</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="Your Company Inc."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Organization Type</label>
            <select
              name="org"
              value={formData.org}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              {Object.entries(COMPANY_PROFILES).map(([key, profile]) => (
                <option key={key} value={key}>
                  {profile.flag} {profile.name} - {profile.tagline}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@company.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
                Creating account...
              </>
            ) : 'Create Account →'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-xs text-slate-600">
          Powered by Supabase Auth · All data encrypted at rest
        </p>
          </>
        )}
      </div>

      {/* Right: Feature Panel */}
      <div className="hidden lg:flex flex-col w-[480px] bg-slate-900 border-l border-slate-800 p-8 justify-center">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
            🚀 GET STARTED
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Monitor Supply Chain Risk</h2>
          <p className="text-slate-400 text-sm">Get real-time visibility into your supply chain resilience</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xl shrink-0">
                📊
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Risk Intelligence</h3>
                <p className="text-slate-400 text-sm">Track supplier risk scores, country exposure, and vulnerability patterns</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xl shrink-0">
                🔗
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Network Visualization</h3>
                <p className="text-slate-400 text-sm">Interactive supply chain graphs and single point of failure detection</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-xl shrink-0">
                ⚡
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Predictive Alerts</h3>
                <p className="text-slate-400 text-sm">AI-powered risk forecasting and proactive disruption warnings</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-xl shrink-0">
                🎯
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Scenario Simulation</h3>
                <p className="text-slate-400 text-sm">Test supply chain resilience against various disruption scenarios</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <p className="text-xs text-slate-300">
            <span className="text-white font-medium">100% Secure:</span> Your supply chain data is encrypted and never shared. Enterprise-grade security by Supabase.
          </p>
        </div>
      </div>
    </div>
  )
}
