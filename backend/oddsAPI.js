require('dotenv').config();
const axios = require('axios');
const { incrementarContadorAPI } = require('./utils');

// The Odds API - GRATUITA (500 requests/mês)
const THE_ODDS_API_KEY = process.env.THE_ODDS_API_KEY;
const THE_ODDS_BASE_URL = 'https://api.the-odds-api.com/v4';

// Mapeamento de ligas para The Odds API
const LIGAS_ODDS_API = {
  '4329': 'soccer_brazil_campeonato', // Brasileirão
  '4328': 'soccer_epl', // Premier League
  '4331': 'soccer_germany_bundesliga', // Bundesliga
  '4332': 'soccer_spain_la_liga', // La Liga
  '4334': 'soccer_italy_serie_a', // Serie A
  '4344': 'soccer_france_ligue_one', // Ligue 1
  '4346': 'soccer_portugal_primeira_liga', // Primeira Liga
  '4337': 'soccer_netherlands_eredivisie', // Eredivisie
  '4336': 'soccer_efl_championship', // Championship
  '4330': 'soccer_fifa_world_cup', // World Cup
  '4333': 'soccer_uefa_euro', // European Championship
  '4338': 'soccer_uefa_champions_league' // Champions League
};

/**
 * Busca odds reais de uma liga específica - SEMPRE REAIS
 * @param {string} ligaId - ID da liga
 * @returns {Promise<Object>} Dados dos jogos com odds reais
 */
async function buscarOddsReais(ligaId) {
  try {
    const sportKey = LIGAS_ODDS_API[ligaId];
    if (!sportKey) {
      throw new Error(`Liga ${ligaId} não suportada pela API de odds`);
    }

    console.log(`🎯 Buscando odds REAIS para ${sportKey}...`);
    
    // INCREMENTAR CONTADOR ANTES DA CHAMADA
    await incrementarContadorAPI('the_odds_api');
    
    const response = await axios.get(`${THE_ODDS_BASE_URL}/sports/${sportKey}/odds`, {
      params: {
        apiKey: THE_ODDS_API_KEY,
        regions: 'us', // ou 'eu', 'uk', 'au'
        markets: 'h2h,totals', // h2h=1x2, totals=over/under
        oddsFormat: 'decimal',
        dateFormat: 'iso'
      },
      timeout: 15000
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Nenhum jogo encontrado na API de odds');
    }

    console.log(`✅ Odds REAIS encontradas: ${response.data.length} jogos`);
    
    // Processar dados reais
    const jogos = response.data.map(game => {
      const h2hMarket = game.bookmakers[0]?.markets?.find(m => m.key === 'h2h');
      const totalsMarket = game.bookmakers[0]?.markets?.find(m => m.key === 'totals');
      
      return {
        idJogo: game.id,
        nome: `${game.home_team} vs ${game.away_team}`,
        data: new Date(game.commence_time).toLocaleDateString('pt-BR'),
        hora: new Date(game.commence_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        timeCasa: game.home_team,
        timeVisitante: game.away_team,
        odds: {
          h2h: h2hMarket?.outcomes || [],
          totals: totalsMarket?.outcomes || []
        },
        liga: sportKey,
        fonte: 'The Odds API (REAL)'
      };
    });

    return {
      jogos,
      fonte: 'The Odds API (REAL)',
      total: jogos.length
    };

  } catch (error) {
    console.error(`❌ Erro ao buscar odds REAIS para liga ${ligaId}:`, error.message);
    throw new Error(`Falha ao buscar odds reais: ${error.message}`);
  }
}

/**
 * Busca odds de uma liga inteira - SEMPRE REAIS (versão robusta)
 * @param {string} ligaId - ID da liga
 * @returns {Promise<Object>} Lista de jogos com odds reais da liga
 */
async function buscarOddsDaLiga(ligaId) {
  console.log(`\n🕵️‍♂️ [DEBUG oddsAPI] Iniciando buscarOddsDaLiga para Liga ID Numérico: ${ligaId}`); // LOG O1
  
  const sportKey = LIGAS_ODDS_API[ligaId];
  console.log(`🗺️ [DEBUG oddsAPI] Mapeado para Código Odds API: ${sportKey}`); // LOG O2
  
  if (!sportKey) {
    console.error(`🔴 [DEBUG oddsAPI] Código da liga para The Odds API não encontrado para ID ${ligaId}`); // LOG O3
    throw new Error('Código da liga inválido para The Odds API');
  }
  
  const apiKey = process.env.THE_ODDS_API_KEY;
  if (!apiKey || apiKey === 'your_odds_api_key_here') { // Verifica se a chave é válida
    console.error('🔴 [DEBUG oddsAPI] ERRO FATAL: Chave THE_ODDS_API_KEY inválida ou não configurada no .env!'); // LOG O4
    throw new Error('Chave da The Odds API inválida ou não configurada.');
  }
  console.log(`🔑 [DEBUG oddsAPI] Usando Chave Odds API: ...${apiKey.slice(-4)}`); // LOG O5
  
  try {
    await incrementarContadorAPI('the_odds_api'); // Conta a requisição
    console.log(`📡 [DEBUG oddsAPI] Chamando The Odds API para ${sportKey}...`); // LOG O6
    
    const response = await axios.get(`${THE_ODDS_BASE_URL}/sports/${sportKey}/odds`, {
      params: {
        apiKey: THE_ODDS_API_KEY,
        regions: 'us', // ou 'eu', 'uk', 'au'
        markets: 'h2h,totals', // h2h=1x2, totals=over/under
        oddsFormat: 'decimal',
        dateFormat: 'iso'
      },
      timeout: 15000
    });
    
    console.log(`✅ [DEBUG oddsAPI] ${response.data.length} jogos com odds recebidos.`); // LOG O7
    
    if (!response.data || response.data.length === 0) {
      throw new Error('Nenhum jogo encontrado na API de odds');
    }

    console.log(`✅ Odds REAIS da liga encontradas: ${response.data.length} jogos`);
    
    // Processar dados reais
    const jogos = response.data.map(game => {
      const h2hMarket = game.bookmakers[0]?.markets?.find(m => m.key === 'h2h');
      const totalsMarket = game.bookmakers[0]?.markets?.find(m => m.key === 'totals');
      
      return {
        idJogo: game.id,
        nome: `${game.home_team} vs ${game.away_team}`,
        data: new Date(game.commence_time).toLocaleDateString('pt-BR'),
        hora: new Date(game.commence_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        home_team: game.home_team,
        away_team: game.away_team,
        bookmakers: game.bookmakers, // ADICIONANDO BOOKMAKERS COMPLETOS PARA DEBUG
        odds: {
          h2h: h2hMarket?.outcomes || [],
          totals: totalsMarket?.outcomes || []
        },
        liga: sportKey,
        fonte: 'The Odds API (REAL)'
      };
    });

    return {
      jogos,
      fonte: 'The Odds API (REAL)',
      total: jogos.length
    };

  } catch (error) {
    console.error(`💥 [DEBUG oddsAPI] ERRO na chamada da The Odds API: ${error.message}`); // LOG O8
    if (error.response) {
      console.error('[DEBUG oddsAPI] Erro API - Status:', error.response.status);
      console.error('[DEBUG oddsAPI] Erro API - Data:', JSON.stringify(error.response.data)); // Log completo da resposta
    }
    // NÃO lançar erro aqui, retornar vazio para o /analise-ia tratar
    console.warn('[DEBUG oddsAPI] Retornando lista de odds vazia devido ao erro.'); // LOG O9
    return { jogos: [], total: 0 }; 
  }
}

/**
 * Busca odds de um jogo específico - SEMPRE REAIS
 * @param {string} jogoId - ID do jogo
 * @returns {Promise<Object>} Dados do jogo com odds reais
 */
async function buscarOddsJogo(jogoId) {
  try {
    console.log(`🎯 Buscando odds REAIS do jogo ${jogoId}...`);
    
    // INCREMENTAR CONTADOR ANTES DA CHAMADA
    await incrementarContadorAPI('the_odds_api');
    
    // A The Odds API não tem endpoint direto para jogo específico
    // Vamos buscar todas as ligas e filtrar pelo jogoId
    const ligas = Object.keys(LIGAS_ODDS_API);
    
    for (const ligaId of ligas) {
      try {
        const odds = await buscarOddsReais(ligaId);
        const jogoEncontrado = odds.jogos.find(j => j.idJogo === jogoId);
        
        if (jogoEncontrado) {
          return {
            jogo: jogoEncontrado,
            fonte: 'The Odds API (REAL)'
          };
        }
      } catch (error) {
        // Continuar para próxima liga
        continue;
      }
    }
    
    throw new Error(`Jogo ${jogoId} não encontrado em nenhuma liga`);
    
  } catch (error) {
    console.error(`❌ Erro ao buscar odds do jogo ${jogoId}:`, error.message);
    throw new Error(`Falha ao buscar odds do jogo: ${error.message}`);
  }
}

/**
 * Lista todas as ligas disponíveis na The Odds API - SEMPRE REAIS
 * @returns {Promise<Object>} Lista de ligas disponíveis
 */
async function listarLigasDisponiveis() {
  try {
    console.log('🎯 Listando ligas REAIS disponíveis...');
    
    // INCREMENTAR CONTADOR ANTES DA CHAMADA
    await incrementarContadorAPI('the_odds_api');
    
    const response = await axios.get(`${THE_ODDS_BASE_URL}/sports`, {
      params: {
        apiKey: THE_ODDS_API_KEY
      },
      timeout: 10000
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Nenhuma liga encontrada na API');
    }

    const ligas = response.data
      .filter(sport => sport.group === 'Soccer')
      .map(sport => ({
        key: sport.key,
        title: sport.title,
        active: sport.active
      }));

    console.log(`✅ Ligas REAIS encontradas: ${ligas.length}`);
    
    return {
      ligas,
      fonte: 'The Odds API (REAL)',
      total: ligas.length
    };

  } catch (error) {
    console.error('❌ Erro ao listar ligas REAIS:', error.message);
    throw new Error(`Falha ao listar ligas: ${error.message}`);
  }
}

module.exports = {
  buscarOddsReais,
  buscarOddsDaLiga,
  buscarOddsJogo,
  listarLigasDisponiveis
};