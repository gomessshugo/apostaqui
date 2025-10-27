import { useState, useEffect } from 'react'
import { Target, RefreshCw, TrendingUp, AlertCircle, Eye, EyeOff, Filter, Search, Calendar, DollarSign, Zap, BarChart3, Activity, Trophy, Star, Sparkles } from 'lucide-react'
import { apostasService } from '../services/api'

export default function PaginaDashboard() {
  const [apostas, setApostas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [legStates, setLegStates] = useState({}) // Para controlar estados visuais das legs
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [showDetails, setShowDetails] = useState({})
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'table'

  useEffect(() => {
    loadApostas()
  }, [])

  const loadApostas = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await apostasService.getApostasAtivas()
      setApostas(response.apostas)
      
      // Inicializar estados das legs
      const initialStates = {}
      response.apostas.forEach(aposta => {
        aposta.legs.forEach(leg => {
          initialStates[leg.id] = leg.status_leg || 'PENDENTE'
        })
      })
      setLegStates(initialStates)
    } catch (error) {
      setError('Erro ao carregar apostas')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLegStatusChange = async (legId, newStatus) => {
    try {
      // Atualizar estado visual imediatamente
      setLegStates(prev => ({
        ...prev,
        [legId]: newStatus
      }))

      // Chamar API para salvar no banco
      await apostasService.updateLegStatus(legId, newStatus)
      
      // Recarregar apostas para refletir mudanças
      await loadApostas()
      
      console.log(`✅ Status da leg ${legId} atualizado para ${newStatus}`)
    } catch (error) {
      console.error('❌ Erro ao atualizar status da leg:', error)
      // Reverter estado visual em caso de erro
      setLegStates(prev => ({
        ...prev,
        [legId]: 'PENDENTE'
      }))
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'GANHA':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PERDIDA':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'PENDENTE':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'GANHA':
        return '✅'
      case 'PERDIDA':
        return '❌'
      case 'PENDENTE':
      default:
        return '⚠️'
    }
  }

  // Filtrar apostas
  const filteredApostas = apostas.filter(aposta => {
    const matchesSearch = aposta.nome_grupo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aposta.legs.some(leg => 
                           leg.jogo_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           leg.mercado.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    
    const matchesStatus = statusFilter === 'TODOS' || aposta.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Estatísticas rápidas
  const stats = {
    total: apostas.length,
    pendentes: apostas.filter(a => a.status === 'PENDENTE').length,
    ganhas: apostas.filter(a => a.status === 'GANHA').length,
    perdidas: apostas.filter(a => a.status === 'PERDIDA').length,
    valorTotal: apostas.reduce((sum, a) => sum + a.valor_apostado, 0),
    retornoTotal: apostas.reduce((sum, a) => sum + (a.valor_apostado * a.odd_total), 0)
  }

  const toggleDetails = (apostaId) => {
    setShowDetails(prev => ({
      ...prev,
      [apostaId]: !prev[apostaId]
    }))
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Loading */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Stats Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Loading */}
        <div className="text-center py-16">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto animate-ping opacity-20"></div>
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700">Carregando apostas...</p>
          <p className="mt-2 text-gray-500">Preparando dados em tempo real</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard Ao Vivo
              </h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-green-500" />
                Acompanhe suas apostas em tempo real
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            {viewMode === 'grid' ? <Eye className="h-5 w-5 mr-2 text-blue-600" /> : <EyeOff className="h-5 w-5 mr-2 text-blue-600" />}
            <span className="font-semibold text-gray-700">{viewMode === 'grid' ? 'Tabela' : 'Cards'}</span>
          </button>
          <button
            onClick={loadApostas}
            disabled={loading}
            className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-semibold">Atualizar</span>
          </button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Total de Apostas</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Apostas ativas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.pendentes}</p>
              <p className="text-xs text-gray-500 mt-1">Aguardando resultado</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Ganhas</p>
              <p className="text-3xl font-bold text-green-900">{stats.ganhas}</p>
              <p className="text-xs text-gray-500 mt-1">Apostas vencedoras</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Valor Total</p>
              <p className="text-3xl font-bold text-purple-900">{formatCurrency(stats.valorTotal)}</p>
              <p className="text-xs text-gray-500 mt-1">Investimento total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por jogo, time ou mercado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input w-full sm:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="GANHA">Ganhas</option>
              <option value="PERDIDA">Perdidas</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Mostrando {filteredApostas.length} de {apostas.length} apostas
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Lista de Apostas */}
      {filteredApostas.length === 0 ? (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {apostas.length === 0 ? 'Nenhuma aposta ativa' : 'Nenhuma aposta encontrada'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {apostas.length === 0 
              ? 'Você ainda não tem apostas pendentes.'
              : 'Tente ajustar os filtros de busca.'
            }
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Vista em Tabela (Planilha) */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aposta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Odd
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retorno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApostas.map((aposta) => (
                  <tr key={aposta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {aposta.nome_grupo || 'Aposta Individual'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {aposta.legs.length} leg{aposta.legs.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(aposta.valor_apostado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {aposta.odd_total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(aposta.valor_apostado * aposta.odd_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(aposta.status)}`}>
                        {getStatusIcon(aposta.status)} {aposta.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleDetails(aposta.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {showDetails[aposta.id] ? 'Ocultar' : 'Ver'} Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vista em Cards */
        <div className="space-y-6">
          {filteredApostas.map((aposta) => (
            <div key={aposta.id} className="card">
              {/* Header da Aposta */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {aposta.nome_grupo || 'Aposta Individual'}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      Valor: <span className="font-medium">{formatCurrency(aposta.valor_apostado)}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      Odd Total: <span className="font-medium">{aposta.odd_total}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      Retorno: <span className="font-medium text-green-600">
                        {formatCurrency(aposta.valor_apostado * aposta.odd_total)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(aposta.status)}`}>
                    {getStatusIcon(aposta.status)} {aposta.status}
                  </span>
                </div>
              </div>

              {/* Legs da Aposta */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Legs da Aposta:</h4>
                  <button
                    onClick={() => toggleDetails(aposta.id)}
                    className="text-sm text-primary-600 hover:text-primary-900 flex items-center"
                  >
                    {showDetails[aposta.id] ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                    {showDetails[aposta.id] ? 'Ocultar' : 'Ver'} Detalhes
                  </button>
                </div>
                
                {showDetails[aposta.id] && (
                  <div className="space-y-2">
                    {aposta.legs.map((leg) => (
                      <div key={leg.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{leg.jogo_nome}</h5>
                            <p className="text-sm text-gray-600">{leg.mercado}</p>
                            <p className="text-sm text-gray-500">Odd: {leg.odd_leg}</p>
                          </div>
                          
                          {/* Status Visual Atual */}
                          <div className="mr-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(legStates[leg.id] || leg.status_leg)}`}>
                              {getStatusIcon(legStates[leg.id] || leg.status_leg)} {legStates[leg.id] || leg.status_leg}
                            </span>
                          </div>

                          {/* Botões de Status */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleLegStatusChange(leg.id, 'GANHA')}
                              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                legStates[leg.id] === 'GANHA' 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              ✅ Ganha
                            </button>
                            <button
                              onClick={() => handleLegStatusChange(leg.id, 'PERDIDA')}
                              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                legStates[leg.id] === 'PERDIDA' 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              ❌ Perdida
                            </button>
                            <button
                              onClick={() => handleLegStatusChange(leg.id, 'PENDENTE')}
                              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                legStates[leg.id] === 'PENDENTE' 
                                  ? 'bg-yellow-600 text-white' 
                                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              }`}
                            >
                              ⚠️ Pendente
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informações */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 Status das Apostas</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Pendente:</strong> Aguardando resultado</p>
          <p>• <strong>Ganha:</strong> Leg venceu</p>
          <p>• <strong>Perdida:</strong> Leg perdeu</p>
          <p className="text-xs text-blue-600 mt-2">
            💡 Clique nos botões para atualizar o status das legs. O sistema calculará automaticamente os prêmios.
          </p>
        </div>
      </div>
    </div>
  )
}
