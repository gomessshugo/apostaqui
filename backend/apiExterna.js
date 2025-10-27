require('dotenv').config();
const axios = require('axios');

// Configuração das APIs
const THESPORTSDB_API_KEY = '40130170'; // Chave de teste pública do TheSportsDB
const THE_SPORTS_DB_BASE_URL = `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_API_KEY}`;

// API Football-Data.org (DADOS REAIS - GRATUITA)
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org/v4';

// Mapeamento de ligas para Football-Data.org
const LIGAS_FOOTBALL_DATA = {
  '4328': 2021, // Premier League (PL)
  '4331': 2002, // Bundesliga (BL1)
  '4332': 2014, // La Liga (PD)
  '4334': 2019, // Serie A (SA)
  '4344': 2015, // Ligue 1 (FL1)
  '4335': 2021, // Premier League (PL) - alternativa
  '4346': 2017, // Primeira Liga (PPL)
  '4337': 2003, // Eredivisie (DED)
  '4336': 2013, // Championship (ELC)
  '4329': 2013, // Campeonato Brasileiro Série A (BSA) - CORRIGIDO
  '4330': 2018, // FIFA World Cup (WC)
  '4333': 2018, // European Championship (EC)
  '4338': 2001  // UEFA Champions League (CL)
};

/**
 * Busca todas as ligas de futebol disponíveis
 * @returns {Promise<Array>} Lista de ligas
 */
async function buscarLigas() {
  try {
    console.log('🔍 Buscando ligas do TheSportsDB...');
    
    const response = await axios.get(`${THE_SPORTS_DB_BASE_URL}/all_leagues.php?s=Soccer`);
    
    if (response.data && response.data.leagues) {
      console.log(`✅ Encontradas ${response.data.leagues.length} ligas`);
      return response.data.leagues;
    } else {
      throw new Error('Resposta da API não contém dados de ligas');
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar ligas:', error.message);
    console.log('🔄 Usando ligas fixas como fallback...');
    
    // Fallback com ligas principais
    const ligasFixas = [
      { idLeague: '4329', strLeague: 'Campeonato Brasileiro Série A', strSport: 'Soccer' },
      { idLeague: '4328', strLeague: 'Premier League', strSport: 'Soccer' },
      { idLeague: '4331', strLeague: 'Bundesliga', strSport: 'Soccer' },
      { idLeague: '4332', strLeague: 'La Liga', strSport: 'Soccer' },
      { idLeague: '4334', strLeague: 'Serie A', strSport: 'Soccer' },
      { idLeague: '4344', strLeague: 'Ligue 1', strSport: 'Soccer' },
      { idLeague: '4346', strLeague: 'Primeira Liga', strSport: 'Soccer' },
      { idLeague: '4337', strLeague: 'Eredivisie', strSport: 'Soccer' },
      { idLeague: '4336', strLeague: 'Championship', strSport: 'Soccer' },
      { idLeague: '4330', strLeague: 'FIFA World Cup', strSport: 'Soccer' },
      { idLeague: '4333', strLeague: 'European Championship', strSport: 'Soccer' },
      { idLeague: '4338', strLeague: 'UEFA Champions League', strSport: 'Soccer' }
    ];
    
    console.log(`✅ Usando ${ligasFixas.length} ligas fixas como fallback`);
    return ligasFixas;
  }
}

/**
 * Busca os próximos jogos de uma liga específica
 * @param {string|number} idLiga - ID da liga
 * @returns {Promise<Array>} Lista de jogos
 */
/**
 * Busca jogos REAIS usando Football-Data.org
 */
async function buscarJogosReaisFootballData(competicaoId) {
  try {
    console.log(`🌐 Buscando dados REAIS do Football-Data.org (Competição: ${competicaoId})...`);
    
    const response = await axios.get(`${FOOTBALL_DATA_BASE_URL}/competitions/${competicaoId}/matches`, {
      headers: {
        'X-Auth-Token': FOOTBALL_DATA_API_KEY
      },
      timeout: 10000,
      params: {
        status: 'SCHEDULED', // Apenas jogos agendados
        limit: 10 // Máximo 10 jogos
      }
    });
    
    if (response.data && response.data.matches && response.data.matches.length > 0) {
      console.log(`✅ Dados REAIS encontrados: ${response.data.matches.length} jogos`);
      
      return response.data.matches.map(jogo => ({
        idJogo: jogo.id,
        nome: `${jogo.homeTeam.name} vs ${jogo.awayTeam.name}`,
        data: jogo.utcDate.split('T')[0], // YYYY-MM-DD
        hora: jogo.utcDate.split('T')[1].split('Z')[0], // HH:MM:SS
        liga: jogo.competition.name,
        temporada: `${jogo.season.startDate.split('-')[0]}/${jogo.season.endDate.split('-')[0]}`,
        status: jogo.status,
        timeCasa: jogo.homeTeam.name,
        timeVisitante: jogo.awayTeam.name,
        logoTimeCasa: jogo.homeTeam.crest,
        logoTimeVisitante: jogo.awayTeam.crest
      }));
    }
  } catch (error) {
    console.log('⚠️ Football-Data.org falhou:', error.response?.status, error.message);
    return null;
  }
}

async function buscarJogosDaLiga(idLiga) {
  try {
    console.log(`🔍 Buscando jogos da liga ${idLiga}...`);
    
    // PRIMEIRO: Tentar buscar dados REAIS do Football-Data.org
    const competicaoId = LIGAS_FOOTBALL_DATA[idLiga];
    if (competicaoId && FOOTBALL_DATA_API_KEY !== 'YOUR_API_KEY_HERE') {
      const jogosReais = await buscarJogosReaisFootballData(competicaoId);
      if (jogosReais && jogosReais.length > 0) {
        console.log(`🎉 DADOS REAIS OBTIDOS: ${jogosReais.length} jogos`);
        return jogosReais;
      }
    }
    
    // SEGUNDO: Tentar TheSportsDB como fallback
    try {
      console.log('🌐 Tentando TheSportsDB como fallback...');
      const response = await axios.get(`${THE_SPORTS_DB_BASE_URL}/eventsnextleague.php?id=${idLiga}`, {
        timeout: 5000
      });
      
      if (response.data && response.data.events && response.data.events.length > 0) {
        console.log(`✅ TheSportsDB encontrou: ${response.data.events.length} jogos`);
        
        const jogosFormatados = response.data.events.map(jogo => ({
          idJogo: jogo.idEvent,
          nome: `${jogo.strHomeTeam} vs ${jogo.strAwayTeam}`,
          data: jogo.dateEvent,
          hora: jogo.strTime,
          liga: jogo.strLeague,
          temporada: jogo.strSeason,
          status: jogo.strStatus || 'Agendado',
          timeCasa: jogo.strHomeTeam,
          timeVisitante: jogo.strAwayTeam,
          logoTimeCasa: jogo.strHomeTeamBadge,
          logoTimeVisitante: jogo.strAwayTeamBadge
        }));
        
        return jogosFormatados;
      }
    } catch (apiError) {
      console.log('⚠️ TheSportsDB falhou:', apiError.message);
    }
    
    // FALLBACK: Dados simulados (caso a API real falhe)
    console.log('🔄 Usando dados simulados como fallback...');
    
    // Função para gerar datas futuras realistas
    const gerarDataFutura = (dias) => {
      const hoje = new Date();
      const dataFutura = new Date(hoje.getTime() + (dias * 24 * 60 * 60 * 1000));
      return dataFutura.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    };

    // Mapeamento de ligas para dados simulados com datas atuais
    const ligasSimuladas = {
      '4328': { // Premier League
        nome: 'Premier League',
        jogos: [
          { timeCasa: 'Manchester City', timeVisitante: 'Liverpool', data: gerarDataFutura(1), hora: '16:30' },
          { timeCasa: 'Arsenal', timeVisitante: 'Chelsea', data: gerarDataFutura(1), hora: '19:00' },
          { timeCasa: 'Tottenham', timeVisitante: 'Newcastle', data: gerarDataFutura(2), hora: '17:30' },
          { timeCasa: 'Manchester United', timeVisitante: 'Brighton', data: gerarDataFutura(2), hora: '20:00' },
          { timeCasa: 'Aston Villa', timeVisitante: 'West Ham', data: gerarDataFutura(3), hora: '18:00' }
        ]
      },
      '4331': { // Bundesliga
        nome: 'Bundesliga',
        jogos: [
          { timeCasa: 'Bayern Munich', timeVisitante: 'Borussia Dortmund', data: gerarDataFutura(1), hora: '17:30' },
          { timeCasa: 'RB Leipzig', timeVisitante: 'Bayer Leverkusen', data: gerarDataFutura(1), hora: '19:30' },
          { timeCasa: 'Eintracht Frankfurt', timeVisitante: 'Wolfsburg', data: gerarDataFutura(2), hora: '18:00' },
          { timeCasa: 'Borussia Mönchengladbach', timeVisitante: 'Freiburg', data: gerarDataFutura(2), hora: '20:30' },
          { timeCasa: 'Union Berlin', timeVisitante: 'Stuttgart', data: gerarDataFutura(3), hora: '17:00' }
        ]
      },
      '4332': { // La Liga
        nome: 'La Liga',
        jogos: [
          { timeCasa: 'Real Madrid', timeVisitante: 'Barcelona', data: gerarDataFutura(1), hora: '21:00' },
          { timeCasa: 'Atletico Madrid', timeVisitante: 'Sevilla', data: gerarDataFutura(1), hora: '19:00' },
          { timeCasa: 'Valencia', timeVisitante: 'Real Sociedad', data: gerarDataFutura(2), hora: '20:00' },
          { timeCasa: 'Villarreal', timeVisitante: 'Athletic Bilbao', data: gerarDataFutura(2), hora: '18:30' },
          { timeCasa: 'Real Betis', timeVisitante: 'Celta Vigo', data: gerarDataFutura(3), hora: '19:30' }
        ]
      },
      '4334': { // Serie A
        nome: 'Serie A',
        jogos: [
          { timeCasa: 'Juventus', timeVisitante: 'Inter Milan', data: gerarDataFutura(1), hora: '20:45' },
          { timeCasa: 'AC Milan', timeVisitante: 'Napoli', data: gerarDataFutura(1), hora: '18:00' },
          { timeCasa: 'Roma', timeVisitante: 'Lazio', data: gerarDataFutura(2), hora: '20:30' },
          { timeCasa: 'Atalanta', timeVisitante: 'Fiorentina', data: gerarDataFutura(2), hora: '18:30' },
          { timeCasa: 'Bologna', timeVisitante: 'Torino', data: gerarDataFutura(3), hora: '19:00' }
        ]
      },
      '4344': { // Ligue 1
        nome: 'Ligue 1',
        jogos: [
          { timeCasa: 'PSG', timeVisitante: 'Marseille', data: gerarDataFutura(1), hora: '21:00' },
          { timeCasa: 'Lyon', timeVisitante: 'Monaco', data: gerarDataFutura(1), hora: '19:00' },
          { timeCasa: 'Lille', timeVisitante: 'Nice', data: gerarDataFutura(2), hora: '20:00' },
          { timeCasa: 'Rennes', timeVisitante: 'Lens', data: gerarDataFutura(2), hora: '18:30' },
          { timeCasa: 'Strasbourg', timeVisitante: 'Nantes', data: gerarDataFutura(3), hora: '19:30' }
        ]
      }
    };
    
    const ligaData = ligasSimuladas[idLiga];
    
    if (ligaData) {
      console.log(`✅ Encontrados ${ligaData.jogos.length} jogos da ${ligaData.nome}`);
      
      // Formatar os dados para o frontend
      const jogosFormatados = ligaData.jogos.map((jogo, index) => ({
        idJogo: `${idLiga}_${index + 1}`,
        nome: `${jogo.timeCasa} vs ${jogo.timeVisitante}`,
        data: jogo.data,
        hora: jogo.hora,
        liga: ligaData.nome,
        temporada: '2023-24',
        status: 'Agendado',
        timeCasa: jogo.timeCasa,
        timeVisitante: jogo.timeVisitante,
        logoTimeCasa: null,
        logoTimeVisitante: null
      }));
      
      return jogosFormatados;
    } else {
      console.log('ℹ️ Liga não encontrada nos dados simulados');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar jogos da liga:', error.message);
    throw new Error(`Erro ao buscar jogos da liga: ${error.message}`);
  }
}

/**
 * Busca informações detalhadas de um jogo específico
 * @param {string|number} idJogo - ID do jogo
 * @returns {Promise<Object>} Dados do jogo
 */
async function buscarDetalhesJogo(idJogo) {
  try {
    console.log(`🔍 Buscando detalhes do jogo ${idJogo}...`);
    
    const response = await axios.get(`${THE_SPORTS_DB_BASE_URL}/lookupevent.php?id=${idJogo}`);
    
    if (response.data && response.data.events && response.data.events[0]) {
      const jogo = response.data.events[0];
      console.log(`✅ Detalhes do jogo encontrados`);
      
      return {
        idJogo: jogo.idEvent,
        nome: `${jogo.strHomeTeam} vs ${jogo.strAwayTeam}`,
        data: jogo.dateEvent,
        hora: jogo.strTime,
        liga: jogo.strLeague,
        temporada: jogo.strSeason,
        status: jogo.strStatus || 'Agendado',
        timeCasa: jogo.strHomeTeam,
        timeVisitante: jogo.strAwayTeam,
        logoTimeCasa: jogo.strHomeTeamBadge,
        logoTimeVisitante: jogo.strAwayTeamBadge,
        estadio: jogo.strVenue,
        cidade: jogo.strCity,
        pais: jogo.strCountry,
        descricao: jogo.strDescriptionEN || jogo.strDescription,
        resultado: jogo.strResult || null,
        golsCasa: jogo.intHomeScore || null,
        golsVisitante: jogo.intAwayScore || null
      };
    } else {
      throw new Error('Jogo não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do jogo:', error.message);
    throw new Error(`Erro ao buscar detalhes do jogo: ${error.message}`);
  }
}

module.exports = {
  buscarLigas,
  buscarJogosDaLiga,
  buscarDetalhesJogo
};
