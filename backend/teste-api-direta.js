const axios = require('axios');

async function testarApiDireta() {
  try {
    console.log('🔍 Testando API TheSportsDB diretamente...');
    
    const THESPORTSDB_API_KEY = '40130170';
    const BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
    
    // Testar diferentes ligas diretamente
    const ligasParaTestar = [
      { id: '4328', nome: 'Premier League' },
      { id: '4331', nome: 'Bundesliga' },
      { id: '4332', nome: 'La Liga' }
    ];
    
    for (const liga of ligasParaTestar) {
      console.log(`\n⚽ Testando liga ${liga.nome} (ID: ${liga.id})...`);
      
      try {
        const url = `${BASE_URL}/${THESPORTSDB_API_KEY}/eventsnextleague.php?id=${liga.id}`;
        console.log('🔗 URL:', url);
        
        const response = await axios.get(url);
        
        if (response.data && response.data.events) {
          console.log(`✅ ${response.data.events.length} jogos encontrados`);
          console.log('📋 Primeiros 3 jogos:');
          response.data.events.slice(0, 3).forEach((jogo, index) => {
            console.log(`  ${index + 1}. ${jogo.strEvent} - ${jogo.dateEvent}`);
            console.log(`      Liga: ${jogo.strLeague}`);
          });
        } else {
          console.log('❌ Nenhum jogo encontrado ou estrutura incorreta');
          console.log('📊 Resposta:', JSON.stringify(response.data, null, 2));
        }
      } catch (error) {
        console.error(`❌ Erro ao buscar jogos da liga ${liga.nome}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testarApiDireta();
