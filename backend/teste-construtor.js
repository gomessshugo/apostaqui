import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testarConstrutor() {
  console.log('🧪 Testando Construtor de Sistemas...\n');

  try {
    // 1. Registrar usuário
    console.log('1. Registrando usuário...');
    const registroResponse = await axios.post(`${BASE_URL}/registrar`, {
      email: 'construtor@teste.com',
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

    // 3. Simular sistema do construtor
    console.log('\n3. Simulando sistema do construtor...');
    
    // Jogos base
    const jogosBase = [
      {
        jogo_nome: 'Flamengo x Palmeiras',
        mercado: 'Over 2.5 Gols',
        odd_leg: 1.8
      },
      {
        jogo_nome: 'São Paulo x Corinthians',
        mercado: 'Ambas Marcam',
        odd_leg: 1.9
      }
    ];

    // Jogo pivô
    const jogoPivo = 'Santos x Grêmio';

    // Variações
    const variacoes = [
      {
        mercado: 'Santos Vence',
        odd_leg: 2.1
      },
      {
        mercado: 'Empate',
        odd_leg: 3.2
      },
      {
        mercado: 'Grêmio Vence',
        odd_leg: 2.8
      }
    ];

    const valorPorAposta = 50;

    console.log('   - Jogos Base:', jogosBase.length);
    console.log('   - Jogo Pivô:', jogoPivo);
    console.log('   - Variações:', variacoes.length);
    console.log('   - Valor por aposta: R$', valorPorAposta);

    // 4. Gerar sistema (criar apostas)
    console.log('\n4. Gerando sistema...');
    const apostasCriadas = [];

    for (let i = 0; i < variacoes.length; i++) {
      const variacao = variacoes[i];
      
      // Montar legs (jogos base + variação)
      const legs = [
        ...jogosBase.map(jogo => ({
          jogo_nome: jogo.jogo_nome,
          mercado: jogo.mercado,
          odd_leg: jogo.odd_leg
        })),
        {
          jogo_nome: jogoPivo,
          mercado: variacao.mercado,
          odd_leg: variacao.odd_leg
        }
      ];

      // Calcular odd total
      const oddTotal = jogosBase.reduce((acc, jogo) => acc * jogo.odd_leg, 1) * variacao.odd_leg;

      // Montar payload
      const payload = {
        valor_apostado: valorPorAposta,
        odd_total: oddTotal,
        nome_grupo: `Sistema ${jogoPivo}`,
        legs: legs
      };

      // Chamar API
      const response = await axios.post(`${BASE_URL}/apostas`, payload, { headers });
      apostasCriadas.push({
        variacao: i + 1,
        aposta_id: response.aposta_id,
        odd_total: oddTotal,
        valor_apostado: valorPorAposta,
        mercado: variacao.mercado
      });

      console.log(`   ✅ Aposta ${i + 1} criada:`, response.aposta_id);
      console.log(`      - Mercado: ${variacao.mercado}`);
      console.log(`      - Odd Total: ${oddTotal.toFixed(2)}`);
      console.log(`      - Valor: R$ ${valorPorAposta}`);
    }

    // 5. Verificar apostas criadas
    console.log('\n5. Verificando apostas criadas...');
    const apostasAtivasResponse = await axios.get(`${BASE_URL}/apostas-ativas`, { headers });
    console.log('✅ Apostas ativas:', apostasAtivasResponse.data.apostas.length);

    // Mostrar detalhes das apostas
    apostasAtivasResponse.data.apostas.forEach((aposta, index) => {
      console.log(`   ${index + 1}. ${aposta.nome_grupo}`);
      console.log(`      - Valor: R$ ${aposta.valor_apostado}`);
      console.log(`      - Odd Total: ${aposta.odd_total}`);
      console.log(`      - Legs: ${aposta.legs.length}`);
      console.log(`      - Legs: ${aposta.legs.map(leg => `${leg.jogo_nome} (${leg.mercado})`).join(', ')}`);
    });

    // 6. Verificar saldo após criação
    console.log('\n6. Verificando saldo após criação...');
    const saldoResponse = await axios.get(`${BASE_URL}/banca`, { headers });
    console.log('✅ Saldo atual:', saldoResponse.data.saldo_atual);
    
    const totalApostado = apostasCriadas.length * valorPorAposta;
    console.log('✅ Total apostado:', totalApostado);
    console.log('✅ Saldo esperado:', 1000 - totalApostado);

    // 7. Testar finalização de uma aposta
    console.log('\n7. Testando finalização de uma aposta...');
    const primeiraAposta = apostasAtivasResponse.data.apostas[0];
    
    // Atualizar todas as legs para GANHA
    for (const leg of primeiraAposta.legs) {
      await axios.put(`${BASE_URL}/legs/${leg.id}`, 
        { status_leg: 'GANHA' }, 
        { headers }
      );
      console.log(`   ✅ Leg "${leg.jogo_nome}" atualizada para GANHA`);
    }

    // Verificar se aposta foi finalizada
    const apostasAtivas2Response = await axios.get(`${BASE_URL}/apostas-ativas`, { headers });
    const apostasHistoricoResponse = await axios.get(`${BASE_URL}/apostas-historico`, { headers });
    
    console.log('✅ Apostas ativas:', apostasAtivas2Response.data.apostas.length);
    console.log('✅ Apostas no histórico:', apostasHistoricoResponse.data.apostas.length);

    // Verificar saldo após ganho
    const saldoFinalResponse = await axios.get(`${BASE_URL}/banca`, { headers });
    console.log('✅ Saldo final:', saldoFinalResponse.data.saldo_atual);

    console.log('\n🎉 Teste do Construtor concluído!');
    console.log('\n📊 Resumo:');
    console.log(`   - Sistema criado: ${apostasCriadas.length} apostas`);
    console.log(`   - Jogos base: ${jogosBase.length}`);
    console.log(`   - Variações: ${variacoes.length}`);
    console.log(`   - Valor por aposta: R$ ${valorPorAposta}`);
    console.log(`   - Total investido: R$ ${totalApostado}`);
    console.log(`   - Saldo final: R$ ${saldoFinalResponse.data.saldo_atual}`);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

// Executar teste
testarConstrutor();
