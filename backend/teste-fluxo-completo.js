const axios = require('axios');

async function testarFluxoCompleto() {
  try {
    console.log('🔍 Testando fluxo completo: Mercados → Construtor...');
    
    // 1. Fazer login para obter token
    console.log('📝 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtido:', token.substring(0, 20) + '...');
    
    // 2. Testar endpoint de ligas (filtradas)
    console.log('\n🏆 Testando ligas filtradas...');
    const ligasResponse = await axios.get('http://localhost:3001/ligas', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ligas encontradas:', ligasResponse.data.total);
    
    // 3. Testar endpoint de jogos de uma liga específica
    const ligaId = '4328'; // Premier League
    console.log(`\n⚽ Testando jogos da liga ${ligaId}...`);
    
    const jogosResponse = await axios.get(`http://localhost:3001/jogos-da-liga/${ligaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Jogos encontrados:', jogosResponse.data.total);
    if (jogosResponse.data.jogos.length > 0) {
      console.log('📋 Primeiros 3 jogos:');
      jogosResponse.data.jogos.slice(0, 3).forEach((jogo, index) => {
        console.log(`  ${index + 1}. ${jogo.nome} - ${jogo.data}`);
      });
    }
    
    // 4. Simular cesta de palpites
    console.log('\n🛒 Simulando cesta de palpites...');
    const cestaPalpites = [
      {
        idUnico: 'jogo1-1',
        jogo_nome: 'Manchester City vs Liverpool (2024-01-15)',
        mercado: 'Manchester City Vence',
        odd_leg: 1.80
      },
      {
        idUnico: 'jogo2-x',
        jogo_nome: 'Arsenal vs Chelsea (2024-01-15)',
        mercado: 'Empate',
        odd_leg: 3.20
      },
      {
        idUnico: 'jogo3-o25',
        jogo_nome: 'Tottenham vs Newcastle (2024-01-15)',
        mercado: 'Over 2.5 Gols',
        odd_leg: 1.90
      }
    ];
    
    console.log('✅ Cesta simulada criada com', cestaPalpites.length, 'palpites');
    cestaPalpites.forEach((palpite, index) => {
      console.log(`  ${index + 1}. ${palpite.mercado} - ${palpite.jogo_nome}`);
    });
    
    // 5. Testar criação de apostas com a cesta
    console.log('\n🎯 Testando criação de apostas com cesta...');
    
    // Simular dados para o construtor
    const dadosConstrutor = {
      valor_apostado: 10,
      odd_total: 10.94, // 1.80 * 3.20 * 1.90
      nome_grupo: 'Sistema Premier League',
      legs: cestaPalpites.map(palpite => ({
        jogo_nome: palpite.jogo_nome,
        mercado: palpite.mercado,
        odd_leg: palpite.odd_leg
      }))
    };
    
    console.log('📊 Dados do construtor:');
    console.log(`  Valor apostado: R$ ${dadosConstrutor.valor_apostado}`);
    console.log(`  Odd total: ${dadosConstrutor.odd_total}`);
    console.log(`  Nome do grupo: ${dadosConstrutor.nome_grupo}`);
    console.log(`  Número de legs: ${dadosConstrutor.legs.length}`);
    
    // 6. Testar análise com IA
    console.log('\n🤖 Testando análise com IA...');
    const iaResponse = await axios.post('http://localhost:3001/analise-ia', {
      timeA: 'Manchester City',
      timeB: 'Liverpool'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Análise da IA obtida!');
    console.log('📝 Resumo da análise:');
    const analise = iaResponse.data.analise;
    const resumo = analise.substring(0, 200) + '...';
    console.log(`  ${resumo}`);
    
    console.log('\n🎉 Fluxo completo testado com sucesso!');
    console.log('\n📱 Acesse o frontend em: http://localhost:5173');
    console.log('🔗 Navegue para: http://localhost:5173/mercados');
    console.log('🎯 Teste o fluxo: Mercados → Adicionar palpites → Construtor');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarFluxoCompleto();
