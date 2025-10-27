import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react'
import { authService } from '../services/authService'
import { betService } from '../services/betService'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('all')

  useEffect(() => {
    loadStats()
  }, [timeRange])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [statsResponse, betsResponse] = await Promise.all([
        authService.getUserStats(),
        betService.getBets({ limit: 100 })
      ])

      setStats(statsResponse.stats)
      setBets(betsResponse.bets)
    } catch (error) {
      toast.error('Erro ao carregar estatísticas')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  const getStatusColor = (status) => {
    const colors = {
      won: 'text-success-600',
      lost: 'text-danger-600',
      pending: 'text-warning-600',
      cancelled: 'text-gray-600'
    }
    return colors[status] || 'text-gray-600'
  }

  const getStatusLabel = (status) => {
    const labels = {
      won: 'Ganhou',
      lost: 'Perdeu',
      pending: 'Pendente',
      cancelled: 'Cancelada'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" className="py-12" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Estatísticas</h1>
        <p className="text-gray-600 mt-1">
          Análise detalhada do seu desempenho nas apostas
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {[
            { value: 'all', label: 'Todas' },
            { value: '30', label: '30 dias' },
            { value: '90', label: '90 dias' },
            { value: '365', label: '1 ano' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Apostas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalBets || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Taxa de Acerto</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPercentage(stats?.winRate || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Apostado</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats?.totalStaked || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lucro/Prejuízo</p>
              <p className={`text-2xl font-semibold ${
                (stats?.profitLoss || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(stats?.profitLoss || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Ganho:</span>
              <span className="text-sm font-medium text-success-600">
                {formatCurrency(stats?.totalWon || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Perdido:</span>
              <span className="text-sm font-medium text-danger-600">
                {formatCurrency(stats?.totalLost || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Apostas Ganhas:</span>
              <span className="text-sm font-medium text-success-600">
                {stats?.wonBets || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Apostas Perdidas:</span>
              <span className="text-sm font-medium text-danger-600">
                {stats?.lostBets || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Taxa de Acerto</span>
                <span className="text-sm font-medium">
                  {formatPercentage(stats?.winRate || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-success-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stats?.winRate || 0, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">ROI (Return on Investment)</span>
                <span className={`text-sm font-medium ${
                  (stats?.profitLoss || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {stats?.totalStaked > 0 
                    ? formatPercentage(((stats?.profitLoss || 0) / stats.totalStaked) * 100)
                    : '0%'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (stats?.profitLoss || 0) >= 0 ? 'bg-success-600' : 'bg-danger-600'
                  }`}
                  style={{ 
                    width: `${Math.min(Math.abs((stats?.profitLoss || 0) / (stats?.totalStaked || 1)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bets Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Apostas Recentes</h3>
        
        {bets.length === 0 ? (
          <div className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma aposta</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando suas primeiras apostas para ver as estatísticas.
            </p>
          </div>
        ) : (
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
                    Odds
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retorno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bets.slice(0, 10).map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bet.title}</div>
                      {bet.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {bet.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(bet.stakeAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bet.odds}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(bet.potentialReturn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getStatusColor(bet.status)}`}>
                        {getStatusLabel(bet.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bet.betDate).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
