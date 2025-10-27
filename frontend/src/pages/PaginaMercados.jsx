import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Trophy, Search, Filter, ShoppingCart, Plus, Star, Zap, Target, TrendingUp, Sparkles, Brain, X, CheckCircle } from 'lucide-react';

// Objeto para "limpar" e traduzir as ligas que vêm da API
const ligasPermitidas = {
  '4329': 'Campeonato Brasileiro Série A', // BSA
  '4328': 'Premier League (Inglaterra)', // PL
  '4331': 'Bundesliga (Alemanha)', // BL1
  '4332': 'La Liga (Espanha)', // PD
  '4334': 'Serie A (Itália)', // SA
  '4344': 'Ligue 1 (França)', // FL1
  '4346': 'Primeira Liga (Portugal)', // PPL
  '4337': 'Eredivisie (Holanda)', // DED
  '4336': 'Championship (Inglaterra)', // ELC
  '4330': 'FIFA World Cup', // WC
  '4333': 'European Championship', // EC
  '4338': 'UEFA Champions League' // CL
};

function PaginaMercados() {
  const [ligas, setLigas] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [tabela, setTabela] = useState([]);
  const [ligaSelecionada, setLigaSelecionada] = useState('');
  const [cestaPalpites, setCestaPalpites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTabela, setLoadingTabela] = useState(false);
  const [loadingOdds, setLoadingOdds] = useState(false);
  const [analiseModal, setAnaliseModal] = useState({ aberto: false, dados: null, jogo: null });
  const [analisando, setAnalisando] = useState(false);
  const [filtroData, setFiltroData] = useState('todos'); // 'todos' significa mostrar tudo
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Função auxiliar para encontrar odds de um jogo

  // 1. Buscar as ligas (filtradas)
  useEffect(() => {
    const fetchLigas = async () => {
      try {
        console.log('🔍 Buscando ligas da API...');
        const res = await api.get('/ligas');
        
        console.log('✅ Ligas recebidas:', res.data.ligas?.length || 0);
        
        // Filtrar apenas as ligas permitidas
        const ligasFiltradas = res.data.ligas
          .filter(liga => ligasPermitidas[liga.idLeague])
          .map(liga => ({
            ...liga,
            strLeague: ligasPermitidas[liga.idLeague] // Usar o nome traduzido
          }));
        
        console.log('📋 Ligas filtradas:', ligasFiltradas.length);
        setLigas(ligasFiltradas);
      } catch (error) {
        console.error('❌ Erro ao buscar ligas:', error);
      }
    };

    fetchLigas();
  }, [token]);

  // 2. Buscar jogos e tabela da liga selecionada
  const handleLigaChange = async (e) => {
    const ligaId = e.target.value;
    setLigaSelecionada(ligaId);
    
    if (!ligaId) {
      setJogos([]);
      setTabela([]);
      return;
    }

    setLoading(true);
    setLoadingTabela(true);
    setLoadingOdds(true);
    
    try {
      console.log(`🔍 Buscando jogos da liga ${ligaId}...`);
      const resJogos = await api.get(`/jogos-da-liga/${ligaId}`);
      
      console.log('✅ Jogos recebidos:', resJogos.data.jogos?.length || 0);
      setJogos(resJogos.data.jogos || []);
      
      // Buscar tabela de classificação
      console.log(`🏆 Buscando tabela da liga ${ligaId}...`);
      try {
        const resTabela = await api.get(`/liga/${ligaId}/tabela`);
        
        console.log('✅ Tabela recebida:', resTabela.data.tabela?.length || 0);
        setTabela(resTabela.data.tabela || []);
      } catch (errorTabela) {
        console.warn('⚠️ Erro ao buscar tabela:', errorTabela.message);
        setTabela([]);
      }

      
    } catch (error) {
      console.error('❌ Erro ao buscar jogos:', error);
      setJogos([]);
      setTabela([]);
    } finally {
      setLoading(false);
      setLoadingTabela(false);
      setLoadingOdds(false);
    }
  };

  // 3. Analisar jogo com IA
  const analisarJogo = async (jogo) => {
    setAnalisando(true);
    try {
      console.log(`🤖 Analisando ${jogo.nome} com IA...`);
      
      const res = await api.post('/analise-ia', {
        timeA: jogo.timeCasa,
        timeB: jogo.timeVisitante,
        ligaId: ligaSelecionada
      });

      console.log('✅ Análise IA concluída');
      
      setAnaliseModal({
        aberto: true,
        dados: res.data,
        jogo: jogo
      });
    } catch (error) {
      console.error('❌ Erro na análise IA:', error);
      alert('Erro ao analisar jogo. Tente novamente.');
    } finally {
      setAnalisando(false);
    }
  };

  // 4. Adicionar palpite à cesta
  const adicionarPalpite = (jogo, mercado, oddRecebida) => {
    // Usa os nomes corretos do objeto 'jogo' vindo da API Football-Data
    const nomeJogo = jogo.nome || `${jogo.timeCasa || jogo.homeTeam?.name} vs ${jogo.timeVisitante || jogo.awayTeam?.name}`;
    
    console.log('🛒 [DEBUG Cesta] Tentando adicionar:', { jogo: nomeJogo, mercado, oddRecebida }); // Log 1: Tentativa

    // Validação mais robusta da Odd
    const oddNumerica = parseFloat(oddRecebida);
    if (isNaN(oddNumerica) || oddNumerica <= 1.0) { // Odds são sempre > 1.0
        console.error(`🔴 [DEBUG Cesta] IMPEDIDO: Odd inválida ou N/A ('${oddRecebida}').`);
        // Adicione um feedback visual para o usuário aqui se desejar (ex: toast notification)
        return; 
    }

    const novoPalpite = {
      idUnico: `${jogo.idJogo || jogo.id}-${mercado}`, // Usa ID do jogo da Football-Data
      jogo_nome: nomeJogo,
      mercado: mercado,
      odd_leg: oddNumerica, // Garante que é número
    };

    // Evita adicionar o mesmo palpite duas vezes
    if (cestaPalpites.find(p => p.idUnico === novoPalpite.idUnico)) {
        console.warn(`⚠️ [DEBUG Cesta] Palpite já existe na cesta: ${novoPalpite.jogo_nome} - ${mercado}`);
        // Adicione um feedback visual
        return;
    }

    // Usa função de callback para logar DEPOIS da atualização
    setCestaPalpites(cestaAnterior => { 
        const novaCesta = [...cestaAnterior, novoPalpite];
        console.log('✅ [DEBUG Cesta] Palpite adicionado! Nova cesta:', novaCesta); // Log 2: Sucesso
        return novaCesta;
    });
    // Adicione um feedback visual de sucesso (ex: toast)
  };

  // 5. Enviar cesta para o Construtor
  const enviarParaConstrutor = () => {
    navigate('/construtor', { state: { jogosBase: cestaPalpites } });
  };

  // 6. Fechar modal
  const fecharModal = () => {
    setAnaliseModal({ aberto: false, dados: null, jogo: null });
  };

  // 7. Função para agrupar jogos por data
  const agruparJogosPorData = (jogos) => {
    const agrupados = {};
    
    jogos.forEach(jogo => {
      const data = jogo.data; // Ex: "25/10/2025"
      if (!agrupados[data]) {
        agrupados[data] = [];
      }
      agrupados[data].push(jogo);
    });
    
    return agrupados;
  };

  // 8. Função para formatar data para exibição (CORRIGIDA)
  const formatarDataExibicao = (dataISO) => {
    // Recebe "YYYY-MM-DD"
    try {
      const [ano, mes, dia] = dataISO.split('-');
      const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `${dia} de ${meses[parseInt(mes) - 1]}, ${ano}`;
    } catch (e) {
      console.error("Erro ao formatar data:", dataISO, e);
      return dataISO; // Retorna a data original em caso de erro
    }
  };

  // 9. Monitorar mudanças na cesta de palpites
  useEffect(() => {
    console.log('Cesta atualizada:', cestaPalpites);
  }, [cestaPalpites]);

  // Hook para agrupar e ordenar os jogos (só roda quando 'jogos' muda)
  const { jogosAgrupados, datasOrdenadas } = useMemo(() => {
    if (!jogos || jogos.length === 0) {
      return { jogosAgrupados: {}, datasOrdenadas: [] };
    }
    const agrupados = agruparJogosPorData(jogos);
    const ordenadas = Object.keys(agrupados).sort(); // Ordena as datas (YYYY-MM-DD)
    return { jogosAgrupados: agrupados, datasOrdenadas: ordenadas };
  }, [jogos]);

  // Hook para FILTRAR as datas (só roda quando 'filtroData' ou 'datasOrdenadas' muda)
  const datasFiltradas = useMemo(() => {
    if (filtroData === 'todos') {
      return datasOrdenadas; // Retorna todas as datas ordenadas
    }
    // Retorna um array com APENAS a data que o usuário selecionou
    return datasOrdenadas.filter(data => data === filtroData); 
  }, [datasOrdenadas, filtroData]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Mercados Inteligentes
            </h1>
            <p className="text-gray-600">Análise IA + Odds Reais</p>
          </div>
        </div>
      </div>

      {/* Seletor de Liga */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-semibold">Selecione uma Liga</h2>
        </div>
        
        <select 
          onChange={handleLigaChange} 
          value={ligaSelecionada}
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        >
          <option value="">🏆 Escolha uma liga principal</option>
          {ligas.map((liga, index) => (
            <option key={liga.idLeague || `liga-${index}`} value={liga.idLeague}>{liga.strLeague}</option>
          ))}
        </select>

        {/* NOVO FILTRO DE DATA (aparece quando tem jogos) */}
        {jogos.length > 0 && (
          <div className="mt-4">
            <label htmlFor="filtro-data" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Data:
            </label>
            <select 
              id="filtro-data"
              onChange={(e) => setFiltroData(e.target.value)} 
              value={filtroData}
              className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
            >
              <option value="todos">🗓️ Todas as datas ({datasOrdenadas.length})</option>
              {datasOrdenadas.map(data => (
                <option key={data} value={data}>
                  {formatarDataExibicao(data)} ({jogosAgrupados[data].length} jogos)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da Esquerda (Maior) - Jogos e Tabela */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabela de Jogos */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loading && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Analisando jogos...</p>
              </div>
            )}
        
            {!loading && ligaSelecionada && jogos.length === 0 && (
              <div className="p-8 text-center bg-yellow-50">
                <div className="text-yellow-600 mb-2">⚠️</div>
                <p className="text-yellow-800 font-medium">Nenhum jogo encontrado</p>
                <p className="text-sm text-yellow-600">Tente selecionar outra liga</p>
              </div>
            )}
        
            {jogos.length > 0 && (
              <div className="overflow-x-auto">
                {datasFiltradas.map((data, dataIndex) => (
                  <div key={data} className={dataIndex > 0 ? 'mt-8' : ''}>
                  {/* Título da Data */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      {formatarDataExibicao(data)}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {jogosAgrupados[data].length} jogo{jogosAgrupados[data].length !== 1 ? 's' : ''} programado{jogosAgrupados[data].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {/* Tabela de Jogos da Data */}
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-700">Jogo</th>
                        <th className="py-4 px-6 text-center font-semibold text-gray-700">Odds 1x2</th>
                        <th className="py-4 px-6 text-center font-semibold text-gray-700">O/U 2.5</th>
                        <th className="py-4 px-6 text-center font-semibold text-gray-700">Ações Rápidas</th>
                        <th className="py-4 px-6 text-center font-semibold text-gray-700">Análise IA Completa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jogosAgrupados[data].map((jogo, index) => {
                        const oddsDoJogo = jogo.odds;
                        const [timeCasa, timeVisitante] = jogo.nome.split(' vs ').map(t => t.trim());
                        
                        return (
                          <tr key={jogo.idJogo} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div>
                                  <div className="font-semibold text-gray-900">{jogo.nome}</div>
                                  <div className="text-sm text-gray-500">{jogo.hora}</div>
                                </div>
                              </div>
                            </td>
                            
                            {/* Odds 1x2 */}
                            <td className="py-4 px-6 text-center">
                              {oddsDoJogo && oddsDoJogo.casa !== 'N/A' ? (
                                <div className="flex gap-2 justify-center">
                                  <span className="text-sm font-semibold text-blue-600">{oddsDoJogo.casa}</span>
                                  <span className="text-sm font-semibold text-yellow-600">{oddsDoJogo.empate}</span>
                                  <span className="text-sm font-semibold text-red-600">{oddsDoJogo.visitante}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">N/A</span>
                              )}
                            </td>
                            
                            {/* Odds O/U 2.5 */}
                            <td className="py-4 px-6 text-center">
                              {oddsDoJogo && oddsDoJogo.over25 !== 'N/A' ? (
                                <div className="flex gap-2 justify-center">
                                  <span className="text-sm font-semibold text-green-600">{oddsDoJogo.over25}</span>
                                  <span className="text-sm font-semibold text-orange-600">{oddsDoJogo.under25}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">N/A</span>
                              )}
                            </td>
                            
                            {/* Botões de Ação Rápida */}
                            <td className="py-4 px-6 text-center">
                              <div className="flex gap-1 justify-center">
                                {/* Botão Casa */}
                                <button
                                  onClick={() => adicionarPalpite(jogo, `${timeCasa} Vence`, oddsDoJogo?.casa)}
                                  disabled={!oddsDoJogo || oddsDoJogo.casa === 'N/A'}
                                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                  [1]
                                </button>
                                
                                {/* Botão Empate */}
                                <button
                                  onClick={() => adicionarPalpite(jogo, 'Empate', oddsDoJogo?.empate)}
                                  disabled={!oddsDoJogo || oddsDoJogo.empate === 'N/A'}
                                  className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                  [X]
                                </button>
                                
                                {/* Botão Visitante */}
                                <button
                                  onClick={() => adicionarPalpite(jogo, `${timeVisitante} Vence`, oddsDoJogo?.visitante)}
                                  disabled={!oddsDoJogo || oddsDoJogo.visitante === 'N/A'}
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                  [2]
                                </button>
                                
                                {/* Botão Over 2.5 */}
                                {oddsDoJogo && oddsDoJogo.over25 !== 'N/A' && (
                                  <button
                                    onClick={() => adicionarPalpite(jogo, 'Over 2.5', oddsDoJogo.over25)}
                                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                  >
                                    [O]
                                  </button>
                                )}
                                
                                {/* Botão Under 2.5 */}
                                {oddsDoJogo && oddsDoJogo.under25 !== 'N/A' && (
                                  <button
                                    onClick={() => adicionarPalpite(jogo, 'Under 2.5', oddsDoJogo.under25)}
                                    className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                                  >
                                    [U]
                                  </button>
                                )}
                              </div>
                            </td>
                            
                            {/* Botão Análise IA Completa */}
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => analisarJogo(jogo)}
                                disabled={analisando}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg text-sm"
                              >
                                {analisando ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Analisando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Brain className="w-4 h-4" />
                                    <span>🧠+</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
              </div>
            )}
          </div>

          {/* Tabela de Classificação */}
          {tabela.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">Tabela de Classificação</h2>
                    <p className="text-green-100 text-sm">Posição atual dos times</p>
                  </div>
                </div>
              </div>
          
              {loadingTabela ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando tabela...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Pos</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Time</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">Pts</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">J</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">V</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">E</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">D</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">SG</th>
                  </tr>
                </thead>
                <tbody>
                  {tabela.map((time, index) => (
                    <tr key={time.posicao} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-3 px-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          time.posicao <= 4 ? 'bg-green-500 text-white' :
                          time.posicao <= 6 ? 'bg-blue-500 text-white' :
                          time.posicao >= tabela.length - 3 ? 'bg-red-500 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {time.posicao}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{time.time}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-lg text-gray-900">{time.pontos}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">{time.jogos}</td>
                      <td className="py-3 px-4 text-center text-green-600 font-semibold">{time.vitorias}</td>
                      <td className="py-3 px-4 text-center text-yellow-600 font-semibold">{time.empates}</td>
                      <td className="py-3 px-4 text-center text-red-600 font-semibold">{time.derrotas}</td>
                      <td className={`py-3 px-4 text-center font-semibold ${time.saldoGols >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {time.saldoGols >= 0 ? '+' : ''}{time.saldoGols}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {tabela.length > 10 && (
                <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
                  Mostrando tabela completa ({tabela.length} times).
                </div>
              )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coluna da Direita (Menor) - Cesta de Palpites */}
        <div className="lg:col-span-1">
          <div className="sticky top-6"> {/* <-- Classe Mágica "Grudenta" */}
            {/* Log para verificar a condição de renderização da Cesta */}
            {console.log(`🧐 [DEBUG Render Cesta] cestaPalpites.length é: ${cestaPalpites.length}. Mostrando cesta? ${cestaPalpites.length > 0}`)}
            {cestaPalpites.length > 0 ? (
              // O código da Cesta de Palpites que você já tem
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in"> {/* Adicionado animação */}
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-6 h-6 text-green-500 animate-pulse" />
            <h2 className="text-xl font-semibold">Sua Cesta ({cestaPalpites.length})</h2>
          </div>

          <div className="space-y-2 mb-4">
            {cestaPalpites.map((palpite) => (
              <div key={palpite.idUnico} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"> {/* <-- KEY CORRIGIDA */}
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{palpite.mercado}</span> {/* <-- Propriedade correta */}
                  <span className="text-sm text-gray-500">({palpite.jogo_nome.split(' (')[0]})</span> {/* <-- Propriedade correta */}
                  <span className="text-sm font-semibold text-blue-600">@ {palpite.odd_leg}</span> {/* <-- Propriedade correta */}
                </div>
                <button 
                  onClick={() => setCestaPalpites(cestaPalpites.filter(p => p.idUnico !== palpite.idUnico))}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={enviarParaConstrutor}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            🚀 Usar {cestaPalpites.length} Palpites no Construtor
          </button>
        </div>
            ) : (
              // Card "placeholder" quando a cesta está vazia
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto text-gray-300" />
                <p className="font-semibold mt-2">Cesta de Palpites</p>
                <p className="text-sm mt-1">Sua cesta está vazia. Clique nos botões [1], [X], [2]... nos jogos para adicionar palpites.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Análise IA */}
      {analiseModal.aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6" />
                  <div>
                    <h3 className="text-xl font-bold">Análise IA Profissional</h3>
                    <p className="text-purple-100">{analiseModal.jogo?.nome}</p>
                  </div>
                </div>
                <button
                  onClick={fecharModal}
                  className="text-white hover:text-gray-200 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {/* Odds Reais */}
              {analiseModal.dados?.odds && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Odds Reais Encontradas
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-sm text-gray-600">Casa (1)</div>
                      <div className="font-bold text-lg text-blue-600">{analiseModal.dados.odds.casa}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-sm text-gray-600">Empate (X)</div>
                      <div className="font-bold text-lg text-gray-600">{analiseModal.dados.odds.empate}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-sm text-gray-600">Visitante (2)</div>
                      <div className="font-bold text-lg text-blue-600">{analiseModal.dados.odds.visitante}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-sm text-gray-600">Over 2.5</div>
                      <div className="font-bold text-lg text-green-600">{analiseModal.dados.odds.over25}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-sm text-gray-600">Under 2.5</div>
                      <div className="font-bold text-lg text-red-600">{analiseModal.dados.odds.under25}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dados da Tabela */}
              {analiseModal.dados?.tabela && (analiseModal.dados.tabela.timeA || analiseModal.dados.tabela.timeB) && (
                <div className="mb-6 p-4 bg-green-50 rounded-xl">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Posição na Tabela
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analiseModal.dados.tabela.timeA && (
                      <div className="p-3 bg-white rounded-lg">
                        <div className="font-semibold text-gray-900">{analiseModal.dados.tabela.timeA.time}</div>
                        <div className="text-sm text-gray-600">
                          {analiseModal.dados.tabela.timeA.posicao}º lugar • {analiseModal.dados.tabela.timeA.pontos} pontos
                        </div>
                        <div className="text-xs text-gray-500">
                          {analiseModal.dados.tabela.timeA.vitorias}V {analiseModal.dados.tabela.timeA.empates}E {analiseModal.dados.tabela.timeA.derrotas}D • 
                          Saldo: {analiseModal.dados.tabela.timeA.saldoGols >= 0 ? '+' : ''}{analiseModal.dados.tabela.timeA.saldoGols}
                        </div>
                      </div>
                    )}
                    {analiseModal.dados.tabela.timeB && (
                      <div className="p-3 bg-white rounded-lg">
                        <div className="font-semibold text-gray-900">{analiseModal.dados.tabela.timeB.time}</div>
                        <div className="text-sm text-gray-600">
                          {analiseModal.dados.tabela.timeB.posicao}º lugar • {analiseModal.dados.tabela.timeB.pontos} pontos
                        </div>
                        <div className="text-xs text-gray-500">
                          {analiseModal.dados.tabela.timeB.vitorias}V {analiseModal.dados.tabela.timeB.empates}E {analiseModal.dados.tabela.timeB.derrotas}D • 
                          Saldo: {analiseModal.dados.tabela.timeB.saldoGols >= 0 ? '+' : ''}{analiseModal.dados.tabela.timeB.saldoGols}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Goleadores */}
              {analiseModal.dados?.goleadores && analiseModal.dados.goleadores.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-xl">
                  <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Artilharia da Liga
                  </h4>
                  <div className="space-y-2">
                    {analiseModal.dados.goleadores.map((goleador, index) => (
                      <div key={`goleador-${goleador.nome}-${index}`} className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {goleador.posicao}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{goleador.jogador}</div>
                            <div className="text-sm text-gray-600">{goleador.time}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-yellow-600">{goleador.gols} gols</div>
                          {goleador.assistencias > 0 && (
                            <div className="text-xs text-gray-500">{goleador.assistencias} assistências</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Retrospecto H2H */}
              {analiseModal.dados?.h2h && (
                <div className="mb-6 p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Retrospecto H2H
                  </h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analiseModal.dados.h2h.vitoriasTimeA}</div>
                      <div className="text-sm text-gray-600">Vitórias {analiseModal.jogo?.timeCasa}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{analiseModal.dados.h2h.empates}</div>
                      <div className="text-sm text-gray-600">Empates</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analiseModal.dados.h2h.vitoriasTimeB}</div>
                      <div className="text-sm text-gray-600">Vitórias {analiseModal.jogo?.timeVisitante}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-semibold mb-2">Últimos Confrontos:</div>
                    {analiseModal.dados.h2h.ultimosConfrontos.map((confronto, index) => (
                      <div key={`confronto-${confronto.data}-${index}`} className="text-xs bg-white p-2 rounded mb-1">
                        {confronto.resultado} ({confronto.data})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Análise IA Completa */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Análise "Surreal" do Punter Pro
                </h4>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-l-4 border-purple-500">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                    {analiseModal.dados?.analise}
                  </div>
                </div>
              </div>

              {/* Nota sobre Botões Rápidos */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">💡 Dica</h4>
                </div>
                <p className="text-sm text-blue-800">
                  Use os botões rápidos [1], [X], [2], [O], [U] na tabela principal para adicionar palpites à sua cesta de forma mais rápida!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaginaMercados;