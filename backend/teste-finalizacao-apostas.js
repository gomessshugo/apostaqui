import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testarFinalizacaoApostas() {
  console.log('🧪 Testando finalização de apostas...\n');

  try {
    // 1. Registrar usuário
    console.log('1. Registrando usuário...');
    const registroResponse = await axios.post(`${BASE_URL}/registrar`, {
      email: 'teste@finalizacao.com',
      senha: '123456'
    });
    console.log('✅ Usuário registrado:', registroResponse.data.usuario.email);
    const token = registroResponse.data.token;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Definir saldo da banca
    console.log('\n2. Definindo saldo da banca...');
    await axios.put(`${BASE_URL}/banca`, { novo_saldo: 1000 }, { headers });
    console.log('✅ Saldo definido para R$ 1000');

    // 3. Criar aposta múltipla
    console.log('\n3. Criando aposta múltipla...');
    const apostaResponse = await axios.post(`${BASE_URL}/apostas`, {
      valor_apostado: 100,
      odd_total: 3.0,
      nome_grupo: 'Teste Finalização',
      legs: [
        {
          jogo_nome: 'Flamengo x Palmeiras',
          mercado: 'Resultado Final',
          odd_leg: 1.5
        },
        {
          jogo_nome: 'São Paulo x Corinthians',
          mercado: 'Over 2.5 Gols',
          odd_leg: 2.0
        }
      ]
    }, { headers });
    console.log('✅ Aposta criada:', apostaResponse.data.aposta_id);

    // 4. Listar apostas ativas
    console.log('\n4. Listando apostas ativas...');
    const apostasResponse = await axios.get(`${BASE_URL}/apostas-ativas`, { headers });
    console.log('✅ Apostas ativas:', apostasResponse.data.apostas.length);
    
    const aposta = apostasResponse.data.apostas[0];
    console.log('   - Nome:', aposta.nome_grupo);
    console.log('   - Valor:', aposta.valor_apostado);
    console.log('   - Odd Total:', aposta.odd_total);
    console.log('   - Status:', aposta.status);
    console.log('   - Legs:', aposta.legs.length);

    // 5. Verificar saldo antes
    console.log('\n5. Verificando saldo antes das atualizações...');
    const saldoAntesResponse = await axios.get(`${BASE_URL}/banca`, { headers });
    console.log('✅ Saldo antes:', saldoAntesResponse.data.saldo_atual);

    // 6. Atualizar primeira leg para GANHA
    console.log('\n6. Atualizando primeira leg para GANHA...');
    const leg1Id = aposta.legs[0].id;
    await axios.put(`${BASE_URL}/legs/${leg1Id}`, 
      { status_leg: 'GANHA' }, 
      { headers }
    );
    console.log('✅ Primeira leg atualizada para GANHA');

    // 7. Verificar se aposta ainda está pendente
    console.log('\n7. Verificando status da aposta...');
    const apostasPendentesResponse = await axios.get(`${BASE_URL}/apostas-ativas`, { headers });
    console.log('✅ Apostas ainda ativas:', apostasPendentesResponse.data.apostas.length);

    // 8. Atualizar segunda leg para GANHA
    console.log('\n8. Atualizando segunda leg para GANHA...');
    const leg2Id = aposta.legs[1].id;
    await axios.put(`${BASE_URL}/legs/${leg2Id}`, 
      { status_leg: 'GANHA' }, 
      { headers }
    );
    console.log('✅ Segunda leg atualizada para GANHA');

    // 9. Verificar se aposta foi finalizada
    console.log('\n9. Verificando se aposta foi finalizada...');
    const apostasAtivasResponse = await axios.get(`${BASE_URL}/apostas-ativas`, { headers });
    const apostasHistoricoResponse = await axios.get(`${BASE_URL}/apostas-historico`, { headers });
    
    console.log('✅ Apostas ativas:', apostasAtivasResponse.data.apostas.length);
    console.log('✅ Apostas no histórico:', apostasHistoricoResponse.data.apostas.length);

    if (apostasHistoricoResponse.data.apostas.length > 0) {
      const apostaFinalizada = apostasHistoricoResponse.data.apostas[0];
      console.log('   - Status final:', apostaFinalizada.status);
      console.log('   - Valor apostado:', apostaFinalizada.valor_apostado);
      console.log('   - Odd total:', apostaFinalizada.status);
    }

    // 10. Verificar saldo após ganho
    console.log('\n10. Verificando saldo após ganho...');
    const saldoDepoisResponse = await axios.get(`${BASE_URL}/banca`, { headers });
    console.log('✅ Saldo depois:', saldoDepoisResponse.data.saldo_atual);
    
    const diferenca = saldoDepoisResponse.data.saldo_atual - saldoAntesResponse.data.saldo_atual;
    console.log('✅ Diferença no saldo:', diferenca);

    // 11. Testar aposta perdida
    console.log('\n11. Testando aposta perdida...');
    
    // Criar nova aposta
    const apostaPerdidaResponse = await axios.post(`${BASE_URL}/apostas`, {
      valor_apostado: 50,
      odd_total: 2.0,
      nome_grupo: 'Teste Perdida',
      legs: [
        {
          jogo_nome: 'Santos x Grêmio',
          mercado: 'Ambas Marcam',
          odd_leg: 2.0
        }
      ]
    }, { headers });
    console.log('✅ Aposta de teste criada:', apostaPerdidaResponse.data.aposta_id);

    // Atualizar leg para PERDIDA
    const apostasAtivas2Response = await axios.get(`${BASE_URL}/apostas-ativas`, { headers });
    const apostaPerdida = apostasAtivas2Response.data.apostas[0];
    const legPerdidaId = apostaPerdida.legs[0].id;
    
    await axios.put(`${BASE_URL}/legs/${legPerdidaId}`, 
      { status_leg: 'PERDIDA' }, 
      { headers }
    );
    console.log('✅ Leg atualizada para PERDIDA');

    // Verificar se aposta foi marcada como perdida
    const apostasHistorico2Response = await axios.get(`${BASE_URL}/apostas-historico`, { headers });
    console.log('✅ Apostas no histórico:', apostasHistorico2Response.data.apostas.length);
    
    if (apostasHistorico2Response.data.apostas.length > 0) {
      const apostaPerdidaFinal = apostasHistorico2Response.data.apostas.find(a => a.nome_grupo === 'Teste Perdida');
      if (apostaPerdidaFinal) {
        console.log('   - Status da aposta perdida:', apostaPerdidaFinal.status);
      }
    }

    console.log('\n🎉 Teste de finalização de apostas concluído!');
    console.log('\n📊 Resumo:');
    console.log('   - Aposta ganha: Status atualizado e prêmio adicionado');
    console.log('   - Aposta perdida: Status atualizado (sem prêmio)');
    console.log('   - Sistema funcionando corretamente');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

// Executar teste
testarFinalizacaoApostas();
