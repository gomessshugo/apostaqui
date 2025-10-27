const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testarEndpoints() {
  console.log('🧪 Testando endpoints de autenticação...\n');

  try {
    // Teste 1: Verificar se o servidor está rodando
    console.log('1. Verificando se o servidor está rodando...');
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Servidor funcionando:', healthResponse.data.message);

    // Teste 2: Registrar usuário
    console.log('\n2. Testando registro de usuário...');
    const registroData = {
      email: 'teste@example.com',
      senha: '123456'
    };

    try {
      const registroResponse = await axios.post(`${BASE_URL}/registrar`, registroData);
      console.log('✅ Usuário registrado:', registroResponse.data.usuario);
      console.log('✅ Token gerado:', registroResponse.data.token.substring(0, 20) + '...');
      
      const token = registroResponse.data.token;
      
      // Teste 3: Fazer login
      console.log('\n3. Testando login...');
      const loginResponse = await axios.post(`${BASE_URL}/login`, registroData);
      console.log('✅ Login realizado:', loginResponse.data.usuario);
      console.log('✅ Token gerado:', loginResponse.data.token.substring(0, 20) + '...');

      // Teste 4: Tentar registrar usuário duplicado
      console.log('\n4. Testando registro de usuário duplicado...');
      try {
        await axios.post(`${BASE_URL}/registrar`, registroData);
        console.log('❌ Erro: Registro deveria ter falhado');
      } catch (error) {
        console.log('✅ Erro esperado capturado:', error.response.data.error);
      }

      // Teste 5: Tentar login com senha incorreta
      console.log('\n5. Testando login com senha incorreta...');
      try {
        await axios.post(`${BASE_URL}/login`, {
          email: 'teste@example.com',
          senha: 'senhaerrada'
        });
        console.log('❌ Erro: Login deveria ter falhado');
      } catch (error) {
        console.log('✅ Erro esperado capturado:', error.response.data.error);
      }

      // Teste 6: Tentar login com usuário inexistente
      console.log('\n6. Testando login com usuário inexistente...');
      try {
        await axios.post(`${BASE_URL}/login`, {
          email: 'inexistente@example.com',
          senha: '123456'
        });
        console.log('❌ Erro: Login deveria ter falhado');
      } catch (error) {
        console.log('✅ Erro esperado capturado:', error.response.data.error);
      }

      // Teste 7: Validação de dados
      console.log('\n7. Testando validação de dados...');
      try {
        await axios.post(`${BASE_URL}/registrar`, {
          email: 'teste2@example.com',
          senha: '123' // Senha muito curta
        });
        console.log('❌ Erro: Validação deveria ter falhado');
      } catch (error) {
        console.log('✅ Erro esperado capturado:', error.response.data.error);
      }

      console.log('\n🎉 Todos os testes passaram com sucesso!');

    } catch (error) {
      if (error.response) {
        console.error('❌ Erro na API:', error.response.data);
      } else {
        console.error('❌ Erro:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao conectar com a API:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando em http://localhost:3001');
  }
}

// Executar testes
testarEndpoints();
