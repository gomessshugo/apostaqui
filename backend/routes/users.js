const express = require('express');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../database/init');
const { authenticateToken, requirePremium } = require('../middleware/auth');

const router = express.Router();

// Obter perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    const user = await new Promise((resolve, reject) => {
      db.get(
        `SELECT id, username, email, full_name, phone, birth_date, is_premium, 
                premium_expires_at, created_at 
         FROM users WHERE id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        birthDate: user.birth_date,
        isPremium: user.is_premium,
        premiumExpiresAt: user.premium_expires_at,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar perfil do usuário
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone, birthDate } = req.body;
    const userId = req.user.id;
    const db = getDatabase();

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET full_name = ?, phone = ?, birth_date = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [fullName, phone, birthDate, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    res.json({ message: 'Perfil atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Alterar senha
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Senha atual e nova senha são obrigatórias' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Nova senha deve ter pelo menos 6 caracteres' 
      });
    }

    const db = getDatabase();

    // Buscar senha atual
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newPasswordHash, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    res.json({ message: 'Senha alterada com sucesso' });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter estatísticas do usuário
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    const stats = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM user_stats WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!stats) {
      return res.status(404).json({ error: 'Estatísticas não encontradas' });
    }

    res.json({
      stats: {
        totalBets: stats.total_bets,
        wonBets: stats.won_bets,
        lostBets: stats.lost_bets,
        totalStaked: stats.total_staked,
        totalWon: stats.total_won,
        totalLost: stats.total_lost,
        profitLoss: stats.profit_loss,
        winRate: stats.win_rate
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar para premium (simulação)
router.post('/upgrade-premium', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();

    // Simular upgrade para premium (30 dias)
    const premiumExpiresAt = new Date();
    premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET is_premium = 1, premium_expires_at = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [premiumExpiresAt.toISOString(), userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    res.json({ 
      message: 'Upgrade para premium realizado com sucesso',
      premiumExpiresAt: premiumExpiresAt.toISOString()
    });

  } catch (error) {
    console.error('Erro ao fazer upgrade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar conta
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({ error: 'Senha é obrigatória para deletar conta' });
    }

    const db = getDatabase();

    // Verificar senha
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Deletar dados relacionados
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM refresh_tokens WHERE user_id = ?', [userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM user_stats WHERE user_id = ?', [userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM bets WHERE user_id = ?', [userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Deletar usuário
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    res.json({ message: 'Conta deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
