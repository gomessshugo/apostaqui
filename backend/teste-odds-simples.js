const axios = require('axios');

async function testarOddsSimples() {
  try {
    console.log('🧪 Testando busca de odds simples...');
    
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');
    
    // 2. Testar busca de odds da liga
    console.log('\n🎯 Testando GET /odds-liga/4329...');
    const oddsResponse = await axios.get('http://localhost:3001/odds-liga/4329', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Odds recebidas com sucesso!');
    console.log('📊 Total de jogos:', oddsResponse.data.total);
    console.log('🎯 Fonte:', oddsResponse.data.fonte);
    
    // Mostrar alguns jogos
    if (oddsResponse.data.jogos && oddsResponse.data.jogos.length > 0) {
      console.log('\n📋 Primeiros 3 jogos:');
      oddsResponse.data.jogos.slice(0, 3).forEach((jogo, index) => {
        console.log(`${index + 1}. ${jogo.nome} - ${jogo.data} ${jogo.hora}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarOddsSimples();
