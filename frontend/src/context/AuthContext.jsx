import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const COMPANY_PROFILES = {
  techcorp: {
    id: 'techcorp',
    name: 'TechCorp Solutions',
    tagline: 'Electronics & Semiconductor Manufacturing',
    color: '#6366F1',   // indigo
    gradient: 'from-indigo-600 to-purple-600',
    risk: 'HIGH',
    resilience: 52,
    industry: 'Semiconductors',
    flag: '🔷',
  },
  pharma: {
    id: 'pharma',
    name: 'PharmaCo Industries',
    tagline: 'Pharmaceutical Supply Chain',
    color: '#10B981',   // emerald
    gradient: 'from-emerald-600 to-teal-600',
    risk: 'MEDIUM',
    resilience: 65,
    industry: 'Chemicals',
    flag: '💊',
  },
  auto: {
    id: 'auto',
    name: 'AutoMotive Global',
    tagline: 'Automotive Parts Manufacturing',
    color: '#F59E0B',   // amber
    gradient: 'from-amber-600 to-orange-600',
    risk: 'MEDIUM-LOW',
    resilience: 71,
    industry: 'Batteries',
    flag: '🚗',
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const getOrg = (u) => u?.user_metadata?.org || 'techcorp'
  const getCompany = (u) => COMPANY_PROFILES[getOrg(u)] || COMPANY_PROFILES.techcorp

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    org: user ? getOrg(user) : null,
    company: user ? getCompany(user) : null,
    token: session?.access_token || null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
