const axios = require('axios');

async function testarAnaliseReal() {
  try {
    console.log('🤖 Testando Análise IA com Odds REAIS...\n');

    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtido\n');

    // 2. Verificar contador inicial
    console.log('📊 Verificando contador inicial...');
    const contadorInicial = await axios.get('http://localhost:3001/api/contador', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📈 Contador inicial: ${contadorInicial.data.uso}/${contadorInicial.data.limite} (${contadorInicial.data.percentual}%)\n`);

    // 3. Testar análise IA com odds reais
    console.log('🤖 Testando análise IA com dados reais...');
    const analiseResponse = await axios.post('http://localhost:3001/analise-ia', {
      timeA: 'Flamengo',
      timeB: 'Palmeiras'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Análise IA concluída!');
    console.log('\n📊 RESULTADOS:');
    console.log(`   Confronto: ${analiseResponse.data.confronto}`);
    console.log(`   Fonte: ${analiseResponse.data.fonte}`);
    
    if (analiseResponse.data.odds) {
      console.log('\n🎯 ODDS REAIS ENCONTRADAS:');
      console.log(`   Casa (1): ${analiseResponse.data.odds.casa}`);
      console.log(`   Empate (X): ${analiseResponse.data.odds.empate}`);
      console.log(`   Visitante (2): ${analiseResponse.data.odds.visitante}`);
      console.log(`   Over 2.5: ${analiseResponse.data.odds.over25}`);
      console.log(`   Under 2.5: ${analiseResponse.data.odds.under25}`);
    }

    console.log('\n🧠 ANÁLISE IA:');
    console.log('─'.repeat(60));
    console.log(analiseResponse.data.analise);
    console.log('─'.repeat(60));

    // 4. Verificar contador final
    console.log('\n📊 Verificando contador final...');
    const contadorFinal = await axios.get('http://localhost:3001/api/contador', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📈 Contador final: ${contadorFinal.data.uso}/${contadorFinal.data.limite} (${contadorFinal.data.percentual}%)`);
    
    const incremento = contadorFinal.data.uso - contadorInicial.data.uso;
    console.log(`🎉 Requisições utilizadas: ${incremento}`);

    console.log('\n✅ Teste de análise IA com odds reais concluído com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarAnaliseReal();
