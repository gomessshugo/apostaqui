import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Crown,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      birthDate: user?.birthDate || ''
    }
  })

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm()

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await authService.updateProfile(data)
      updateUser(data)
      toast.success('Perfil atualizado com sucesso!')
      setEditing(false)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (data) => {
    try {
      setLoading(true)
      await authService.changePassword(data.currentPassword, data.newPassword)
      toast.success('Senha alterada com sucesso!')
      resetPassword()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradePremium = async () => {
    try {
      setLoading(true)
      await authService.upgradeToPremium()
      updateUser({ isPremium: true })
      toast.success('Upgrade para premium realizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao fazer upgrade para premium')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Digite sua senha para confirmar a exclusão')
      return
    }

    try {
      setDeleting(true)
      await authService.deleteAccount(deletePassword)
      toast.success('Conta deletada com sucesso!')
      // O logout será feito automaticamente pelo contexto
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao deletar conta')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
      setDeletePassword('')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Informações Pessoais</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn btn-secondary flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditing(false)
                    reset()
                  }}
                  className="btn btn-secondary flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="btn btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  {...register('fullName', { 
                    required: 'Nome completo é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Nome deve ter pelo menos 2 caracteres'
                    }
                  })}
                  type="text"
                  className="input"
                  placeholder="Seu nome completo"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="input"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  {...register('birthDate')}
                  type="date"
                  className="input"
                />
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Nome Completo</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.phone || 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Data de Nascimento</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(user?.birthDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Crown className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Tipo de Conta</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.isPremium ? 'Premium' : 'Gratuita'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="space-y-6">
          {/* Change Password */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h3>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    {...registerPassword('currentPassword', { 
                      required: 'Senha atual é obrigatória'
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Sua senha atual"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  {...registerPassword('newPassword', { 
                    required: 'Nova senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Nova senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                  type="password"
                  className="input"
                  placeholder="Sua nova senha"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </form>
          </div>

          {/* Premium Upgrade */}
          {!user?.isPremium && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade para Premium</h3>
              <p className="text-sm text-gray-600 mb-4">
                Desbloqueie recursos avançados com uma conta premium.
              </p>
              <button
                onClick={handleUpgradePremium}
                disabled={loading}
                className="btn btn-warning w-full flex items-center justify-center disabled:opacity-50"
              >
                <Crown className="h-4 w-4 mr-2" />
                {loading ? 'Processando...' : 'Fazer Upgrade'}
              </button>
            </div>
          )}

          {/* Delete Account */}
          <div className="card border-danger-200">
            <h3 className="text-lg font-semibold text-danger-600 mb-4">Zona de Perigo</h3>
            <p className="text-sm text-gray-600 mb-4">
              Excluir sua conta é uma ação irreversível. Todos os seus dados serão perdidos.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger w-full flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Conta
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-danger-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Excluir Conta
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Esta ação não pode ser desfeita. Todos os seus dados, incluindo apostas e estatísticas, serão permanentemente excluídos.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Digite sua senha para confirmar
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="input"
                    placeholder="Sua senha"
                  />
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || !deletePassword}
                  className="btn btn-danger w-full sm:w-auto sm:ml-3 disabled:opacity-50"
                >
                  {deleting ? 'Excluindo...' : 'Excluir Conta'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletePassword('')
                  }}
                  className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
