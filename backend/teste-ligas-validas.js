const axios = require('axios');

async function testarLigasValidas() {
  try {
    console.log('🔍 Testando IDs de ligas válidos...');
    
    const THESPORTSDB_API_KEY = '40130170';
    const BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
    
    // Primeiro, vamos buscar todas as ligas para ver quais IDs existem
    console.log('📋 Buscando todas as ligas...');
    const ligasResponse = await axios.get(`${BASE_URL}/${THESPORTSDB_API_KEY}/all_leagues.php?s=Soccer`);
    
    if (ligasResponse.data && ligasResponse.data.leagues) {
      console.log(`✅ Encontradas ${ligasResponse.data.leagues.length} ligas`);
      
      // Filtrar ligas principais
      const ligasPrincipais = ligasResponse.data.leagues.filter(liga => 
        liga.strLeague && (
          liga.strLeague.toLowerCase().includes('premier') ||
          liga.strLeague.toLowerCase().includes('bundesliga') ||
          liga.strLeague.toLowerCase().includes('la liga') ||
          liga.strLeague.toLowerCase().includes('serie a') ||
          liga.strLeague.toLowerCase().includes('brasileiro')
        )
      );
      
      console.log('🏆 Ligas principais encontradas:');
      ligasPrincipais.forEach(liga => {
        console.log(`  ${liga.idLeague}. ${liga.strLeague} (ID: ${liga.idLeague})`);
      });
      
      // Testar algumas ligas válidas
      console.log('\n⚽ Testando jogos de ligas válidas...');
      for (const liga of ligasPrincipais.slice(0, 3)) {
        console.log(`\n🔍 Testando ${liga.strLeague} (ID: ${liga.idLeague})...`);
        
        try {
          const jogosResponse = await axios.get(`${BASE_URL}/${THESPORTSDB_API_KEY}/eventsnextleague.php?id=${liga.idLeague}`);
          
          if (jogosResponse.data && jogosResponse.data.events && jogosResponse.data.events.length > 0) {
            console.log(`✅ ${jogosResponse.data.events.length} jogos encontrados`);
            console.log('📋 Primeiros 2 jogos:');
            jogosResponse.data.events.slice(0, 2).forEach((jogo, index) => {
              console.log(`  ${index + 1}. ${jogo.strEvent} - ${jogo.dateEvent}`);
            });
          } else {
            console.log('❌ Nenhum jogo encontrado');
          }
        } catch (error) {
          console.log(`❌ Erro: ${error.response?.status} - ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testarLigasValidas();
