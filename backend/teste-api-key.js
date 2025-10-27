const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testarAPIKey() {
  try {
    console.log('🔑 Testando API key do Gemini...');
    
    const genAI = new GoogleGenerativeAI('AIzaSyAC3dgTnmKzz130nkD1J6ls434Sr-B2tLg');
    
    // Tentar diferentes modelos
    const modelos = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-001',
      'gemini-1.5-pro',
      'gemini-1.5-pro-001',
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.0-pro',
      'gemini-1.0-pro-001',
      'gemini-1.0-pro-vision'
    ];
    
    for (const modelo of modelos) {
      try {
        console.log(`🧪 Testando modelo: ${modelo}`);
        const model = genAI.getGenerativeModel({ model: modelo });
        const result = await model.generateContent('Teste simples');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ Modelo ${modelo} funcionando!`);
        console.log(`📝 Resposta: ${text.substring(0, 100)}...`);
        return modelo;
      } catch (error) {
        console.log(`❌ Modelo ${modelo} não funciona: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarAPIKey();
