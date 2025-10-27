const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listarModelos() {
  try {
    console.log('🔍 Listando modelos disponíveis...');
    
    const genAI = new GoogleGenerativeAI('AIzaSyCZH_ltlRJgduc6-BCXLKYGfxYfsRjV5q8');
    
    // Tentar listar modelos
    const models = await genAI.listModels();
    console.log('📋 Modelos disponíveis:');
    models.forEach(model => {
      console.log(`- ${model.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar modelos:', error.message);
  }
}

listarModelos();
