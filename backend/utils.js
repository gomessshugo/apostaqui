require('dotenv').config();
const { getDatabase } = require('./database');

/**
 * Incrementa o contador de requisições para um serviço específico
 * @param {string} servicoNome - Nome do serviço (ex: 'the_odds_api', 'football_data_api')
 */
async function incrementarContadorAPI(servicoNome) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    if (!db) {
      reject(new Error('Banco de dados não conectado'));
      return;
    }

    // Obter data de hoje no formato YYYY-MM-DD
    const hoje = new Date().toISOString().split('T')[0];
    
    console.log(`📊 Incrementando contador para ${servicoNome} em ${hoje}`);

    // Primeiro, inserir ou ignorar se já existe
    db.run(`
      INSERT OR IGNORE INTO APICount (servico, data, contagem) 
      VALUES (?, ?, 0)
    `, [servicoNome, hoje], (err) => {
      if (err) {
        console.error(`❌ Erro ao inserir contador para ${servicoNome}:`, err.message);
        reject(err);
        return;
      }

      // Depois, incrementar o contador
      db.run(`
        UPDATE APICount 
        SET contagem = contagem + 1 
        WHERE servico = ? AND data = ?
      `, [servicoNome, hoje], function(err) {
        if (err) {
          console.error(`❌ Erro ao incrementar contador para ${servicoNome}:`, err.message);
          reject(err);
        } else {
          console.log(`✅ Contador incrementado para ${servicoNome}: ${this.changes} registros atualizados`);
          resolve();
        }
      });
    });
  });
}

/**
 * Busca a contagem total de um serviço para o mês atual
 * @param {string} servicoNome - Nome do serviço
 * @returns {Promise<number>} Contagem total do mês
 */
async function buscarContagemMes(servicoNome) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    if (!db) {
      reject(new Error('Banco de dados não conectado'));
      return;
    }

    // Obter ano-mês atual (ex: 2025-10)
    const hoje = new Date();
    const anoMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    
    console.log(`📊 Buscando contagem de ${servicoNome} para ${anoMes}`);

    db.get(`
      SELECT SUM(contagem) as total 
      FROM APICount 
      WHERE servico = ? AND data LIKE ?
    `, [servicoNome, `${anoMes}-%`], (err, row) => {
      if (err) {
        console.error(`❌ Erro ao buscar contagem para ${servicoNome}:`, err.message);
        reject(err);
      } else {
        const total = row?.total || 0;
        console.log(`✅ Contagem total de ${servicoNome} em ${anoMes}: ${total}`);
        resolve(total);
      }
    });
  });
}

/**
 * Verifica se o limite de requisições foi atingido
 * @param {string} servicoNome - Nome do serviço
 * @param {number} limite - Limite máximo de requisições
 * @returns {Promise<boolean>} true se ainda pode fazer requisições
 */
async function verificarLimiteAPI(servicoNome, limite = 500) {
  try {
    const contagem = await buscarContagemMes(servicoNome);
    const podeFazerRequisicao = contagem < limite;
    
    console.log(`🔍 Verificação de limite ${servicoNome}: ${contagem}/${limite} (${podeFazerRequisicao ? '✅ Pode' : '❌ Limite atingido'})`);
    
    return podeFazerRequisicao;
  } catch (error) {
    console.error(`❌ Erro ao verificar limite para ${servicoNome}:`, error.message);
    return false; // Em caso de erro, não permite requisição
  }
}

module.exports = {
  incrementarContadorAPI,
  buscarContagemMes,
  verificarLimiteAPI
};
