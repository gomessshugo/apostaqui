require('dotenv').config();
const axios = require('axios');

const THE_ODDS_API_KEY = process.env.THE_ODDS_API_KEY;

// Vamos usar o nome que a API de Odds usa (soccer_brazil_campeonato)
const LIGA_API_ODDS = 'soccer_brazil_campeonato';

// Nomes que VOCÊ viu na tela (do football-data)
const TIME_CASA_PROCURADO = 'CA Mineiro';
const TIME_VISITANTE_PROCURADO = 'Ceará SC';

async function testarBuscaDeOdds() {
  if (!THE_ODDS_API_KEY) {
    console.error('❌ ERRO FATAL: Chave THE_ODDS_API_KEY não encontrada no .env');
    return;
  }
  
  console.log(`🔑 Usando Chave: ...${THE_ODDS_API_KEY.slice(-4)}`);
  console.log(`📡 Buscando odds da liga: ${LIGA_API_ODDS}...`);

  try {
    // 1. FAZ A REQUISIÇÃO PARA A LIGA INTEIRA (Custa 1 crédito)
    const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${LIGA_API_ODDS}/odds`, {
      params: {
        apiKey: THE_ODDS_API_KEY,
        regions: 'us', // Região válida (US)
        markets: 'h2h,totals', // 1x2 (h2h) e Over/Under (totals)
        dateFormat: 'iso',
      }
    });

    console.log(`✅ Sucesso! ${response.data.length} jogos com odds encontrados.`);
    
    // 2. TENTA ACHAR O JOGO NA LISTA
    const jogoEncontrado = response.data.find(jogo => 
      jogo.home_team.includes('Mineiro') && jogo.away_team.includes('Ceará')
    );

    if (jogoEncontrado) {
      console.log('\n--- 🟢 JOGO ENCONTRADO! 🟢 ---');
      console.log(`Jogo: ${jogoEncontrado.home_team} vs ${jogoEncontrado.away_team}`);
      console.log(JSON.stringify(jogoEncontrado.bookmakers[0].markets, null, 2));
    } else {
      console.error(`\n--- ❌ ERRO DE LÓGICA ❌ ---`);
      console.error(`Jogo '${TIME_CASA_PROCURADO} vs ${TIME_VISITANTE_PROCURADO}' não foi encontrado na lista da API de Odds.`);
      console.log('\nListando jogos que a API retornou (verifique os nomes):');
      response.data.forEach(j => console.log(` - ${j.home_team} vs ${j.away_team}`));
    }
  } catch (error) {
    console.error('\n--- ❌ ERRO FATAL NA API DE ODDS ❌ ---');
    console.error('Status:', error.response?.status);
    console.error('Mensagem:', error.response?.data?.message);
  }
}

testarBuscaDeOdds();
