import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Plus,
  Eye,
  Crown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'
import { betService } from '../services/betService'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentBets, setRecentBets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsResponse, betsResponse] = await Promise.all([
          authService.getUserStats(),
          betService.getBets({ limit: 5 })
        ])

        setStats(statsResponse.stats)
        setRecentBets(betsResponse.bets)
      } catch (error) {
        toast.error('Erro ao carregar dados do dashboard')
        console.error('Erro:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" className="py-12" />
      </div>
    )
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.fullName || user?.username}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Bem-vindo ao seu painel de apostas
        </p>
        {user?.isPremium && (
          <div className="mt-2 flex items-center text-yellow-600">
            <Crown className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Conta Premium</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
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
                {stats?.winRate?.toFixed(1) || 0}%
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <Link
              to="/bets"
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Aposta
            </Link>
            <Link
              to="/bets"
              className="btn btn-secondary w-full flex items-center justify-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Todas as Apostas
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo das Apostas</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Apostas Ganhas:</span>
              <span className="text-sm font-medium text-success-600">
                {stats?.wonBets || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Apostas Perdidas:</span>
              <span className="text-sm font-medium text-danger-600">
                {stats?.lostBets || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Ganho:</span>
              <span className="text-sm font-medium text-success-600">
                {formatCurrency(stats?.totalWon || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Perdido:</span>
              <span className="text-sm font-medium text-danger-600">
                {formatCurrency(stats?.totalLost || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bets */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Apostas Recentes</h3>
          <Link
            to="/bets"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Ver todas
          </Link>
        </div>

        {recentBets.length === 0 ? (
          <div className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma aposta</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando sua primeira aposta.
            </p>
            <div className="mt-6">
              <Link
                to="/bets"
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Aposta
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentBets.map((bet) => (
              <div key={bet.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{bet.title}</h4>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(bet.stakeAmount)} • Odds: {bet.odds}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(bet.status)}
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(bet.potentialReturn)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
