async function testarAPIRest() {
  try {
    console.log('🔑 Testando API REST do Gemini...');
    
    const apiKey = 'AIzaSyAC3dgTnmKzz130nkD1J6ls434Sr-B2tLg';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
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
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erro:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ IA REAL funcionando!');
    console.log('📝 Resposta:', data.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarAPIRest();
