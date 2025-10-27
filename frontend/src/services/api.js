import axios from 'axios'

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://web-production-0a522.up.railway.app' // Em produção, usa a URL do Railway
  : 'http://localhost:3001' // Em desenvolvimento, usa localhost

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // Autenticação
  async register(email, senha) {
    const response = await api.post('/registrar', { email, senha })
    return response.data
  },

  async login(email, senha) {
    const response = await api.post('/login', { email, senha })
    return response.data
  }
}

export const bancaService = {
  // Banca
  async getSaldo() {
    const response = await api.get('/banca')
    return response.data
  },

  async updateSaldo(novoSaldo) {
    const response = await api.put('/banca', { novo_saldo: novoSaldo })
    return response.data
  }
}

export const apostasService = {
  // Apostas
  async getApostasAtivas() {
    const response = await api.get('/apostas-ativas')
    return response.data
  },

  async getHistorico() {
    const response = await api.get('/apostas-historico')
    return response.data
  },

  // Atualizar status de uma leg
  async updateLegStatus(legId, status) {
    const response = await api.put(`/legs/${legId}`, { status_leg: status })
    return response.data
  },

  // Criar nova aposta
  async criarAposta(dadosAposta) {
    const response = await api.post('/apostas', dadosAposta)
    return response.data
  },

  // API Externa - Ligas e Jogos
  async getLigas() {
    const response = await api.get('/ligas')
    return response.data
  },

  async getJogosDaLiga(ligaId) {
    const response = await api.get(`/jogos-da-liga/${ligaId}`)
    return response.data
  },

  async getDetalhesJogo(jogoId) {
    const response = await api.get(`/jogo/${jogoId}`)
    return response.data
  }
}

export const iaService = {
  // Análise com IA
  async analisarConfronto(timeA, timeB) {
    const response = await api.post('/analise-ia', { timeA, timeB })
    return response.data
  }
}

export default api
