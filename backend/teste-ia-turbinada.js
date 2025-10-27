const axios = require('axios');

async function testarIATurbinada() {
  try {
    console.log('🧪 Testando IA TURBINADA...');
    
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');
    
    // 2. Testar análise IA turbinada
    console.log('\n🤖 Testando POST /analise-ia TURBINADA...');
    const analiseResponse = await axios.post('http://localhost:3001/analise-ia', {
      timeA: 'Flamengo',
      timeB: 'Palmeiras',
      liga_id: '4329'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Análise IA turbinada recebida!');
    console.log('📊 Confronto:', analiseResponse.data.confronto);
    console.log('🎯 Fonte:', analiseResponse.data.fonte);
    
    // Mostrar dados estruturados
    if (analiseResponse.data.odds) {
      console.log('\n🎲 Odds Reais:');
      console.log(`   Casa: ${analiseResponse.data.odds.casa}`);
      console.log(`   Empate: ${analiseResponse.data.odds.empate}`);
      console.log(`   Visitante: ${analiseResponse.data.odds.visitante}`);
      console.log(`   Over 2.5: ${analiseResponse.data.odds.over25}`);
    }
    
    if (analiseResponse.data.tabela) {
      console.log('\n🏆 Dados da Tabela:');
      if (analiseResponse.data.tabela.timeA) {
        console.log(`   ${analiseResponse.data.tabela.timeA.time}: ${analiseResponse.data.tabela.timeA.posicao}º lugar, ${analiseResponse.data.tabela.timeA.pontos} pontos`);
      }
      if (analiseResponse.data.tabela.timeB) {
        console.log(`   ${analiseResponse.data.tabela.timeB.time}: ${analiseResponse.data.tabela.timeB.posicao}º lugar, ${analiseResponse.data.tabela.timeB.pontos} pontos`);
      }
    }
    
    if (analiseResponse.data.goleadores && analiseResponse.data.goleadores.length > 0) {
      console.log('\n⚽ Top Goleadores:');
      analiseResponse.data.goleadores.slice(0, 3).forEach(g => {
        console.log(`   ${g.posicao}º ${g.jogador} (${g.time}) - ${g.gols} gols`);
      });
    }
    
    if (analiseResponse.data.h2h) {
      console.log('\n🔄 Retrospecto H2H:');
      console.log(`   Total: ${analiseResponse.data.h2h.totalJogos} jogos`);
      console.log(`   Vitórias Flamengo: ${analiseResponse.data.h2h.vitoriasTimeA}`);
      console.log(`   Vitórias Palmeiras: ${analiseResponse.data.h2h.vitoriasTimeB}`);
      console.log(`   Empates: ${analiseResponse.data.h2h.empates}`);
    }
    
    console.log('\n🧠 Análise IA (primeiros 200 caracteres):');
    console.log(analiseResponse.data.analise.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarIATurbinada();
