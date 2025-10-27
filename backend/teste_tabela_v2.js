require('dotenv').config();
const axios = require('axios');

const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;

// ID da 'BSA' (Brasileirão Série A) que definimos
const LIGA_ID_FBDATA = 'BSA';

async function testarBuscaTabela() {
  if (!FOOTBALL_DATA_API_KEY) {
    console.error('❌ ERRO FATAL: Chave FOOTBALL_DATA_API_KEY não encontrada no .env');
    return;
  }
  
  console.log(`🔑 Usando Chave: ...${FOOTBALL_DATA_API_KEY.slice(-4)}`);
  console.log(`📡 Buscando tabela da liga: ${LIGA_ID_FBDATA}...`);

  try {
    // 1. FAZ A REQUISIÇÃO DA TABELA
    const response = await axios.get(`https://api.football-data.org/v4/competitions/${LIGA_ID_FBDATA}/standings`, {
      headers: {
        'X-Auth-Token': FOOTBALL_DATA_API_KEY
      }
    });

    console.log('✅ Sucesso! Tabela encontrada.');
    // Mostra os 3 primeiros da tabela
    console.log(JSON.stringify(response.data.standings[0].table.slice(0, 3), null, 2));
    
  } catch (error) {
    console.error('\n--- ❌ ERRO FATAL NA API DE TABELA ❌ ---');
    console.error('Status:', error.response?.status);
    console.error('Mensagem:', error.response?.data?.message);
  }
}

testarBuscaTabela();
