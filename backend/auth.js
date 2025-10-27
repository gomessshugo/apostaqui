const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('./database');

// Chave secreta para JWT (em produção, use uma variável de ambiente)
const JWT_SECRET = 'sua-chave-secreta-super-segura';

// Função para registrar um novo usuário
async function registrarUsuario(email, senha) {
  try {
    const db = getDatabase();
    
    if (!db) {
      throw new Error('Banco de dados não conectado');
    }
    
    // Verificar se o usuário já existe
    const usuarioExistente = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM Usuarios WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (usuarioExistente) {
      throw new Error('Usuário já existe com este email');
    }

    // Hash da senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Inserir usuário no banco
    const usuarioId = await new Promise((resolve, reject) => {
      db.run('INSERT INTO Usuarios (email, senha_hash) VALUES (?, ?)', 
        [email, senhaHash], 
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Criar banca inicial para o usuário
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO Banca (usuario_id, saldo_atual) VALUES (?, ?)', 
        [usuarioId, 0], 
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Gerar token JWT
    const token = jwt.sign({ usuarioId, email }, JWT_SECRET, { expiresIn: '24h' });

    return {
      success: true,
      usuario: { id: usuarioId, email },
      token
    };

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
}

// Função para fazer login do usuário
async function loginUsuario(email, senha) {
  try {
    const db = getDatabase();
    
    if (!db) {
      throw new Error('Banco de dados não conectado');
    }

    // Buscar usuário no banco
    const usuario = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM Usuarios WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      throw new Error('Senha incorreta');
    }

    // Gerar token JWT
    const token = jwt.sign({ usuarioId: usuario.id, email }, JWT_SECRET, { expiresIn: '24h' });

    return {
      success: true,
      usuario: { id: usuario.id, email },
      token
    };

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

// Função para verificar token JWT
function verificarToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, usuario: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

module.exports = {
  registrarUsuario,
  loginUsuario,
  verificarToken
};
