const axios = require('axios');

async function testarLigas() {
  try {
    console.log('🔍 Testando endpoint de ligas...');

    console.log('\n🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtido');

    console.log('\n📊 Testando GET /ligas...');
    const ligasResponse = await axios.get('http://localhost:3001/ligas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Resposta das ligas:');
    console.log('   Status:', ligasResponse.status);
    console.log('   Dados:', JSON.stringify(ligasResponse.data, null, 2));

    if (ligasResponse.data.ligas && ligasResponse.data.ligas.length > 0) {
      console.log(`\n📋 Encontradas ${ligasResponse.data.ligas.length} ligas:`);
      ligasResponse.data.ligas.forEach((liga, index) => {
        console.log(`   ${index + 1}. ${liga.strLeague} (ID: ${liga.idLeague})`);
      });
    } else {
      console.log('\n❌ Nenhuma liga encontrada!');
    }

  } catch (error) {
    console.error('❌ Erro no teste de ligas:', error.response?.data || error.message);
  }
}

testarLigas();
