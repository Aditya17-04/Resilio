import axios from 'axios'
import { supabase } from '../lib/supabase'

const api = axios.create({
  baseURL: '/api',
})

// Attach org + Bearer token from Supabase session on every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers['Authorization'] = `Bearer ${session.access_token}`
  }
  if (session?.user?.user_metadata?.org) {
    config.headers['X-Org-ID'] = session.user.user_metadata.org
  }
  return config
})

// ── Named API groups (for page components) ──────────────────────
export const riskApi = {
  getOverview:         () => api.get('/risk/overview'),
  getTopRisky:         (limit = 10) => api.get(`/risk/top-risky?limit=${limit}`),
  getCountryExposure:  () => api.get('/risk/country-exposure'),
  getIndustryBreakdown:() => api.get('/risk/industry-breakdown'),
}

export const alertsApi = {
  getAll:     (params = {}) => api.get('/alerts', { params }),
  getSummary: () => api.get('/alerts/summary'),
}

export const suppliersApi = {
  getAll:   (params = {}) => api.get('/suppliers', { params }),
  getById:  (id) => api.get(`/suppliers/${id}`),
}

export const networkApi = {
  getGraph: () => api.get('/network/graph'),
  getSpof:  () => api.get('/network/spof'),
}

export const simulatorApi = {
  getScenarios: () => api.get('/simulator/scenarios'),
  run: (payload) => api.post('/simulator/run', payload),
}

export const recommendationsApi = {
  getAll: () => api.get('/recommendations'),
}

export default api
