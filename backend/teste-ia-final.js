const axios = require('axios');

async function testarIA() {
  try {
    console.log('🔑 Testando IA com modelo gemini-pro...');
    
    // 1. Registrar usuário primeiro
    console.log('📝 Registrando usuário...');
    try {
      await axios.post('http://localhost:3001/registrar', {
        email: 'teste@teste.com',
        senha: '123456'
      });
      console.log('✅ Usuário registrado');
    } catch (error) {
      if (error.response?.data?.error?.includes('já existe')) {
        console.log('✅ Usuário já existe');
      } else {
        throw error;
      }
    }
    
    // 2. Fazer login para obter token
    console.log('📝 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtido:', token.substring(0, 20) + '...');
    
    // 2. Testar endpoint de IA
    console.log('🤖 Testando análise com IA...');
    const iaResponse = await axios.post('http://localhost:3001/analise-ia', {
      timeA: 'Flamengo',
      timeB: 'Vasco'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta da IA:');
    console.log(iaResponse.data);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testarIA();
