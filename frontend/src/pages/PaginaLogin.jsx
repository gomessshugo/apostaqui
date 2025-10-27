import { useState } from 'react'
import { Target, Eye, EyeOff, Zap, Sparkles, Shield, TrendingUp, BarChart3 } from 'lucide-react'
import { authService } from '../services/api'

export default function PaginaLogin({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let response
      if (isLogin) {
        response = await authService.login(formData.email, formData.senha)
      } else {
        response = await authService.register(formData.email, formData.senha)
      }

      onLogin(response.token)
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 lg:h-20 lg:w-20 flex items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl">
            <Zap className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
          </div>
          <h2 className="mt-4 lg:mt-6 text-center text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h2>
          <p className="mt-2 text-center text-gray-600 flex items-center justify-center text-sm lg:text-base">
            <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-blue-500" />
            {isLogin ? 'Entre no sistema de apostas' : 'Comece sua jornada'}
          </p>
          <p className="mt-3 lg:mt-4 text-center text-xs lg:text-sm text-gray-600">
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              {isLogin ? 'Crie uma nova conta' : 'Faça login'}
            </button>
          </p>
        </div>
        
        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-200/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    name="senha"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Sua senha"
                    value={formData.senha}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 mr-3" />
                    {isLogin ? 'Entrar' : 'Criar Conta'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
            <BarChart3 className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">Analytics</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
            <Target className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">Precisão</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
            <Shield className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">Segurança</p>
          </div>
        </div>
      </div>
    </div>
  )
}
