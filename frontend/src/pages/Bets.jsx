import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Target,
  Calendar,
  DollarSign
} from 'lucide-react'
import { betService } from '../services/betService'
import LoadingSpinner from '../components/LoadingSpinner'
import BetModal from '../components/BetModal'
import toast from 'react-hot-toast'

export default function Bets() {
  const [bets, setBets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBet, setEditingBet] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    loadBets()
    loadCategories()
  }, [pagination.page, filters])

  const loadBets = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }
      
      const response = await betService.getBets(params)
      setBets(response.bets)
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages
      }))
    } catch (error) {
      toast.error('Erro ao carregar apostas')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await betService.getCategories()
      setCategories(response.categories)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const handleCreateBet = () => {
    setEditingBet(null)
    setShowModal(true)
  }

  const handleEditBet = (bet) => {
    setEditingBet(bet)
    setShowModal(true)
  }

  const handleDeleteBet = async (betId) => {
    if (!confirm('Tem certeza que deseja deletar esta aposta?')) return

    try {
      await betService.deleteBet(betId)
      toast.success('Aposta deletada com sucesso!')
      loadBets()
    } catch (error) {
      toast.error('Erro ao deletar aposta')
    }
  }

  const handleUpdateBetResult = async (betId, status) => {
    try {
      await betService.updateBetResult(betId, { 
        status,
        resultDate: new Date().toISOString()
      })
      toast.success('Resultado da aposta atualizado!')
      loadBets()
    } catch (error) {
      toast.error('Erro ao atualizar resultado')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingBet(null)
  }

  const handleModalSave = () => {
    setShowModal(false)
    setEditingBet(null)
    loadBets()
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'badge-warning' },
      won: { label: 'Ganhou', className: 'badge-success' },
      lost: { label: 'Perdeu', className: 'badge-danger' },
      cancelled: { label: 'Cancelada', className: 'badge-info' }
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`badge ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || 'Sem categoria'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apostas</h1>
            <p className="text-gray-600 mt-1">
              Gerencie suas apostas esportivas
            </p>
          </div>
          <button
            onClick={handleCreateBet}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Aposta
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar apostas..."
                className="input pl-10"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="won">Ganhou</option>
              <option value="lost">Perdeu</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              className="input"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bets List */}
      <div className="card">
        {loading ? (
          <LoadingSpinner size="lg" className="py-12" />
        ) : bets.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma aposta encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status || filters.category
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando sua primeira aposta.'
              }
            </p>
            {!filters.search && !filters.status && !filters.category && (
              <div className="mt-6">
                <button
                  onClick={handleCreateBet}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Aposta
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bets.map((bet) => (
              <div key={bet.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{bet.title}</h3>
                      {getStatusBadge(bet.status)}
                    </div>
                    
                    {bet.description && (
                      <p className="text-sm text-gray-600 mb-2">{bet.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Valor:</span>
                        <p className="font-medium">{formatCurrency(bet.stakeAmount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Odds:</span>
                        <p className="font-medium">{bet.odds}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Retorno:</span>
                        <p className="font-medium">{formatCurrency(bet.potentialReturn)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Categoria:</span>
                        <p className="font-medium">{getCategoryName(bet.category?.id)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(bet.betDate)}
                      </span>
                      {bet.resultDate && (
                        <span className="flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          Resultado: {formatDate(bet.resultDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {bet.status === 'pending' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleUpdateBetResult(bet.id, 'won')}
                          className="btn btn-success text-xs px-2 py-1"
                        >
                          Ganhou
                        </button>
                        <button
                          onClick={() => handleUpdateBetResult(bet.id, 'lost')}
                          className="btn btn-danger text-xs px-2 py-1"
                        >
                          Perdeu
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleEditBet(bet)}
                      className="btn btn-secondary text-xs px-2 py-1"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteBet(bet.id)}
                      className="btn btn-danger text-xs px-2 py-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} apostas
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn btn-secondary text-sm px-3 py-1 disabled:opacity-50"
              >
                Anterior
              </button>
              
              <span className="flex items-center px-3 py-1 text-sm text-gray-700">
                Página {pagination.page} de {pagination.pages}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="btn btn-secondary text-sm px-3 py-1 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bet Modal */}
      {showModal && (
        <BetModal
          bet={editingBet}
          categories={categories}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  )
}
