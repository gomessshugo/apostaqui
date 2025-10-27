const axios = require('axios');

async function testarMercados() {
  try {
    console.log('🔍 Testando funcionalidade de Mercados...');
    
    // 1. Fazer login para obter token
    console.log('📝 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtido:', token.substring(0, 20) + '...');
    
    // 2. Testar endpoint de ligas
    console.log('\n🏆 Testando endpoint /ligas...');
    const ligasResponse = await axios.get('http://localhost:3001/ligas', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ligas encontradas:', ligasResponse.data.total);
    console.log('📋 Primeiras 3 ligas:');
    ligasResponse.data.ligas.slice(0, 3).forEach((liga, index) => {
      console.log(`  ${index + 1}. ${liga.strLeague} (ID: ${liga.idLeague})`);
    });
    
    // 3. Testar endpoint de jogos de uma liga específica
    if (ligasResponse.data.ligas.length > 0) {
      const primeiraLiga = ligasResponse.data.ligas[0];
      console.log(`\n⚽ Testando endpoint /jogos-da-liga/${primeiraLiga.idLeague}...`);
      
      const jogosResponse = await axios.get(`http://localhost:3001/jogos-da-liga/${primeiraLiga.idLeague}`, {
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
        
        // 4. Testar análise com IA para um jogo
        if (jogosResponse.data.jogos.length > 0) {
          const primeiroJogo = jogosResponse.data.jogos[0];
          console.log(`\n🤖 Testando análise com IA para: ${primeiroJogo.nome}...`);
          
          // Extrair nomes dos times
          const [timeA, timeB] = primeiroJogo.nome.split(' vs ');
          
          const iaResponse = await axios.post('http://localhost:3001/analise-ia', {
            timeA: timeA.trim(),
            timeB: timeB.trim()
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
        }
      } else {
        console.log('ℹ️ Nenhum jogo encontrado para esta liga');
      }
    }
    
    console.log('\n🎉 Todos os testes de Mercados passaram!');
    console.log('\n📱 Acesse o frontend em: http://localhost:5173');
    console.log('🔗 Navegue para: http://localhost:5173/mercados');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarMercados();
