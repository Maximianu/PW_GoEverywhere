import { api } from './api'

export const authService = {
  // Fazer login
  async login(email, pin, keepSession = false) {
    try {
      // Buscar admin por email
      const response = await api.getAdminByEmail(email)
      
      // Verificar estrutura de resposta
      let admins = response.data || response
      
      if (!admins || admins.length === 0) {
        throw new Error('Admin não encontrado')
      }
      
      const admin = admins[0]
      
      // Validar PIN (comparação simples - considere usar bcrypt no backend)
      if (String(admin.PIN) !== String(pin)) {
        throw new Error('Email ou PIN incorreto')
      }
      
      // Armazenar token
      const token = btoa(`${admin.id}:${Date.now()}`)
      const storage = keepSession ? localStorage : sessionStorage
      
      storage.setItem('adminToken', token)
      storage.setItem('adminId', admin.id)
      storage.setItem('adminEmail', admin.email)
      storage.setItem('adminName', admin.Nome)
      
      return {
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          nome: admin.Nome
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  // Fazer logout
  logout() {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminId')
    localStorage.removeItem('adminEmail')
    localStorage.removeItem('adminName')
    
    sessionStorage.removeItem('adminToken')
    sessionStorage.removeItem('adminId')
    sessionStorage.removeItem('adminEmail')
    sessionStorage.removeItem('adminName')
  },
  
  // Verificar se está autenticado
  isAuthenticated() {
    return !!(localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken'))
  },
  
  // Obter admin atual
  getCurrentAdmin() {
    return {
      id: localStorage.getItem('adminId') || sessionStorage.getItem('adminId'),
      email: localStorage.getItem('adminEmail') || sessionStorage.getItem('adminEmail'),
      nome: localStorage.getItem('adminName') || sessionStorage.getItem('adminName')
    }
  }
}
