import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Target } from 'lucide-react'
import { betService } from '../services/betService'
import toast from 'react-hot-toast'

export default function BetModal({ bet, categories, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      title: bet?.title || '',
      description: bet?.description || '',
      stakeAmount: bet?.stakeAmount || '',
      odds: bet?.odds || '',
      categoryId: bet?.category?.id || '',
      notes: bet?.notes || ''
    }
  })

  const watchedOdds = watch('odds')
  const watchedStakeAmount = watch('stakeAmount')

  useEffect(() => {
    if (watchedOdds && watchedStakeAmount) {
      const potentialReturn = parseFloat(watchedStakeAmount) * parseFloat(watchedOdds)
      if (!isNaN(potentialReturn)) {
        document.getElementById('potentialReturn').textContent = 
          new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(potentialReturn)
      }
    }
  }, [watchedOdds, watchedStakeAmount])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      if (bet) {
        await betService.updateBet(bet.id, data)
        toast.success('Aposta atualizada com sucesso!')
      } else {
        await betService.createBet(data)
        toast.success('Aposta criada com sucesso!')
      }
      
      onSave()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar aposta')
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Target className="h-6 w-6 text-primary-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {bet ? 'Editar Aposta' : 'Nova Aposta'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    {...register('title', { 
                      required: 'Título é obrigatório',
                      minLength: {
                        value: 3,
                        message: 'Título deve ter pelo menos 3 caracteres'
                      }
                    })}
                    type="text"
                    className="input"
                    placeholder="Ex: Flamengo x Palmeiras"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="input"
                    placeholder="Descrição da aposta..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor da Aposta *
                    </label>
                    <input
                      {...register('stakeAmount', { 
                        required: 'Valor é obrigatório',
                        min: {
                          value: 0.01,
                          message: 'Valor deve ser maior que zero'
                        }
                      })}
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="input"
                      placeholder="100.00"
                    />
                    {errors.stakeAmount && (
                      <p className="mt-1 text-sm text-danger-600">{errors.stakeAmount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Odds *
                    </label>
                    <input
                      {...register('odds', { 
                        required: 'Odds são obrigatórias',
                        min: {
                          value: 1.01,
                          message: 'Odds devem ser maiores que 1'
                        }
                      })}
                      type="number"
                      step="0.01"
                      min="1.01"
                      className="input"
                      placeholder="2.50"
                    />
                    {errors.odds && (
                      <p className="mt-1 text-sm text-danger-600">{errors.odds.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    {...register('categoryId')}
                    className="input"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={2}
                    className="input"
                    placeholder="Observações adicionais..."
                  />
                </div>

                {watchedOdds && watchedStakeAmount && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Retorno Potencial:</span>
                      <span id="potentialReturn" className="text-lg font-semibold text-primary-600">
                        {formatCurrency(parseFloat(watchedStakeAmount || 0) * parseFloat(watchedOdds || 0))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full sm:w-auto sm:ml-3 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : (bet ? 'Atualizar' : 'Criar')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
