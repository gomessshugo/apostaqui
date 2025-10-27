const axios = require('axios');

async function testarMercadosCorrigido() {
  try {
    console.log('🔍 Testando Mercados com estrutura corrigida...');
    
    // 1. Fazer login para obter token
    console.log('📝 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtido:', token.substring(0, 20) + '...');
    
    // 2. Testar endpoint de jogos de uma liga específica
    const ligaId = '4328'; // Premier League
    console.log(`\n⚽ Testando jogos da liga ${ligaId}...`);
    
    const jogosResponse = await axios.get(`http://localhost:3001/jogos-da-liga/${ligaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta da API:');
    console.log('  - success:', jogosResponse.data.success);
    console.log('  - total:', jogosResponse.data.total);
    console.log('  - ligaId:', jogosResponse.data.ligaId);
    
    if (jogosResponse.data.jogos && jogosResponse.data.jogos.length > 0) {
      console.log('✅ Jogos encontrados:', jogosResponse.data.jogos.length);
      console.log('📋 Estrutura do primeiro jogo:');
      const primeiroJogo = jogosResponse.data.jogos[0];
      console.log('  - idJogo:', primeiroJogo.idJogo);
      console.log('  - nome:', primeiroJogo.nome);
      console.log('  - data:', primeiroJogo.data);
      console.log('  - hora:', primeiroJogo.hora);
      console.log('  - timeCasa:', primeiroJogo.timeCasa);
      console.log('  - timeVisitante:', primeiroJogo.timeVisitante);
      console.log('  - liga:', primeiroJogo.liga);
      
      console.log('\n📋 Primeiros 3 jogos:');
      jogosResponse.data.jogos.slice(0, 3).forEach((jogo, index) => {
        console.log(`  ${index + 1}. ${jogo.nome} - ${jogo.data}`);
      });
    } else {
      console.log('❌ Nenhum jogo encontrado ou estrutura incorreta');
      console.log('📊 Dados recebidos:', JSON.stringify(jogosResponse.data, null, 2));
    }
    
    console.log('\n🎉 Teste de estrutura concluído!');
    console.log('\n📱 Acesse o frontend em: http://localhost:5173/mercados');
    console.log('🔗 Selecione a Premier League (4328) para testar');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarMercadosCorrigido();
