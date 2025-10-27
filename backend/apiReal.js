const axios = require('axios');

/**
 * API alternativa para dados reais de futebol
 * Usa múltiplas fontes para garantir dados atualizados
 */

// API 1: Football-Data.org (mais confiável)
const FOOTBALL_DATA_API_KEY = 'YOUR_API_KEY_HERE'; // Precisa de registro gratuito
const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org/v4';

// API 2: RapidAPI (alternativa)
const RAPIDAPI_KEY = 'YOUR_RAPIDAPI_KEY_HERE'; // Precisa de registro
const RAPIDAPI_BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

/**
 * Busca jogos reais usando Football-Data.org
 */
async function buscarJogosReaisFootballData(competicaoId) {
  try {
    console.log('🌐 Buscando dados REAIS do Football-Data.org...');
    
    const response = await axios.get(`${FOOTBALL_DATA_BASE_URL}/competitions/${competicaoId}/matches`, {
      headers: {
        'X-Auth-Token': FOOTBALL_DATA_API_KEY
      },
      timeout: 10000
    });
    
    if (response.data && response.data.matches) {
      console.log(`✅ Dados REAIS encontrados: ${response.data.matches.length} jogos`);
      
      return response.data.matches.map(jogo => ({
        idJogo: jogo.id,
        nome: `${jogo.homeTeam.name} vs ${jogo.awayTeam.name}`,
        data: jogo.utcDate.split('T')[0], // YYYY-MM-DD
        hora: jogo.utcDate.split('T')[1].split('Z')[0], // HH:MM:SS
        liga: jogo.competition.name,
        temporada: jogo.season.startDate + '/' + jogo.season.endDate,
        status: jogo.status,
        timeCasa: jogo.homeTeam.name,
        timeVisitante: jogo.awayTeam.name,
        logoTimeCasa: jogo.homeTeam.crest,
        logoTimeVisitante: jogo.awayTeam.crest
      }));
    }
  } catch (error) {
    console.log('⚠️ Football-Data.org falhou:', error.message);
    return null;
  }
}

/**
 * Busca jogos reais usando RapidAPI
 */
async function buscarJogosReaisRapidAPI(ligaId) {
  try {
    console.log('🌐 Buscando dados REAIS do RapidAPI...');
    
    const response = await axios.get(`${RAPIDAPI_BASE_URL}/fixtures`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      params: {
        league: ligaId,
        season: new Date().getFullYear(),
        next: 10 // próximos 10 jogos
      },
      timeout: 10000
    });
    
    if (response.data && response.data.response) {
      console.log(`✅ Dados REAIS encontrados: ${response.data.response.length} jogos`);
      
      return response.data.response.map(jogo => ({
        idJogo: jogo.fixture.id,
        nome: `${jogo.teams.home.name} vs ${jogo.teams.away.name}`,
        data: jogo.fixture.date.split('T')[0], // YYYY-MM-DD
        hora: jogo.fixture.date.split('T')[1].split('+')[0], // HH:MM:SS
        liga: jogo.league.name,
        temporada: jogo.league.season,
        status: jogo.fixture.status.short,
        timeCasa: jogo.teams.home.name,
        timeVisitante: jogo.teams.away.name,
        logoTimeCasa: jogo.teams.home.logo,
        logoTimeVisitante: jogo.teams.away.logo
      }));
    }
  } catch (error) {
    console.log('⚠️ RapidAPI falhou:', error.message);
    return null;
  }
}

/**
 * Função principal que tenta múltiplas APIs
 */
async function buscarJogosReais(ligaId) {
  console.log(`🔍 Buscando jogos REAIS para liga ${ligaId}...`);
  
  // Mapeamento de IDs das ligas
  const mapeamentoLigas = {
    '4328': { // Premier League
      footballData: 2021,
      rapidAPI: 39
    },
    '4331': { // Bundesliga
      footballData: 2002,
      rapidAPI: 78
    },
    '4332': { // La Liga
      footballData: 2014,
      rapidAPI: 140
    },
    '4334': { // Serie A
      footballData: 2019,
      rapidAPI: 135
    }
  };
  
  const liga = mapeamentoLigas[ligaId];
  if (!liga) {
    console.log('❌ Liga não mapeada para APIs reais');
    return null;
  }
  
  // Tentar Football-Data.org primeiro
  let jogos = await buscarJogosReaisFootballData(liga.footballData);
  if (jogos && jogos.length > 0) {
    return jogos;
  }
  
  // Tentar RapidAPI como fallback
  jogos = await buscarJogosReaisRapidAPI(liga.rapidAPI);
  if (jogos && jogos.length > 0) {
    return jogos;
  }
  
  console.log('❌ Todas as APIs reais falharam');
  return null;
}

module.exports = {
  buscarJogosReais
};
