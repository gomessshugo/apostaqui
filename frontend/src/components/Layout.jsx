import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import api from '../services/api'
import { 
  Home, 
  DollarSign, 
  Target,
  Settings,
  Trophy,
  LogOut,
  Zap,
  TrendingUp,
  Sparkles,
  Activity,
  AlertTriangle
} from 'lucide-react'

export default function Layout({ children, onLogout }) {
  const location = useLocation()
  const [apiCounter, setApiCounter] = useState({ uso: 0, limite: 500, restante: 500, percentual: 0 })
  const [loading, setLoading] = useState(true)

  // Buscar contador de API
  const fetchApiCounter = async () => {
    try {
      const response = await api.get('/api/contador')
      setApiCounter(response.data)
    } catch (error) {
      console.error('Erro ao buscar contador de API:', error)
    } finally {
      setLoading(false)
    }
  }

  // Buscar contador a cada minuto e ao carregar
  useEffect(() => {
    fetchApiCounter()
    const interval = setInterval(fetchApiCounter, 60000) // 1 minuto
    return () => clearInterval(interval)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'blue', desc: 'Visão geral' },
    { name: 'Banca', href: '/banca', icon: DollarSign, color: 'green', desc: 'Gestão financeira' },
    { name: 'Mercados', href: '/mercados', icon: Trophy, color: 'purple', desc: 'Jogos do dia' },
    { name: 'Construtor', href: '/construtor', icon: Settings, color: 'orange', desc: 'Sistemas' },
  ]

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700',
      green: isActive 
        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25' 
        : 'text-green-600 hover:bg-green-50 hover:text-green-700',
      purple: isActive 
        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25' 
        : 'text-purple-600 hover:bg-purple-50 hover:text-purple-700',
      orange: isActive 
        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
        : 'text-orange-600 hover:bg-orange-50 hover:text-orange-700',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 flex flex-col">
        {/* Header */}
        <div className="flex h-24 items-center justify-center border-b border-gray-200/50 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sistema de Apostas</h1>
              <p className="text-sm text-blue-100 flex items-center">
                <Sparkles className="h-4 w-4 mr-1" />
                Gestão Inteligente
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation - Flex grow para empurrar conteúdo para baixo */}
        <nav className="mt-8 px-6 flex-grow">
          <ul className="space-y-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`group flex items-center px-4 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 ${getColorClasses(item.color, isActive)}`}
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    <div className="flex-1">
                      <div className="font-bold">{item.name}</div>
                      <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {item.desc}
                      </div>
                    </div>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Stats Card */}
          <div className="mt-8 p-5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold">Sistema Ativo</p>
                <p className="text-xs opacity-90">Dados em tempo real</p>
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Conectado</span>
            </div>
          </div>
        </nav>

        {/* Footer - Contador API e Botão Sair */}
        <div className="mt-auto p-6 space-y-4">
          {/* API Counter Card */}
          <div className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${
            apiCounter.percentual > 80 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : apiCounter.percentual > 60 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
          } text-white`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                {apiCounter.percentual > 80 ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Activity className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Uso da API (Odds)</p>
                {loading ? (
                  <p className="text-xs opacity-90">Carregando...</p>
                ) : (
                  <p className="text-xs opacity-90">
                    {apiCounter.uso} / {apiCounter.limite} reqs ({apiCounter.percentual}%)
                  </p>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            {!loading && (
              <div className="mt-3">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      apiCounter.percentual > 80 
                        ? 'bg-red-300' 
                        : apiCounter.percentual > 60 
                        ? 'bg-yellow-300' 
                        : 'bg-blue-300'
                    }`}
                    style={{ width: `${Math.min(apiCounter.percentual, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <span>Restante: {apiCounter.restante}</span>
                  {apiCounter.percentual > 80 && (
                    <span className="text-red-200 font-semibold">⚠️ Considere upgrade</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 hover:scale-105 border border-red-200 hover:border-red-300"
          >
            <LogOut className="mr-4 h-5 w-5" />
            <span className="font-semibold">Sair do Sistema</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-80">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}