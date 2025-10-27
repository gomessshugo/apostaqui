const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'apostas.db');

// Criar conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
  }
});

// Função para inicializar o banco de dados
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela de usuários
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100),
          phone VARCHAR(20),
          birth_date DATE,
          is_premium BOOLEAN DEFAULT 0,
          premium_expires_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de categorias de apostas
      db.run(`
        CREATE TABLE IF NOT EXISTS bet_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(50) NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de apostas
      db.run(`
        CREATE TABLE IF NOT EXISTS bets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          category_id INTEGER,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          stake_amount DECIMAL(10,2) NOT NULL,
          odds DECIMAL(8,2) NOT NULL,
          potential_return DECIMAL(10,2) NOT NULL,
          status TEXT CHECK(status IN ('pending', 'won', 'lost', 'cancelled')) DEFAULT 'pending',
          bet_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          result_date DATETIME,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (category_id) REFERENCES bet_categories (id)
        )
      `);

      // Tabela de estatísticas do usuário
      db.run(`
        CREATE TABLE IF NOT EXISTS user_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL,
          total_bets INTEGER DEFAULT 0,
          won_bets INTEGER DEFAULT 0,
          lost_bets INTEGER DEFAULT 0,
          total_staked DECIMAL(12,2) DEFAULT 0,
          total_won DECIMAL(12,2) DEFAULT 0,
          total_lost DECIMAL(12,2) DEFAULT 0,
          profit_loss DECIMAL(12,2) DEFAULT 0,
          win_rate DECIMAL(5,2) DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Tabela de tokens de refresh
      db.run(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token VARCHAR(255) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Inserir categorias padrão
      db.run(`
        INSERT OR IGNORE INTO bet_categories (name, description) VALUES
        ('Futebol', 'Apostas em jogos de futebol'),
        ('Basquete', 'Apostas em jogos de basquete'),
        ('Tênis', 'Apostas em jogos de tênis'),
        ('Vôlei', 'Apostas em jogos de vôlei'),
        ('Outros', 'Outras modalidades esportivas')
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao inserir categorias padrão:', err);
          reject(err);
        } else {
          console.log('✅ Banco de dados inicializado com sucesso');
          resolve();
        }
      });
    });
  });
};

// Função para obter a instância do banco
const getDatabase = () => db;

module.exports = {
  initializeDatabase,
  getDatabase
};
