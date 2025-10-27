const express = require('express');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../database/init');
const { 
  generateTokens, 
  saveRefreshToken, 
  verifyRefreshToken, 
  revokeRefreshToken,
  authenticateToken 
} = require('../middleware/auth');

const router = express.Router();

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, phone, birthDate } = req.body;

    // Validações básicas
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios: username, email e password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Senha deve ter pelo menos 6 caracteres' 
      });
    }

    const db = getDatabase();

    // Verificar se usuário já existe
    const existingUser = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Usuário ou email já cadastrado' 
      });
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Inserir usuário no banco
    const userId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (username, email, password_hash, full_name, phone, birth_date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, email, passwordHash, fullName, phone, birthDate],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Criar estatísticas iniciais do usuário
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO user_stats (user_id) VALUES (?)',
        [userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Buscar dados do usuário criado
    const newUser = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, email, full_name, is_premium FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(newUser);
    await saveRefreshToken(userId, refreshToken);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.full_name,
        isPremium: newUser.is_premium
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    const db = getDatabase();

    // Buscar usuário
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user);
    await saveRefreshToken(user.id, refreshToken);

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        isPremium: user.is_premium
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token necessário' });
    }

    // Verificar refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    
    const db = getDatabase();
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE id = ?',
        [decoded.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Gerar novos tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    await saveRefreshToken(user.id, newRefreshToken);
    await revokeRefreshToken(refreshToken);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Erro no refresh:', error);
    res.status(401).json({ error: 'Refresh token inválido' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      isPremium: req.user.is_premium
    }
  });
});

module.exports = router;
