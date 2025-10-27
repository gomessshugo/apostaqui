const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o arquivo do banco de dados
const dbPath = path.join(__dirname, 'gestor_apostas.db');

let db;

// Função para conectar ao banco de dados
function conectarBanco() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erro ao conectar com o banco de dados:', err.message);
        reject(err);
      } else {
        console.log('✅ Conectado ao banco de dados SQLite');
        resolve();
      }
    });
  });
}

// Função para criar as tabelas iniciais
function criarTabelasIniciais() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela Usuarios
      db.run(`
        CREATE TABLE IF NOT EXISTS Usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          senha_hash TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela Usuarios:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabela Usuarios criada/verificada');
        }
      });

      // Tabela Banca
      db.run(`
        CREATE TABLE IF NOT EXISTS Banca (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          saldo_atual REAL DEFAULT 0,
          FOREIGN KEY(usuario_id) REFERENCES Usuarios(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela Banca:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabela Banca criada/verificada');
        }
      });

      // Tabela Apostas
      db.run(`
        CREATE TABLE IF NOT EXISTS Apostas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          nome_grupo TEXT NOT NULL,
          valor_apostado REAL NOT NULL,
          odd_total REAL NOT NULL,
          status TEXT DEFAULT 'PENDENTE',
          FOREIGN KEY(usuario_id) REFERENCES Usuarios(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela Apostas:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabela Apostas criada/verificada');
        }
      });

      // Tabela Legs
      db.run(`
        CREATE TABLE IF NOT EXISTS Legs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aposta_id INTEGER NOT NULL,
          jogo_nome TEXT NOT NULL,
          mercado TEXT NOT NULL,
          odd_leg REAL NOT NULL,
          status_leg TEXT DEFAULT 'PENDENTE',
          FOREIGN KEY(aposta_id) REFERENCES Apostas(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela Legs:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabela Legs criada/verificada');
        }
      });

      // Tabela APICount - Contador de requisições
      db.run(`
        CREATE TABLE IF NOT EXISTS APICount (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          servico TEXT NOT NULL,
          data TEXT NOT NULL,
          contagem INTEGER DEFAULT 0,
          UNIQUE(servico, data)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela APICount:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabela APICount criada/verificada');
          resolve(); // Resolve quando todas as tabelas foram criadas
        }
      });
    });
  });
}

// Função para obter a instância do banco
function getDatabase() {
  return db;
}

// Função crítica para verificar se uma aposta está completa
async function verificarApostaCompleta(apostaId) {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('Banco de dados não conectado');
    }

    // Buscar todas as legs da aposta
    const legs = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Legs WHERE aposta_id = ?', [apostaId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (legs.length === 0) {
      console.log('⚠️ Aposta sem legs encontrada');
      return;
    }

    // Verificar se qualquer leg está PERDIDA
    const temPerdida = legs.some(leg => leg.status_leg === 'PERDIDA');
    if (temPerdida) {
      console.log('❌ Aposta perdida - uma ou mais legs perderam');
      await new Promise((resolve, reject) => {
        db.run('UPDATE Apostas SET status = ? WHERE id = ?', 
          ['PERDIDA', apostaId], 
          function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          }
        );
      });
      return;
    }

    // Verificar se todas as legs estão GANHA
    const todasGanharam = legs.every(leg => leg.status_leg === 'GANHA');
    if (todasGanharam) {
      console.log('✅ Aposta ganha - todas as legs venceram');
      
      // Buscar dados da aposta
      const aposta = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM Apostas WHERE id = ?', [apostaId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!aposta) {
        console.log('⚠️ Aposta não encontrada');
        return;
      }

      // Calcular prêmio
      const premio = aposta.valor_apostado * aposta.odd_total;
      console.log(`💰 Prêmio calculado: R$ ${premio.toFixed(2)}`);

      // Atualizar status da aposta
      await new Promise((resolve, reject) => {
        db.run('UPDATE Apostas SET status = ? WHERE id = ?', 
          ['GANHA', apostaId], 
          function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          }
        );
      });

      // Adicionar prêmio à banca
      await new Promise((resolve, reject) => {
        db.run('UPDATE Banca SET saldo_atual = saldo_atual + ? WHERE usuario_id = ?', 
          [premio, aposta.usuario_id], 
          function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          }
        );
      });

      console.log(`🎉 Prêmio de R$ ${premio.toFixed(2)} adicionado à banca do usuário ${aposta.usuario_id}`);
    } else {
      console.log('⏳ Aposta ainda pendente - há legs não finalizadas');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar aposta completa:', error);
    throw error;
  }
}

module.exports = {
  conectarBanco,
  criarTabelasIniciais,
  getDatabase,
  verificarApostaCompleta
};
