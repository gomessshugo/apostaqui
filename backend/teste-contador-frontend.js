const axios = require('axios');

async function testarContadorFrontend() {
  try {
    console.log('🎯 Testando Contador para Frontend...');

    console.log('\n🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtido');

    console.log('\n📊 Testando endpoint GET /api/contador...');
    const contadorResponse = await axios.get('http://localhost:3001/api/contador', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Resposta do contador:');
    console.log(`   Uso: ${contadorResponse.data.uso}/${contadorResponse.data.limite}`);
    console.log(`   Restante: ${contadorResponse.data.restante}`);
    console.log(`   Percentual: ${contadorResponse.data.percentual}%`);

    console.log('\n🎯 Fazendo algumas análises IA para incrementar contador...');
    
    // Fazer algumas análises para testar o contador
    console.log('   Análise 1: Flamengo vs Palmeiras...');
    await axios.post('http://localhost:3001/analise-ia', {
      timeA: 'Flamengo',
      timeB: 'Palmeiras'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('   Análise 2: Real Madrid vs Barcelona...');
    await axios.post('http://localhost:3001/analise-ia', {
      timeA: 'Real Madrid',
      timeB: 'Barcelona'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('\n📊 Verificando contador após análises...');
    const contadorFinalResponse = await axios.get('http://localhost:3001/api/contador', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Contador final:');
    console.log(`   Uso: ${contadorFinalResponse.data.uso}/${contadorFinalResponse.data.limite}`);
    console.log(`   Restante: ${contadorFinalResponse.data.restante}`);
    console.log(`   Percentual: ${contadorFinalResponse.data.percentual}%`);

    console.log('\n🎉 Teste do contador para frontend concluído!');
    console.log('📱 O frontend agora pode exibir essas informações em tempo real!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarContadorFrontend();
