import axios from 'axios';

async function testarFrontend() {
  console.log('🧪 Testando integração frontend-backend...\n');

  try {
    // Teste 1: Verificar backend
    console.log('1. Verificando backend...');
    const backendResponse = await axios.get('http://localhost:3001');
    console.log('✅ Backend funcionando:', backendResponse.data.message);

    // Teste 2: Registrar usuário
    console.log('\n2. Registrando usuário para teste...');
    const registroResponse = await axios.post('http://localhost:3001/registrar', {
      email: 'teste@frontend.com',
      senha: '123456'
    });
    console.log('✅ Usuário registrado:', registroResponse.data.usuario.email);
    const token = registroResponse.data.token;

    // Teste 3: Definir saldo
    console.log('\n3. Definindo saldo da banca...');
    await axios.put('http://localhost:3001/banca', 
      { novo_saldo: 1000 }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Saldo definido para R$ 1000');

    // Teste 4: Criar aposta
    console.log('\n4. Criando aposta para teste...');
    const apostaResponse = await axios.post('http://localhost:3001/apostas', {
      valor_apostado: 100,
      odd_total: 2.5,
      nome_grupo: 'Teste Frontend',
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
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('✅ Aposta criada:', apostaResponse.data.aposta_id);

    // Teste 5: Listar apostas ativas
    console.log('\n5. Listando apostas ativas...');
    const apostasResponse = await axios.get('http://localhost:3001/apostas-ativas', 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Apostas ativas:', apostasResponse.data.apostas.length);
    
    if (apostasResponse.data.apostas.length > 0) {
      const aposta = apostasResponse.data.apostas[0];
      console.log('   - Nome:', aposta.nome_grupo);
      console.log('   - Valor:', aposta.valor_apostado);
      console.log('   - Odd Total:', aposta.odd_total);
      console.log('   - Legs:', aposta.legs.length);
    }

    console.log('\n🎉 Backend pronto para o frontend!');
    console.log('\n📱 Acesse o frontend em: http://localhost:5173');
    console.log('📊 Use as credenciais: teste@frontend.com / 123456');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testarFrontend();
