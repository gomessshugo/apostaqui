const axios = require('axios');
const { getDatabase } = require('./database');

const BASE_URL = 'http://localhost:3001';

async function limparBanco() {
  try {
    const db = getDatabase();
    if (db) {
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('DELETE FROM Legs', (err) => {
            if (err) console.log('Erro ao limpar Legs:', err);
          });
          db.run('DELETE FROM Apostas', (err) => {
            if (err) console.log('Erro ao limpar Apostas:', err);
          });
          db.run('DELETE FROM Banca', (err) => {
            if (err) console.log('Erro ao limpar Banca:', err);
          });
          db.run('DELETE FROM Usuarios', (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
      console.log('✅ Banco limpo');
    }
  } catch (error) {
    console.log('⚠️ Erro ao limpar banco:', error.message);
  }
}

async function testarEndpointsCompletos() {
  console.log('🧪 Testando todos os endpoints do sistema...\n');

  try {
    // Limpar banco antes dos testes
    console.log('0. Limpando banco de dados...');
    await limparBanco();

    // Teste 1: Verificar se o servidor está rodando
    console.log('\n1. Verificando se o servidor está rodando...');
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Servidor funcionando:', healthResponse.data.message);

    // Teste 2: Registrar usuário
    console.log('\n2. Testando registro de usuário...');
    const registroData = {
      email: 'teste@example.com',
      senha: '123456'
    };

    const registroResponse = await axios.post(`${BASE_URL}/registrar`, registroData);
    console.log('✅ Usuário registrado:', registroResponse.data.usuario);
    const token = registroResponse.data.token;
    console.log('✅ Token gerado:', token.substring(0, 20) + '...');

    // Configurar headers para autenticação
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Teste 3: Verificar saldo inicial da banca
    console.log('\n3. Testando GET /banca...');
    const bancaResponse = await axios.get(`${BASE_URL}/banca`, { headers });
    console.log('✅ Saldo inicial da banca:', bancaResponse.data.saldo_atual);

    // Teste 4: Atualizar saldo da banca
    console.log('\n4. Testando PUT /banca...');
    const novoSaldo = 1000;
    const atualizarBancaResponse = await axios.put(`${BASE_URL}/banca`, 
      { novo_saldo: novoSaldo }, 
      { headers }
    );
    console.log('✅ Saldo atualizado para:', atualizarBancaResponse.data.novo_saldo);

    // Teste 5: Verificar saldo atualizado
    console.log('\n5. Verificando saldo atualizado...');
    const bancaAtualizadaResponse = await axios.get(`${BASE_URL}/banca`, { headers });
    console.log('✅ Saldo atual da banca:', bancaAtualizadaResponse.data.saldo_atual);

    // Teste 6: Criar uma aposta
    console.log('\n6. Testando POST /apostas...');
    const apostaData = {
      valor_apostado: 100,
      odd_total: 2.5,
      nome_grupo: 'Sistema Teste',
      legs: [
        {
          jogo_nome: 'Flamengo x Palmeiras',
          mercado: 'Resultado Final',
          odd_leg: 1.5
        },
        {
          jogo_nome: 'São Paulo x Corinthians',
          mercado: 'Over 2.5 Gols',
          odd_leg: 1.67
        }
      ]
    };

    const apostaResponse = await axios.post(`${BASE_URL}/apostas`, apostaData, { headers });
    console.log('✅ Aposta criada:', apostaResponse.data.aposta_id);
    console.log('✅ Valor apostado:', apostaResponse.data.valor_apostado);
    console.log('✅ Legs criadas:', apostaResponse.data.legs_criadas);

    // Teste 7: Verificar saldo após aposta
    console.log('\n7. Verificando saldo após aposta...');
    const saldoAposApostaResponse = await axios.get(`${BASE_URL}/banca`, { headers });
    console.log('✅ Saldo após aposta:', saldoAposApostaResponse.data.saldo_atual);

    // Teste 8: Listar apostas ativas
    console.log('\n8. Testando GET /apostas-ativas...');
    const apostasAtivasResponse = await axios.get(`${BASE_URL}/apostas-ativas`, { headers });
    console.log('✅ Apostas ativas encontradas:', apostasAtivasResponse.data.apostas.length);
    if (apostasAtivasResponse.data.apostas.length > 0) {
      const aposta = apostasAtivasResponse.data.apostas[0];
      console.log('✅ Primeira aposta:', {
        id: aposta.id,
        nome_grupo: aposta.nome_grupo,
        valor_apostado: aposta.valor_apostado,
        odd_total: aposta.odd_total,
        status: aposta.status,
        legs_count: aposta.legs.length
      });
    }

    // Teste 9: Listar histórico (deve estar vazio)
    console.log('\n9. Testando GET /apostas-historico...');
    const historicoResponse = await axios.get(`${BASE_URL}/apostas-historico`, { headers });
    console.log('✅ Apostas no histórico:', historicoResponse.data.apostas.length);

    // Teste 10: Tentar criar aposta com saldo insuficiente
    console.log('\n10. Testando aposta com saldo insuficiente...');
    try {
      await axios.post(`${BASE_URL}/apostas`, {
        valor_apostado: 2000, // Mais que o saldo disponível
        odd_total: 2.0,
        nome_grupo: 'Teste Saldo Insuficiente',
        legs: [{
          jogo_nome: 'Teste',
          mercado: 'Teste',
          odd_leg: 2.0
        }]
      }, { headers });
      console.log('❌ Erro: Aposta deveria ter falhado');
    } catch (error) {
      console.log('✅ Erro esperado capturado:', error.response.data.error);
    }

    // Teste 11: Tentar acessar endpoint sem token
    console.log('\n11. Testando acesso sem token...');
    try {
      await axios.get(`${BASE_URL}/banca`);
      console.log('❌ Erro: Acesso deveria ter falhado');
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
}

// Executar testes
testarEndpointsCompletos();
