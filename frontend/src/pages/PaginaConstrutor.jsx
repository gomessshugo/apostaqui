import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Trash2, Calculator, Target, Settings, Brain, X, Search, Zap, TrendingUp, ArrowRight, CheckCircle, Shield, DollarSign } from 'lucide-react'
import { apostasService, iaService } from '../services/api'

export default function PaginaConstrutor() {
  const location = useLocation()
  const [jogosBase, setJogosBase] = useState([])
  const [jogoPivo, setJogoPivo] = useState('')
  const [jogoPivoNome, setJogoPivoNome] = useState('')
  const [variacoes, setVariacoes] = useState([])
  const [variacoesPivo, setVariacoesPivo] = useState([
    { id: 1, mercado: '', odd: '' } // Começa com uma variação
  ])
  const [valorPorAposta, setValorPorAposta] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Estados para análise com IA
  const [analiseIA, setAnaliseIA] = useState('')
  const [loadingIA, setLoadingIA] = useState(false)
  const [showAnalise, setShowAnalise] = useState(false)
  const [timeA, setTimeA] = useState('')
  const [timeB, setTimeB] = useState('')

  // Verifica se o usuário veio da PaginaMercados com uma cesta
  useEffect(() => {
    console.log('Construtor recebeu:', location.state?.jogosBase);
    if (location.state && location.state.jogosBase) {
      setJogosBase(location.state.jogosBase);
      
      // Limpa o state da localização para não poluir
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Dados de sugestões
  const timesSugeridos = [
    'Flamengo', 'Palmeiras', 'São Paulo', 'Santos', 'Corinthians', 'Grêmio', 'Internacional',
    'Atlético-MG', 'Botafogo', 'Vasco', 'Fluminense', 'Cruzeiro', 'Bahia', 'Fortaleza',
    'Athletico-PR', 'Ceará', 'Goiás', 'Cuiabá', 'América-MG', 'Juventude', 'Chapecoense',
    'Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'Chelsea', 'Arsenal',
    'Bayern Munich', 'PSG', 'Juventus', 'Inter Milan', 'AC Milan', 'Napoli'
  ]

  const mercadosSugeridos = [
    'Vitória', 'Empate', 'Derrota', 'Over 0.5', 'Over 1.5', 'Over 2.5', 'Over 3.5',
    'Under 0.5', 'Under 1.5', 'Under 2.5', 'Under 3.5', 'Ambas Marcam', 'Ambas Não Marcam',
    'Primeiro Tempo Over 0.5', 'Primeiro Tempo Under 0.5', 'Segundo Tempo Over 0.5',
    'Casa Vence', 'Visitante Vence', 'Empate', 'Gols +1.5', 'Gols +2.5'
  ]

  const oddsSugeridas = [
    '1.10', '1.15', '1.20', '1.25', '1.30', '1.35', '1.40', '1.45', '1.50', '1.55',
    '1.60', '1.65', '1.70', '1.75', '1.80', '1.85', '1.90', '1.95', '2.00', '2.10',
    '2.20', '2.30', '2.40', '2.50', '2.60', '2.70', '2.80', '2.90', '3.00', '3.20',
    '3.40', '3.60', '3.80', '4.00', '4.20', '4.50', '5.00', '5.50', '6.00', '7.00',
    '8.00', '9.00', '10.00', '12.00', '15.00', '20.00'
  ]

  // Funções de autocomplete
  const getSugestoesTimes = (valor) => {
    if (!valor) return timesSugeridos.slice(0, 10)
    return timesSugeridos.filter(time => 
      time.toLowerCase().includes(valor.toLowerCase())
    ).slice(0, 10)
  }

  const getSugestoesMercados = (valor) => {
    if (!valor) return mercadosSugeridos.slice(0, 8)
    return mercadosSugeridos.filter(mercado => 
      mercado.toLowerCase().includes(valor.toLowerCase())
    ).slice(0, 8)
  }

  const getSugestoesOdds = (valor) => {
    if (!valor) return oddsSugeridas.slice(0, 10)
    return oddsSugeridas.filter(odd => 
      odd.includes(valor)
    ).slice(0, 10)
  }

  // Componente de Input com Autocomplete
  const InputAutocomplete = ({ 
    value, 
    onChange, 
    placeholder, 
    sugestoes, 
    className = "input",
    icon: Icon = Search
  }) => {
    const [showSugestoes, setShowSugestoes] = useState(false)
    const [sugestoesFiltradas, setSugestoesFiltradas] = useState([])
    const inputRef = useRef(null)

    const handleInputChange = (e) => {
      const valor = e.target.value
      onChange(valor)
      
      if (valor.length > 0) {
        setSugestoesFiltradas(sugestoes.filter(item => 
          item.toLowerCase().includes(valor.toLowerCase())
        ).slice(0, 8))
        setShowSugestoes(true)
      } else {
        setShowSugestoes(false)
      }
    }

    const handleSugestaoClick = (sugestao) => {
      onChange(sugestao)
      setShowSugestoes(false)
    }

    const handleFocus = () => {
      if (value.length > 0) {
        setSugestoesFiltradas(sugestoes.filter(item => 
          item.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 8))
        setShowSugestoes(true)
      }
    }

    const handleBlur = () => {
      setTimeout(() => setShowSugestoes(false), 200)
    }

    return (
      <div className="relative">
        <div className="relative">
          {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`${className} ${Icon ? 'pl-10' : ''}`}
          />
        </div>
        
        {showSugestoes && sugestoesFiltradas.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {sugestoesFiltradas.map((sugestao, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSugestaoClick(sugestao)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              >
                {sugestao}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Função para mover um jogo da base para o pivô
  const handlePromoverParaPivo = (jogoParaPromover, index) => {
    // 1. Define o nome do Jogo Pivô
    setJogoPivoNome(jogoParaPromover.jogo_nome.split(' (')[0]); // Pega só o nome, sem data

    // 2. Remove o jogo da lista de Jogos Base
    setJogosBase(currentJogosBase => currentJogosBase.filter((_, i) => i !== index));
  };

  // Adicionar jogo base
  const adicionarJogoBase = () => {
    setJogosBase([...jogosBase, { jogo_nome: '', mercado: '', odd_leg: '' }])
  }

  // Remover jogo base
  const removerJogoBase = (index) => {
    setJogosBase(jogosBase.filter((_, i) => i !== index))
  }

  // Atualizar jogo base
  const atualizarJogoBase = (index, field, value) => {
    const novosJogos = [...jogosBase]
    novosJogos[index][field] = value
    setJogosBase(novosJogos)
  }

  // Adicionar variação
  const adicionarVariacao = () => {
    setVariacoes([...variacoes, { mercado: '', odd_leg: '' }])
  }

  // Remover variação
  const removerVariacao = (index) => {
    setVariacoes(variacoes.filter((_, i) => i !== index))
  }

  // Atualizar variação
  const atualizarVariacao = (index, field, value) => {
    const novasVariacoes = [...variacoes]
    novasVariacoes[index][field] = value
    setVariacoes(novasVariacoes)
  }

  // Funções para manipular as variações (COLE DENTRO DO COMPONENTE)
  const handleVariacaoChange = (id, campo, valor) => {
    setVariacoesPivo(current => 
      current.map(v => (v.id === id ? { ...v, [campo]: valor } : v))
    );
  };
  const adicionarVariacaoPivo = () => {
    setVariacoesPivo(current => [
      ...current, 
      { id: Date.now(), mercado: '', odd: '' } // ID único
    ]);
  };
  const removerVariacaoPivo = (id) => {
    setVariacoesPivo(current => current.filter(v => v.id !== id));
  };

  // Calcular odd total
  const calcularOddTotal = (jogosBase, oddVariacao) => {
    const oddBase = jogosBase.reduce((acc, jogo) => acc * parseFloat(jogo.odd_leg || 1), 1)
    return oddBase * parseFloat(oddVariacao || 1)
  }

  // Análise com IA
  const analisarComIA = async () => {
    try {
      setLoadingIA(true)
      setError('')
      
      if (!timeA.trim() || !timeB.trim()) {
        setError('Digite os nomes dos dois times')
        return
      }

      const response = await iaService.analisarConfronto(timeA.trim(), timeB.trim())
      setAnaliseIA(response.analise)
      setShowAnalise(true)
      
    } catch (error) {
      console.error('Erro na análise com IA:', error)
      setError('Erro ao analisar com IA')
    } finally {
      setLoadingIA(false)
    }
  }

  // Gerar sistema
  const gerarSistema = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      // Validações
      if (jogosBase.length === 0) {
        setError('Adicione pelo menos um jogo base')
        return
      }

      if (!jogoPivoNome.trim()) {
        setError('Defina o jogo pivô')
        return
      }

      if (variacoesPivo.length === 0) {
        setError('Adicione pelo menos uma variação')
        return
      }

      if (!valorPorAposta || parseFloat(valorPorAposta) <= 0) {
        setError('Defina um valor válido por aposta')
        return
      }

      // Validar jogos base
      for (let i = 0; i < jogosBase.length; i++) {
        const jogo = jogosBase[i]
        if (!jogo.jogo_nome.trim() || !jogo.mercado.trim() || !jogo.odd_leg || parseFloat(jogo.odd_leg) <= 1) {
          setError(`Jogo base ${i + 1} está incompleto ou com odd inválida`)
          return
        }
      }

      // Validar variações
      for (let i = 0; i < variacoesPivo.length; i++) {
        const variacao = variacoesPivo[i]
        if (!variacao.mercado.trim() || !variacao.odd || parseFloat(variacao.odd) <= 1) {
          setError(`Variação ${i + 1} está incompleta ou com odd inválida`)
          return
        }
      }

      // Gerar apostas
      const apostasCriadas = []
      
      for (let i = 0; i < variacoesPivo.length; i++) {
        const variacao = variacoesPivo[i]
        
        // Montar legs (jogos base + variação)
        const legs = [
          ...jogosBase.map(jogo => ({
            jogo_nome: jogo.jogo_nome,
            mercado: jogo.mercado,
            odd_leg: parseFloat(jogo.odd_leg)
          })),
          {
            jogo_nome: jogoPivoNome,
            mercado: variacao.mercado,
            odd_leg: parseFloat(variacao.odd)
          }
        ]

        // Calcular odd total
        const oddTotal = calcularOddTotal(jogosBase, variacao.odd)

        // Montar payload
        const payload = {
          valor_apostado: parseFloat(valorPorAposta),
          odd_total: oddTotal,
          nome_grupo: `Sistema ${jogoPivoNome}`,
          legs: legs
        }

        // Chamar API
        const response = await apostasService.criarAposta(payload)
        apostasCriadas.push({
          variacao: i + 1,
          aposta_id: response.aposta_id,
          odd_total: oddTotal,
          valor_apostado: parseFloat(valorPorAposta)
        })

        console.log(`✅ Aposta ${i + 1} criada:`, response.aposta_id)
      }

      setSuccess(`Sistema gerado com sucesso! ${apostasCriadas.length} apostas criadas.`)
      
      // Limpar formulário
      setJogosBase([])
      setJogoPivo('')
      setJogoPivoNome('')
      setVariacoes([])
      setVariacoesPivo([{ id: 1, mercado: '', odd: '' }])
      setValorPorAposta('')

    } catch (error) {
      console.error('Erro ao gerar sistema:', error)
      setError(error.response?.data?.error || 'Erro ao gerar sistema')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header V2 */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Target className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Construtor de Sistemas</h1>
            <p className="text-orange-100 text-lg">Crie suas múltiplas com proteção</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm">Sistema de cobertura inteligente</span>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Wizard de 3 Passos - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PASSO 1: Jogos Base Selecionados */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Passo 1: Jogos Base</h2>
                <p className="text-blue-100 text-sm">Jogos que estarão em todas as apostas</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {jogosBase.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Sua cesta está vazia</p>
                <p className="text-sm">Vá em 'Mercados' para adicionar palpites rápidos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jogosBase.map((jogo, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-gray-700">Palpite {index + 1}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePromoverParaPivo(jogo, index)}
                          className="text-blue-500 hover:text-blue-700 transition-colors p-1 hover:bg-blue-100 rounded-full"
                          title="Promover para Pivô"
                        >
                          <Target className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removerJogoBase(index)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-100 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Mercado</label>
                        <InputAutocomplete
                          value={jogo.mercado}
                          onChange={(value) => atualizarJogoBase(index, 'mercado', value)}
                          placeholder="Ex: Flamengo Vence"
                          sugestoes={mercadosSugeridos}
                          icon={TrendingUp}
                          className="input text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Jogo</label>
                        <InputAutocomplete
                          value={jogo.jogo_nome}
                          onChange={(value) => atualizarJogoBase(index, 'jogo_nome', value)}
                          placeholder="Ex: Flamengo vs Palmeiras"
                          sugestoes={timesSugeridos}
                          icon={Target}
                          className="input text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Odd Real</label>
                        <div className="flex items-center space-x-2">
                          <InputAutocomplete
                            value={jogo.odd_leg}
                            onChange={(value) => atualizarJogoBase(index, 'odd_leg', value)}
                            placeholder="Ex: 1.82"
                            sugestoes={oddsSugeridas}
                            icon={Calculator}
                            className="input text-sm flex-1"
                          />
                          <span className="text-sm text-gray-500">@ {jogo.odd_leg || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={adicionarJogoBase}
                className="btn btn-secondary w-full flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Jogo Base
              </button>
              <button
                onClick={() => {
                  setJogosBase([
                    { jogo_nome: 'Flamengo vs Palmeiras', mercado: 'Flamengo Vence', odd_leg: '1.80' },
                    { jogo_nome: 'São Paulo vs Santos', mercado: 'Over 2.5', odd_leg: '1.60' }
                  ])
                }}
                className="btn btn-outline w-full flex items-center justify-center"
              >
                <Zap className="h-4 w-4 mr-2" />
                Template Rápido
              </button>
            </div>
          </div>
        </div>

        {/* PASSO 2: Jogo Pivô (A Proteção) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Passo 2: Jogo Pivô</h2>
                <p className="text-orange-100 text-sm">A proteção do sistema</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Jogo Pivô
              </label>
              <input 
                value={jogoPivoNome} 
                onChange={(e) => setJogoPivoNome(e.target.value)}
                placeholder="Ex: Corinthians vs São Paulo"
                className="input w-full"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Variações</h3>
                <button
                  onClick={adicionarVariacaoPivo}
                  className="btn btn-secondary flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </button>
              </div>
              
              <div className="space-y-4 mt-4">
                {variacoesPivo.map((variacao, index) => (
                  <div key={variacao.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Mercado ${index + 1} (Ex: Casa Vence)`}
                      value={variacao.mercado}
                      onChange={(e) => handleVariacaoChange(variacao.id, 'mercado', e.target.value)}
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Odd"
                      value={variacao.odd}
                      onChange={(e) => handleVariacaoChange(variacao.id, 'odd', e.target.value)}
                      className="w-20 p-2 border rounded-lg"
                    />
                    <button onClick={() => removerVariacaoPivo(variacao.id)} className="text-red-500 p-2 hover:bg-red-100 rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={adicionarVariacaoPivo} 
                  className="w-full mt-2 p-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Adicionar Variação
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PASSO 3: Configurar e Gerar Sistema */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Passo 3: Gerar Sistema</h2>
                <p className="text-green-100 text-sm">Configure e gere suas apostas</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Valor por Aposta */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                Valor por Aposta
              </h3>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="R$ 10.00"
                    className="input w-full"
                    value={valorPorAposta}
                    onChange={(e) => setValorPorAposta(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Valor que será apostado em cada variação
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setValorPorAposta('5.00')}
                    className="btn btn-outline text-sm"
                  >
                    R$ 5
                  </button>
                  <button
                    onClick={() => setValorPorAposta('10.00')}
                    className="btn btn-outline text-sm"
                  >
                    R$ 10
                  </button>
                  <button
                    onClick={() => setValorPorAposta('25.00')}
                    className="btn btn-outline text-sm"
                  >
                    R$ 25
                  </button>
                  <button
                    onClick={() => setValorPorAposta('50.00')}
                    className="btn btn-outline text-sm"
                  >
                    R$ 50
                  </button>
                </div>
              </div>
            </div>

            {/* Resumo Dinâmico */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 text-blue-600 mr-2" />
                Resumo do Sistema
              </h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="space-y-2 text-sm">
                  <p><strong>Jogos Base:</strong> {jogosBase.length} selecionados</p>
                  <p><strong>Variações:</strong> {variacoesPivo.length} definidas</p>
                  <p><strong>Total de Múltiplas:</strong> {variacoesPivo.length}</p>
                  <p><strong>Custo Total:</strong> R$ {((parseFloat(valorPorAposta) || 0) * variacoesPivo.length).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Botão Gerar Sistema */}
            <div className="text-center">
              <button
                onClick={gerarSistema}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center mx-auto w-full"
              >
                <Calculator className="h-5 w-5 mr-2" />
                {loading ? 'Gerando Sistema...' : 'Gerar Apostas no Sistema'}
              </button>
              
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>💡 <strong>Dica:</strong> Use templates rápidos para começar</p>
                <p>📊 <strong>Cobertura:</strong> Garante lucro independente do resultado</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análise da IA */}
      {showAnalise && (
        <div className="bg-white rounded-2xl shadow-lg border border-purple-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Análise da IA</h3>
              </div>
              <button
                onClick={() => setShowAnalise(false)}
                className="text-white hover:text-purple-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border-purple-200">
              <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {analiseIA}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
