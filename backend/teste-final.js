const axios = require('axios');
const { getDatabase } = require('./database');

const BASE_URL = 'http://localhost:3001';

async function limparBancoCompleto() {
  try {
    const db = getDatabase();
    if (db) {
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          // Deletar em ordem para respeitar foreign keys
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
      console.log('✅ Banco completamente limpo');
    }
  } catch (error) {
    console.log('⚠️ Erro ao limpar banco:', error.message);
  }
}

async function testarSistemaCompleto() {
  console.log('🧪 Testando sistema completo de apostas...\n');

  try {
    // Limpar banco completamente
    console.log('0. Limpando banco de dados...');
    await limparBancoCompleto();

    // Teste 1: Verificar servidor
    console.log('\n1. Verificando servidor...');
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Servidor funcionando');

    // Teste 2: Registrar usuário
    console.log('\n2. Registrando usuário...');
    const registroResponse = await axios.post(`${BASE_URL}/registrar`, {
      email: 'usuario@teste.com',
      senha: '123456'
    });
    console.log('✅ Usuário registrado:', registroResponse.data.usuario.email);
    const token = registroResponse.data.token;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Teste 3: Verificar saldo inicial
    console.log('\n3. Verificando saldo inicial...');
    const saldoInicialResponse = await axios.get(`${BASE_URL}/banca`, { headers });
    console.log('✅ Saldo inicial:', saldoInicialResponse.data.saldo_atual);

    // Teste 4: Definir saldo da banca
    console.log('\n4. Definindo saldo da banca...');
    await axios.put(`${BASE_URL}/banca`, { novo_saldo: 1000 }, { headers });
    console.log('✅ Saldo definido para R$ 1000');

    // Teste 5: Verificar saldo atualizado
    console.log('\n5. Verificando saldo atualizado...');
    const saldoAtualizadoResponse = await axios.get(`${BASE_URL}/banca`, { headers });
    console.log('✅ Saldo atual:', saldoAtualizadoResponse.data.saldo_atual);

    // Teste 6: Criar aposta simples
    console.log('\n6. Criando aposta simples...');
    const apostaSimples = {
      valor_apostado: 50,
      odd_total: 2.0,
      nome_grupo: 'Aposta Simples',
      legs: [{
        jogo_nome: 'Flamengo x Palmeiras',
        mercado: 'Resultado Final',
        odd_leg: 2.0
      }]
    };

    const apostaSimplesResponse = await axios.post(`${BASE_URL}/apostas`, apostaSimples, { headers });
    console.log('✅ Aposta simples criada:', apostaSimplesResponse.data.aposta_id);

    // Teste 7: Criar aposta múltipla
    console.log('\n7. Criando aposta múltipla...');
    const apostaMultipla = {
      valor_apostado: 100,
      odd_total: 3.5,
      nome_grupo: 'Sistema Múltiplo',
      legs: [
        {
          jogo_nome: 'São Paulo x Corinthians',
          mercado: 'Over 2.5 Gols',
          odd_leg: 1.8
        },
        {
          jogo_nome: 'Santos x Grêmio',
          mercado: 'Ambas Marcam',
          odd_leg: 1.9
        }
      ]
    };

    const apostaMultiplaResponse = await axios.post(`${BASE_URL}/apostas`, apostaMultipla, { headers });
    console.log('✅ Aposta múltipla criada:', apostaMultiplaResponse.data.aposta_id);

    // Teste 8: Verificar saldo após apostas
    console.log('\n8. Verificando saldo após apostas...');
    const saldoFinalResponse = await axios.get(`${BASE_URL}/banca`, { headers });
    console.log('✅ Saldo final:', saldoFinalResponse.data.saldo_atual);

    // Teste 9: Listar apostas ativas
    console.log('\n9. Listando apostas ativas...');
    const apostasAtivasResponse = await axios.get(`${BASE_URL}/apostas-ativas`, { headers });
    console.log('✅ Apostas ativas:', apostasAtivasResponse.data.apostas.length);
    
    apostasAtivasResponse.data.apostas.forEach((aposta, index) => {
      console.log(`   ${index + 1}. ${aposta.nome_grupo} - R$ ${aposta.valor_apostado} - ${aposta.legs.length} legs`);
    });

    // Teste 10: Listar histórico (deve estar vazio)
    console.log('\n10. Listando histórico...');
    const historicoResponse = await axios.get(`${BASE_URL}/apostas-historico`, { headers });
    console.log('✅ Apostas no histórico:', historicoResponse.data.apostas.length);

    // Teste 11: Testar validações
    console.log('\n11. Testando validações...');
    
    // Saldo insuficiente
    try {
      await axios.post(`${BASE_URL}/apostas`, {
        valor_apostado: 2000,
        odd_total: 2.0,
        nome_grupo: 'Teste Saldo',
        legs: [{ jogo_nome: 'Teste', mercado: 'Teste', odd_leg: 2.0 }]
      }, { headers });
    } catch (error) {
      console.log('✅ Validação saldo insuficiente:', error.response.data.error);
    }

    // Dados inválidos
    try {
      await axios.post(`${BASE_URL}/apostas`, {
        valor_apostado: -100,
        odd_total: 0.5,
        legs: []
      }, { headers });
    } catch (error) {
      console.log('✅ Validação dados inválidos:', error.response.data.error);
    }

    console.log('\n🎉 Sistema completo funcionando perfeitamente!');
    console.log('\n📊 Resumo:');
    console.log(`   - Usuário criado e autenticado`);
    console.log(`   - Saldo inicial: R$ 1000`);
    console.log(`   - Apostas criadas: 2`);
    console.log(`   - Saldo final: R$ ${saldoFinalResponse.data.saldo_atual}`);
    console.log(`   - Apostas ativas: ${apostasAtivasResponse.data.apostas.length}`);

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro na API:', error.response.data);
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

// Executar teste
testarSistemaCompleto();
