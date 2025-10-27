const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testarNovaAPI() {
  try {
    console.log('🔑 Testando NOVA API key do Gemini...');
    
    const genAI = new GoogleGenerativeAI('AIzaSyCZH_ltlRJgduc6-BCXLKYGfxYfsRjV5q8');
    
    // Tentar o modelo mais básico que deve funcionar
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    console.log('🧪 Enviando prompt de teste...');
    const result = await model.generateContent('Olá, você está funcionando? Responda em português.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ IA REAL funcionando!');
    console.log('📝 Resposta:', text);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Tentar com modelo alternativo
    try {
      console.log('🔄 Tentando modelo alternativo...');
      const genAI = new GoogleGenerativeAI('AIzaSyCZH_ltlRJgduc6-BCXLKYGfxYfsRjV5q8');
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

testarNovaAPI();
