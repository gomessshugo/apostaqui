import api from './authService'

export const betService = {
  // Listar apostas
  async getBets(params = {}) {
    const response = await api.get('/bets', { params })
    return response.data
  },

  // Obter aposta específica
  async getBet(id) {
    const response = await api.get(`/bets/${id}`)
    return response.data
  },

  // Criar aposta
  async createBet(betData) {
    const response = await api.post('/bets', betData)
    return response.data
  },

  // Atualizar aposta
  async updateBet(id, betData) {
    const response = await api.put(`/bets/${id}`, betData)
    return response.data
  },

  // Atualizar resultado da aposta
  async updateBetResult(id, resultData) {
    const response = await api.put(`/bets/${id}/result`, resultData)
    return response.data
  },

  // Deletar aposta
  async deleteBet(id) {
    const response = await api.delete(`/bets/${id}`)
    return response.data
  },

  // Obter categorias
  async getCategories() {
    const response = await api.get('/bets/categories/list')
    return response.data
  }
}
