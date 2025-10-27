const fetch = require('node-fetch');

async function testarGemini25() {
  try {
    console.log('🧪 Testando modelo gemini-2.5-flash...');
    
    const apiKey = 'AIzaSyCZH_ltlRJgduc6-BCXLKYGfxYfsRjV5q8';
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Olá, você está funcionando? Responda em português.'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Resposta completa:', JSON.stringify(result, null, 2));
      
      if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
        console.log('✅ Texto da resposta:', result.candidates[0].content.parts[0].text);
      } else {
        console.log('❌ Estrutura da resposta inesperada');
      }
    } else {
      console.log(`❌ Erro HTTP: ${response.status}`);
      const error = await response.text();
      console.log('Erro:', error);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarGemini25();
