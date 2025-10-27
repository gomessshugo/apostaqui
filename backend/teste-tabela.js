const axios = require('axios');

async function testarTabela() {
  try {
    console.log('🧪 Testando endpoint de tabela...');
    
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');
    
    // 2. Testar endpoint de tabela
    console.log('\n🏆 Testando GET /liga/4329/tabela...');
    const tabelaResponse = await axios.get('http://localhost:3001/liga/4329/tabela', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Tabela recebida com sucesso!');
    console.log('📊 Total de times:', tabelaResponse.data.total);
    console.log('🎯 Fonte:', tabelaResponse.data.fonte);
    
    // Mostrar os 5 primeiros times
    console.log('\n📋 Top 5 da tabela:');
    tabelaResponse.data.tabela.slice(0, 5).forEach((time, index) => {
      console.log(`${index + 1}. ${time.time} - ${time.pontos} pts (${time.vitorias}V ${time.empates}E ${time.derrotas}D)`);
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarTabela();
