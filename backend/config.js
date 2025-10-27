// Configuração de variáveis de ambiente
require('dotenv').config();

const config = {
  // Google AI Studio API Key
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  
  // Football-Data.org API Key
  FOOTBALL_DATA_API_KEY: process.env.FOOTBALL_DATA_API_KEY,
  
  // The Odds API Key
  THE_ODDS_API_KEY: process.env.THE_ODDS_API_KEY,
  
  // JWT Secret
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Porta do servidor
  PORT: process.env.PORT || 3001
};

module.exports = config;