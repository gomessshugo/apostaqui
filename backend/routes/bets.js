const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateToken, requirePremium } = require('../middleware/auth');

const router = express.Router();

// Obter todas as apostas do usuário
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const userId = req.user.id;
    const db = getDatabase();

    let query = `
      SELECT b.*, bc.name as category_name 
      FROM bets b 
      LEFT JOIN bet_categories bc ON b.category_id = bc.id 
      WHERE b.user_id = ?
    `;
    const params = [userId];

    // Filtros
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND b.category_id = ?';
      params.push(category);
    }

    query += ' ORDER BY b.created_at DESC';

    // Paginação
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const bets = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Contar total de apostas
    let countQuery = 'SELECT COUNT(*) as total FROM bets WHERE user_id = ?';
    const countParams = [userId];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (category) {
      countQuery += ' AND category_id = ?';
      countParams.push(category);
    }

    const totalResult = await new Promise((resolve, reject) => {
      db.get(countQuery, countParams, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      bets: bets.map(bet => ({
        id: bet.id,
        title: bet.title,
        description: bet.description,
        stakeAmount: bet.stake_amount,
        odds: bet.odds,
        potentialReturn: bet.potential_return,
        status: bet.status,
        betDate: bet.bet_date,
        resultDate: bet.result_date,
        notes: bet.notes,
        category: {
          id: bet.category_id,
          name: bet.category_name
        },
        createdAt: bet.created_at,
        updatedAt: bet.updated_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        pages: Math.ceil(totalResult.total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar apostas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter uma aposta específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const db = getDatabase();

    const bet = await new Promise((resolve, reject) => {
      db.get(
        `SELECT b.*, bc.name as category_name 
         FROM bets b 
         LEFT JOIN bet_categories bc ON b.category_id = bc.id 
         WHERE b.id = ? AND b.user_id = ?`,
        [id, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!bet) {
      return res.status(404).json({ error: 'Aposta não encontrada' });
    }

    res.json({
      bet: {
        id: bet.id,
        title: bet.title,
        description: bet.description,
        stakeAmount: bet.stake_amount,
        odds: bet.odds,
        potentialReturn: bet.potential_return,
        status: bet.status,
        betDate: bet.bet_date,
        resultDate: bet.result_date,
        notes: bet.notes,
        category: {
          id: bet.category_id,
          name: bet.category_name
        },
        createdAt: bet.created_at,
        updatedAt: bet.updated_at
      }
    });

  } catch (error) {
    console.error('Erro ao buscar aposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova aposta
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      stakeAmount, 
      odds, 
      categoryId, 
      notes 
    } = req.body;

    // Validações
    if (!title || !stakeAmount || !odds) {
      return res.status(400).json({ 
        error: 'Título, valor da aposta e odds são obrigatórios' 
      });
    }

    if (stakeAmount <= 0) {
      return res.status(400).json({ 
        error: 'Valor da aposta deve ser maior que zero' 
      });
    }

    if (odds <= 1) {
      return res.status(400).json({ 
        error: 'Odds devem ser maiores que 1' 
      });
    }

    const userId = req.user.id;
    const potentialReturn = stakeAmount * odds;
    const db = getDatabase();

    const betId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO bets (user_id, category_id, title, description, stake_amount, odds, potential_return, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, categoryId, title, description, stakeAmount, odds, potentialReturn, notes],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Atualizar estatísticas do usuário
    await updateUserStats(userId, db);

    res.status(201).json({
      message: 'Aposta criada com sucesso',
      betId
    });

  } catch (error) {
    console.error('Erro ao criar aposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar aposta
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      stakeAmount, 
      odds, 
      categoryId, 
      notes 
    } = req.body;
    const userId = req.user.id;
    const db = getDatabase();

    // Verificar se a aposta pertence ao usuário
    const existingBet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM bets WHERE id = ? AND user_id = ?',
        [id, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!existingBet) {
      return res.status(404).json({ error: 'Aposta não encontrada' });
    }

    if (existingBet.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Apenas apostas pendentes podem ser editadas' 
      });
    }

    const potentialReturn = stakeAmount * odds;

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE bets SET 
         title = ?, description = ?, stake_amount = ?, odds = ?, 
         potential_return = ?, category_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND user_id = ?`,
        [title, description, stakeAmount, odds, potentialReturn, categoryId, notes, id, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    res.json({ message: 'Aposta atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar aposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar resultado da aposta
router.put('/:id/result', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resultDate, notes } = req.body;
    const userId = req.user.id;
    const db = getDatabase();

    if (!['won', 'lost', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status deve ser: won, lost ou cancelled' 
      });
    }

    // Verificar se a aposta pertence ao usuário
    const existingBet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM bets WHERE id = ? AND user_id = ?',
        [id, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!existingBet) {
      return res.status(404).json({ error: 'Aposta não encontrada' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE bets SET status = ?, result_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND user_id = ?`,
        [status, resultDate, notes, id, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    // Atualizar estatísticas do usuário
    await updateUserStats(userId, db);

    res.json({ message: 'Resultado da aposta atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar resultado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar aposta
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const db = getDatabase();

    // Verificar se a aposta pertence ao usuário
    const existingBet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM bets WHERE id = ? AND user_id = ?',
        [id, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!existingBet) {
      return res.status(404).json({ error: 'Aposta não encontrada' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM bets WHERE id = ? AND user_id = ?',
        [id, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    // Atualizar estatísticas do usuário
    await updateUserStats(userId, db);

    res.json({ message: 'Aposta deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar aposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter categorias de apostas
router.get('/categories/list', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();

    const categories = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM bet_categories WHERE is_active = 1 ORDER BY name',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para atualizar estatísticas do usuário
async function updateUserStats(userId, db) {
  try {
    // Buscar estatísticas atuais
    const stats = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
         COUNT(*) as total_bets,
         SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won_bets,
         SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost_bets,
         SUM(stake_amount) as total_staked,
         SUM(CASE WHEN status = 'won' THEN potential_return ELSE 0 END) as total_won,
         SUM(CASE WHEN status = 'lost' THEN stake_amount ELSE 0 END) as total_lost
         FROM bets WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const profitLoss = stats.total_won - stats.total_lost;
    const winRate = stats.total_bets > 0 ? (stats.won_bets / stats.total_bets) * 100 : 0;

    // Atualizar estatísticas
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE user_stats SET 
         total_bets = ?, won_bets = ?, lost_bets = ?, total_staked = ?, 
         total_won = ?, total_lost = ?, profit_loss = ?, win_rate = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [
          stats.total_bets, stats.won_bets, stats.lost_bets, stats.total_staked,
          stats.total_won, stats.total_lost, profitLoss, winRate, userId
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
}

module.exports = router;
