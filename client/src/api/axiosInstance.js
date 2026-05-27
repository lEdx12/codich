import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
})

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const RUTA_LOGIN_POR_ROL = {
  administrador: '/admin/login',
  instructor:    '/instructor/login',
  'diseñador':   '/login',
}

axiosInstance.interceptors.response.use(
  res => res,
  err => {
    const esEndpointLogin = err.config?.url?.includes('/auth/login')
    if (err.response?.status === 401 && !esEndpointLogin) {
      try {
        const stored  = localStorage.getItem('usuario')
        const usuario = stored ? JSON.parse(stored) : null
        const destino = (usuario?.rol && RUTA_LOGIN_POR_ROL[usuario.rol]) || '/login'
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        window.location.href = destino
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default axiosInstance
