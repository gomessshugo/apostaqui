const axios = require('axios');

async function testarLigasDiferentes() {
  try {
    console.log('🔍 Testando diferentes ligas para verificar se retornam jogos únicos...');
    
    // 1. Fazer login para obter token
    console.log('📝 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtido:', token.substring(0, 20) + '...');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Testar diferentes ligas
    const ligasParaTestar = [
      { id: '4328', nome: 'Premier League' },
      { id: '4331', nome: 'Bundesliga' },
      { id: '4332', nome: 'La Liga' },
      { id: '4334', nome: 'Serie A' }
    ];
    
    for (const liga of ligasParaTestar) {
      console.log(`\n⚽ Testando liga ${liga.nome} (ID: ${liga.id})...`);
      
      try {
        const jogosResponse = await axios.get(`http://localhost:3001/jogos-da-liga/${liga.id}`, { headers });
        
        if (jogosResponse.data.jogos && jogosResponse.data.jogos.length > 0) {
          console.log(`✅ ${jogosResponse.data.jogos.length} jogos encontrados`);
          console.log('📋 Primeiros 3 jogos:');
          jogosResponse.data.jogos.slice(0, 3).forEach((jogo, index) => {
            console.log(`  ${index + 1}. ${jogo.nome} - ${jogo.data}`);
          });
          
          // Verificar se os jogos são únicos para esta liga
          const ligaJogo = jogosResponse.data.jogos[0]?.liga;
          console.log(`🏆 Liga dos jogos: ${ligaJogo}`);
          
          if (ligaJogo && ligaJogo.toLowerCase().includes(liga.nome.toLowerCase().split(' ')[0])) {
            console.log('✅ Jogos correspondem à liga selecionada');
          } else {
            console.log('⚠️ ATENÇÃO: Jogos podem não corresponder à liga selecionada');
          }
        } else {
          console.log('❌ Nenhum jogo encontrado');
        }
      } catch (error) {
        console.error(`❌ Erro ao buscar jogos da liga ${liga.nome}:`, error.response?.data || error.message);
      }
    }
    
    console.log('\n🎉 Teste de ligas diferentes concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarLigasDiferentes();
