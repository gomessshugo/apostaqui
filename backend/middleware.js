const { verificarToken } = require('./auth');

// Middleware para verificar token JWT
function verificarTokenMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorização não fornecido'
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token não encontrado'
      });
    }

    const resultado = verificarToken(token);
    
    if (!resultado.valid) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }

    // Adicionar dados do usuário ao request
    req.usuario = resultado.usuario;
    next();
    
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

module.exports = {
  verificarTokenMiddleware
};
