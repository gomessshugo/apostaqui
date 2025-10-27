const axios = require('axios');

async function testarOddsAPI() {
  try {
    console.log('🎯 Testando API de Odds Reais...\n');
    
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtido\n');
    
    // 2. Testar odds da liga brasileira
    console.log('🇧🇷 Testando odds do Brasileirão...');
    const oddsResponse = await axios.get('http://localhost:3001/odds-liga/4329', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Resposta das odds:');
    console.log(`📊 Total de jogos: ${oddsResponse.data.total}`);
    console.log(`🌐 Fonte: ${oddsResponse.data.fonte}`);
    
    if (oddsResponse.data.jogos && oddsResponse.data.jogos.length > 0) {
      console.log('\n🏆 Primeiros 3 jogos com odds:');
      oddsResponse.data.jogos.slice(0, 3).forEach((jogo, index) => {
        console.log(`\n${index + 1}. ${jogo.nome}`);
        console.log(`   📅 Data: ${new Date(jogo.data).toLocaleDateString('pt-BR')}`);
        console.log(`   🏠 Casa: ${jogo.casa}`);
        console.log(`   ✈️ Visitante: ${jogo.visitante}`);
        
        if (jogo.odds && jogo.odds.h2h) {
          console.log('   🎯 Odds 1x2:');
          jogo.odds.h2h.forEach(odd => {
            console.log(`      ${odd.name}: ${odd.price}`);
          });
        }
        
        if (jogo.odds && jogo.odds.totals) {
          console.log('   📊 Over/Under:');
          jogo.odds.totals.forEach(odd => {
            console.log(`      ${odd.name}: ${odd.price}`);
          });
        }
      });
    }
    
    // 3. Testar ligas disponíveis
    console.log('\n🌍 Testando ligas disponíveis...');
    const ligasResponse = await axios.get('http://localhost:3001/odds-ligas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (ligasResponse.data.success) {
      console.log('✅ Ligas disponíveis para odds:');
      console.log(`📋 Total: ${ligasResponse.data.ligas?.length || 0} ligas`);
    } else {
      console.log('⚠️ Usando fallback - dados simulados');
    }
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testarOddsAPI();
