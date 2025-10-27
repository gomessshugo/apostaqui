const axios = require('axios');

async function testarAnaliseIANova() {
  try {
    console.log('🧪 Testando endpoint POST /analise-ia com nova lógica...');
    
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');
    
    // 2. Testar análise IA com nova lógica
    console.log('\n🤖 Testando análise IA...');
    const analiseResponse = await axios.post('http://localhost:3001/analise-ia', {
      timeA: 'Flamengo',
      timeB: 'Palmeiras',
      liga_id: '4329'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Análise IA realizada com sucesso!');
    console.log('📊 Odds encontradas:', analiseResponse.data.odds);
    console.log('🧠 Análise:', analiseResponse.data.analise.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarAnaliseIANova();
