const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testarAPIKeySimples() {
  try {
    console.log('🔑 Testando API key do Gemini de forma simples...');
    
    const genAI = new GoogleGenerativeAI('AIzaSyAC3dgTnmKzz130nkD1J6ls434Sr-B2tLg');
    
    // Tentar o modelo mais básico
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    console.log('🧪 Enviando prompt simples...');
    const result = await model.generateContent('Olá, você está funcionando?');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ IA REAL funcionando!');
    console.log('📝 Resposta:', text);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Tentar com modelo diferente
    try {
      console.log('🔄 Tentando modelo alternativo...');
      const genAI = new GoogleGenerativeAI('AIzaSyAC3dgTnmKzz130nkD1J6ls434Sr-B2tLg');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent('Teste');
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ IA REAL funcionando com modelo alternativo!');
      console.log('📝 Resposta:', text);
      
    } catch (error2) {
      console.error('❌ Erro no modelo alternativo:', error2.message);
    }
  }
}

testarAPIKeySimples();