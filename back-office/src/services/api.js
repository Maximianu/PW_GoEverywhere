// API Service para comunicar com o Strapi
const API_URL = 'http://localhost:1338'

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken')
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include' // Incluir cookies
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API error: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  },
  
  // Autenticação
  async login(email, password) {
    return this.request('/api/admins', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${email}:${password}`)}`
      }
    })
  },
  
  // Buscar admins
  async getAdmins() {
    return this.request('/api/admins')
  },
  
  // Buscar um admin por email
  async getAdminByEmail(email) {
    return this.request(`/api/admins?filters[email][$eq]=${email}&populate=*`)
  }
}
