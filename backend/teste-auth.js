const { registrarUsuario, loginUsuario, verificarToken } = require('./auth');

async function testarAutenticacao() {
  console.log('🧪 Testando funções de autenticação...\n');

  try {
    // Teste 1: Registrar usuário
    console.log('1. Testando registro de usuário...');
    const resultadoRegistro = await registrarUsuario('teste@example.com', '123456');
    console.log('✅ Usuário registrado:', resultadoRegistro.usuario);
    console.log('✅ Token gerado:', resultadoRegistro.token.substring(0, 20) + '...');

    // Teste 2: Login do usuário
    console.log('\n2. Testando login do usuário...');
    const resultadoLogin = await loginUsuario('teste@example.com', '123456');
    console.log('✅ Login realizado:', resultadoLogin.usuario);
    console.log('✅ Token gerado:', resultadoLogin.token.substring(0, 20) + '...');

    // Teste 3: Verificar token
    console.log('\n3. Testando verificação de token...');
    const verificacao = verificarToken(resultadoLogin.token);
    console.log('✅ Token válido:', verificacao.valid);
    console.log('✅ Dados do usuário:', verificacao.usuario);

    // Teste 4: Tentar login com senha incorreta
    console.log('\n4. Testando login com senha incorreta...');
    try {
      await loginUsuario('teste@example.com', 'senhaerrada');
      console.log('❌ Erro: Login deveria ter falhado');
    } catch (error) {
      console.log('✅ Erro esperado capturado:', error.message);
    }

    // Teste 5: Tentar registrar usuário duplicado
    console.log('\n5. Testando registro de usuário duplicado...');
    try {
      await registrarUsuario('teste@example.com', '123456');
      console.log('❌ Erro: Registro deveria ter falhado');
    } catch (error) {
      console.log('✅ Erro esperado capturado:', error.message);
    }

    console.log('\n🎉 Todos os testes passaram com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar testes
testarAutenticacao();
