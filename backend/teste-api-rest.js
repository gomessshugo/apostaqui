const fetch = require('node-fetch');

async function testarModelos() {
  try {
    console.log('🔍 Testando modelos via API REST...');
    
    const apiKey = 'AIzaSyCZH_ltlRJgduc6-BCXLKYGfxYfsRjV5q8';
    
    // Listar modelos disponíveis
    console.log('📋 Listando modelos...');
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!listResponse.ok) {
      throw new Error(`HTTP error! status: ${listResponse.status}`);
    }
    
    const models = await listResponse.json();
    console.log('✅ Modelos disponíveis:');
    models.models.forEach(model => {
      console.log(`- ${model.name}`);
    });
    
    // Testar modelo gemini-pro
    console.log('\n🧪 Testando modelo gemini-pro...');
    const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Olá, você está funcionando?'
          }]
        }]
      })
    });
    
    if (testResponse.ok) {
      const result = await testResponse.json();
      console.log('✅ gemini-pro funcionando!');
      console.log('Resposta:', result.candidates[0].content.parts[0].text);
    } else {
      console.log(`❌ gemini-pro não funcionando: ${testResponse.status}`);
      const error = await testResponse.text();
      console.log('Erro:', error);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarModelos();
