const axios = require('axios');
require('dotenv').config();

// Teste direto da nova lógica de busca de odds
async function testarNovaBuscaOdds() {
  try {
    console.log('🧪 Testando nova lógica de busca de odds...');
    
    const THE_ODDS_API_KEY = process.env.THE_ODDS_API_KEY;
    const THE_ODDS_BASE_URL = 'https://api.the-odds-api.com/v4';
    
    console.log('🎯 Buscando odds da liga soccer_brazil_campeonato...');
    
    const response = await axios.get(`${THE_ODDS_BASE_URL}/sports/soccer_brazil_campeonato/odds`, {
      params: {
        apiKey: THE_ODDS_API_KEY,
        regions: 'us',
        markets: 'h2h,totals',
        oddsFormat: 'decimal',
        dateFormat: 'iso'
      },
      timeout: 15000
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Nenhum jogo encontrado na API de odds');
    }

    console.log(`✅ Odds encontradas: ${response.data.length} jogos`);
    
    // Processar dados
    const jogos = response.data.map(game => {
      const h2hMarket = game.bookmakers[0]?.markets?.find(m => m.key === 'h2h');
      const totalsMarket = game.bookmakers[0]?.markets?.find(m => m.key === 'totals');
      
      return {
        idJogo: game.id,
        home_team: game.home_team,
        away_team: game.away_team,
        odds: {
          h2h: h2hMarket?.outcomes || [],
          totals: totalsMarket?.outcomes || []
        }
      };
    });

    console.log('🎯 Primeiros 3 jogos:');
    jogos.slice(0, 3).forEach((jogo, i) => {
      console.log(`${i+1}. ${jogo.home_team} vs ${jogo.away_team}`);
      console.log(`   Odds H2H: ${jogo.odds.h2h.map(o => `${o.name}: ${o.price}`).join(', ')}`);
    });

    // Testar busca por jogo específico
    console.log('\n🔍 Testando busca por jogo específico...');
    const timeA = 'Flamengo';
    const timeB = 'Palmeiras';
    
    const jogoEncontrado = jogos.find(jogo => {
      const homeTeam = jogo.home_team.toLowerCase();
      const awayTeam = jogo.away_team.toLowerCase();
      const timeA_lower = timeA.toLowerCase();
      const timeB_lower = timeB.toLowerCase();
      
      return (
        (homeTeam.includes(timeA_lower) && awayTeam.includes(timeB_lower)) ||
        (homeTeam.includes(timeB_lower) && awayTeam.includes(timeA_lower)) ||
        (homeTeam.includes(timeA_lower) || awayTeam.includes(timeA_lower)) ||
        (homeTeam.includes(timeB_lower) || awayTeam.includes(timeB_lower))
      );
    });

    if (jogoEncontrado) {
      console.log(`✅ Jogo encontrado: ${jogoEncontrado.home_team} vs ${jogoEncontrado.away_team}`);
      console.log(`🎯 Odds: ${jogoEncontrado.odds.h2h.map(o => `${o.name}: ${o.price}`).join(', ')}`);
    } else {
      console.log('⚠️ Jogo não encontrado');
      console.log('📋 Jogos disponíveis:');
      jogos.slice(0, 5).forEach((jogo, i) => {
        console.log(`   ${i+1}. ${jogo.home_team} vs ${jogo.away_team}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testarNovaBuscaOdds();
