import { useState, useEffect } from 'react'
import { DollarSign, Save, RefreshCw, TrendingUp, Wallet, Target, Sparkles, Zap, BarChart3 } from 'lucide-react'
import { bancaService } from '../services/api'

export default function PaginaBanca() {
  const [saldo, setSaldo] = useState(0)
  const [novoSaldo, setNovoSaldo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadSaldo()
  }, [])

  const loadSaldo = async () => {
    try {
      setLoading(true)
      const response = await bancaService.getSaldo()
      setSaldo(response.saldo_atual)
    } catch (error) {
      setError('Erro ao carregar saldo')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSaldo = async (e) => {
    e.preventDefault()
    
    if (!novoSaldo || novoSaldo < 0) {
      setError('Digite um valor válido')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      await bancaService.updateSaldo(parseFloat(novoSaldo))
      setSaldo(parseFloat(novoSaldo))
      setNovoSaldo('')
      setSuccess('Saldo atualizado com sucesso!')
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao atualizar saldo')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
          <Wallet className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Gestão de Banca
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-green-500" />
            Controle total do seu capital
          </p>
        </div>
      </div>

      {/* Saldo Atual */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <DollarSign className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Saldo Atual</h2>
              <p className="text-gray-600 flex items-center mt-1">
                <Target className="h-4 w-4 mr-2 text-green-500" />
                Capital disponível para apostas
              </p>
            </div>
          </div>
          <div className="text-right">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-12 w-48 bg-gray-200 rounded-2xl"></div>
              </div>
            ) : (
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatCurrency(saldo)}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={loadSaldo}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 mr-3 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-semibold text-gray-700">Atualizar Saldo</span>
          </button>
        </div>
      </div>

      {/* Atualizar Saldo */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atualizar Saldo</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleUpdateSaldo} className="space-y-4">
          <div>
            <label htmlFor="novoSaldo" className="block text-sm font-medium text-gray-700 mb-1">
              Novo Saldo
            </label>
            <input
              id="novoSaldo"
              type="number"
              step="0.01"
              min="0"
              className="input"
              placeholder="0.00"
              value={novoSaldo}
              onChange={(e) => setNovoSaldo(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Digite o novo valor para sua banca
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || !novoSaldo}
            className="btn btn-primary flex items-center disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Atualizar Saldo'}
          </button>
        </form>
      </div>

      {/* Informações */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Dicas</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• O saldo é usado automaticamente quando você faz apostas</li>
          <li>• Você não pode apostar mais do que tem disponível</li>
          <li>• O saldo é atualizado em tempo real</li>
        </ul>
      </div>
    </div>
  )
}
