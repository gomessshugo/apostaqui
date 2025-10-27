const axios = require('axios');

async function testarIA() {
  try {
    console.log('🧪 Testando análise com IA...');
    
    // Primeiro, fazer login para obter token
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@frontend.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Testar análise com IA
    const iaResponse = await axios.post('http://localhost:3001/analise-ia', {
      timeA: 'Flamengo',
      timeB: 'Palmeiras'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Análise com IA funcionando:');
    console.log('📊 Status:', iaResponse.data.success);
    console.log('🤖 Simulada:', iaResponse.data.simulada);
    console.log('📝 Análise:', iaResponse.data.analise.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarIA();
