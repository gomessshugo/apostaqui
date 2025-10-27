const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'sua-chave-refresh-super-segura';

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar se o usuário é premium
const requirePremium = (req, res, next) => {
  if (!req.user.is_premium) {
    return res.status(403).json({ 
      error: 'Acesso negado', 
      message: 'Esta funcionalidade requer conta premium' 
    });
  }
  next();
};

// Função para gerar tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      is_premium: user.is_premium 
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Função para salvar refresh token no banco
const saveRefreshToken = (userId, refreshToken) => {
  const db = getDatabase();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, refreshToken, expiresAt.toISOString()],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

// Função para verificar refresh token
const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};

// Função para revogar refresh token
const revokeRefreshToken = (refreshToken) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM refresh_tokens WHERE token = ?',
      [refreshToken],
      function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
};

module.exports = {
  authenticateToken,
  requirePremium,
  generateTokens,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  JWT_SECRET,
  JWT_REFRESH_SECRET
};
