const axios = require('axios');

async function testarContador() {
  try {
    console.log('🎯 Testando Contador de API...\n');

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

    console.log('📈 Status do contador:');
    console.log(`   Uso: ${contadorInicial.data.uso}/${contadorInicial.data.limite}`);
    console.log(`   Restante: ${contadorInicial.data.restante}`);
    console.log(`   Percentual: ${contadorInicial.data.percentual}%\n`);

    // 3. Fazer algumas requisições para testar o contador
    console.log('🎯 Fazendo requisições para testar contador...');
    
    // Teste 1: Buscar odds do Brasileirão
    console.log('   Teste 1: Buscando odds do Brasileirão...');
    await axios.get('http://localhost:3001/odds-liga/4329', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ Requisição 1 realizada');

    // Teste 2: Buscar odds da Premier League
    console.log('   Teste 2: Buscando odds da Premier League...');
    await axios.get('http://localhost:3001/odds-liga/4328', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ Requisição 2 realizada');

    // Teste 3: Listar ligas
    console.log('   Teste 3: Listando ligas disponíveis...');
    await axios.get('http://localhost:3001/odds-ligas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ Requisição 3 realizada\n');

    // 4. Verificar contador após as requisições
    console.log('📊 Verificando contador após requisições...');
    const contadorFinal = await axios.get('http://localhost:3001/api/contador', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📈 Status final do contador:');
    console.log(`   Uso: ${contadorFinal.data.uso}/${contadorFinal.data.limite}`);
    console.log(`   Restante: ${contadorFinal.data.restante}`);
    console.log(`   Percentual: ${contadorFinal.data.percentual}%`);

    const incremento = contadorFinal.data.uso - contadorInicial.data.uso;
    console.log(`\n🎉 Contador incrementado em: ${incremento} requisições`);
    console.log('✅ Teste do contador concluído com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarContador();
