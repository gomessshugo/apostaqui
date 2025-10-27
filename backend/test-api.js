const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  try {
    console.log('🧪 Testando API do Sistema de Apostas...\n');

    // Teste 1: Health Check
    console.log('1. Testando Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);

    // Teste 2: Registro de usuário
    console.log('\n2. Testando registro de usuário...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: '123456',
      fullName: 'Usuário Teste',
      phone: '11999999999',
      birthDate: '1990-01-01'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('✅ Usuário registrado:', registerResponse.data.user);
      
      const { accessToken, refreshToken } = registerResponse.data;
      
      // Teste 3: Login
      console.log('\n3. Testando login...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: '123456'
      });
      console.log('✅ Login realizado:', loginResponse.data.user);

      // Teste 4: Verificar token
      console.log('\n4. Testando verificação de token...');
      const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('✅ Token válido:', verifyResponse.data);

      // Teste 5: Obter perfil
      console.log('\n5. Testando obtenção de perfil...');
      const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('✅ Perfil obtido:', profileResponse.data.user);

      // Teste 6: Obter categorias
      console.log('\n6. Testando obtenção de categorias...');
      const categoriesResponse = await axios.get(`${BASE_URL}/bets/categories/list`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('✅ Categorias obtidas:', categoriesResponse.data.categories);

      // Teste 7: Criar aposta
      console.log('\n7. Testando criação de aposta...');
      const betData = {
        title: 'Flamengo x Palmeiras',
        description: 'Aposta no Flamengo',
        stakeAmount: 100.00,
        odds: 2.50,
        categoryId: 1,
        notes: 'Aposta de teste'
      };

      const betResponse = await axios.post(`${BASE_URL}/bets`, betData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('✅ Aposta criada:', betResponse.data);

      // Teste 8: Listar apostas
      console.log('\n8. Testando listagem de apostas...');
      const betsResponse = await axios.get(`${BASE_URL}/bets`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('✅ Apostas listadas:', betsResponse.data.bets.length, 'apostas encontradas');

      // Teste 9: Obter estatísticas
      console.log('\n9. Testando obtenção de estatísticas...');
      const statsResponse = await axios.get(`${BASE_URL}/users/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('✅ Estatísticas obtidas:', statsResponse.data.stats);

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
  }
}

// Executar testes
testAPI();
