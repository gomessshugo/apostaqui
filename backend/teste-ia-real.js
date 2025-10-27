const axios = require('axios');

async function testarIAReal() {
  try {
    console.log('🤖 Testando IA REAL do Gemini...');
    
    // Primeiro, fazer login para obter token
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@frontend.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Testar análise com IA REAL
    console.log('🧪 Testando análise com IA REAL...');
    const iaResponse = await axios.post('http://localhost:3001/analise-ia', {
      timeA: 'Flamengo',
      timeB: 'Palmeiras'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Análise com IA REAL funcionando:');
    console.log('📊 Status:', iaResponse.data.success);
    console.log('🤖 Simulada:', iaResponse.data.simulada);
    console.log('📝 Análise:', iaResponse.data.analise.substring(0, 300) + '...');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.includes('API key')) {
      console.log('\n🔑 CONFIGURAÇÃO NECESSÁRIA:');
      console.log('1. Acesse: https://makersuite.google.com/app/apikey');
      console.log('2. Crie uma API key gratuita');
      console.log('3. Crie arquivo .env na pasta backend/');
      console.log('4. Adicione: GEMINI_API_KEY=sua_chave_aqui');
      console.log('5. Reinicie o servidor');
    }
  }
}

testarIAReal();
