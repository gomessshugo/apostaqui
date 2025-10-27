require('dotenv').config();
const config = require('./config');

async function testarGeminiSimples() {
  try {
    console.log('🧪 Testando Gemini simples...');
    
    const prompt = 'Teste simples: responda apenas "Funcionando"';
    
    console.log('🧠 Enviando prompt para Gemini...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 Resposta completa:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      console.log('✅ Resposta do Gemini:', text);
    } else {
      console.log('❌ Estrutura de resposta inesperada');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste Gemini:', error.message);
  }
}

testarGeminiSimples();
