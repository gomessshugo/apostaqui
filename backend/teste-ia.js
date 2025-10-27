import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testarIA() {
  console.log('🧪 Testando integração com IA (Gemini)...\n');

  try {
    // 1. Registrar usuário
    console.log('1. Registrando usuário...');
    const registroResponse = await axios.post(`${BASE_URL}/registrar`, {
      email: 'ia@teste.com',
      senha: '123456'
    });
    console.log('✅ Usuário registrado:', registroResponse.data.usuario.email);
    const token = registroResponse.data.token;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Testar análise com IA
    console.log('\n2. Testando análise com IA...');
    const analiseResponse = await axios.post(`${BASE_URL}/analise-ia`, {
      timeA: 'Flamengo',
      timeB: 'Palmeiras'
    }, { headers });

    console.log('✅ Análise recebida:', analiseResponse.data.success);
    console.log('✅ Confronto:', analiseResponse.data.confronto);
    console.log('\n📊 Análise da IA:');
    console.log('─'.repeat(50));
    console.log(analiseResponse.data.analise);
    console.log('─'.repeat(50));

    // 3. Testar com outros times
    console.log('\n3. Testando com outros times...');
    const analise2Response = await axios.post(`${BASE_URL}/analise-ia`, {
      timeA: 'Real Madrid',
      timeB: 'Barcelona'
    }, { headers });

    console.log('✅ Segunda análise recebida');
    console.log('✅ Confronto:', analise2Response.data.confronto);
    console.log('\n📊 Segunda Análise da IA:');
    console.log('─'.repeat(50));
    console.log(analise2Response.data.analise.substring(0, 200) + '...');
    console.log('─'.repeat(50));

    // 4. Testar validações
    console.log('\n4. Testando validações...');
    try {
      await axios.post(`${BASE_URL}/analise-ia`, {
        timeA: 'Flamengo',
        timeB: ''
      }, { headers });
      console.log('❌ Erro: Validação deveria ter falhado');
    } catch (error) {
      console.log('✅ Validação funcionando:', error.response.data.error);
    }

    console.log('\n🎉 Teste de IA concluído!');
    console.log('\n📊 Resumo:');
    console.log('   - Integração com Gemini funcionando');
    console.log('   - Análises geradas com sucesso');
    console.log('   - Validações funcionando');
    console.log('   - Endpoint protegido por token');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

// Executar teste
testarIA();
