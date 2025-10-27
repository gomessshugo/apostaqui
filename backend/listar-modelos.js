const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

async function listarModelos() {
  try {
    console.log('🔍 Listando modelos disponíveis do Gemini...');
    
    const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    const models = await genAI.listModels();
    
    console.log('✅ Modelos disponíveis:');
    models.forEach(model => {
      console.log(`- ${model.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar modelos:', error.message);
  }
}

listarModelos();
