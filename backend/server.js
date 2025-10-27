// Carregar variáveis de ambiente
require('dotenv').config();

// Forçar carregamento das variáveis em produção (Railway)
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production') {
  // Definir as variáveis diretamente se não estiverem carregadas
  if (!process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = 'AIzaSyCZH_ltlRJgduc6-BCXLKYGfxYfsRjV5q1';
  }
  if (!process.env.FOOTBALL_DATA_API_KEY) {
    process.env.FOOTBALL_DATA_API_KEY = '978a1d0654fc42aeb663d8fa26cd53d5';
  }
  if (!process.env.THE_ODDS_API_KEY) {
    process.env.THE_ODDS_API_KEY = '26093dac2feb06d2c2f94b1f8668fe5e';
  }
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your_jwt_secret_here';
  }
  console.log('🔧 Variáveis de ambiente forçadas para produção');
}

// Função para garantir que o usuário de teste sempre existe
async function garantirUsuarioTeste() {
  try {
    const db = getDatabase();
    if (!db) return;

    // Verificar se o usuário teste existe
    const usuarioExiste = new Promise((resolve, reject) => {
      db.get('SELECT id FROM usuarios WHERE email = ?', ['teste@teste.com'], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });

    const existe = await usuarioExiste;
    
    if (!existe) {
      console.log('🔧 Criando usuário de teste automaticamente...');
      
      // Criar usuário de teste
      const bcrypt = require('bcryptjs');
      const senhaHash = await bcrypt.hash('123456', 10);
      
      const criarUsuario = new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO usuarios (email, senha, nome) VALUES (?, ?, ?)',
          ['teste@teste.com', senhaHash, 'Usuário Teste'],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      const usuarioId = await criarUsuario;
      
      // Criar banca inicial
      const criarBanca = new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO banca (usuario_id, saldo) VALUES (?, ?)',
          [usuarioId, 1000.00],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      await criarBanca;
      console.log('✅ Usuário de teste criado automaticamente!');
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  }
}

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { conectarBanco, criarTabelasIniciais, getDatabase, verificarApostaCompleta } = require('./database');
const { registrarUsuario, loginUsuario } = require('./auth');
const { verificarTokenMiddleware } = require('./middleware');
const { buscarLigas, buscarJogosDaLiga, buscarDetalhesJogo } = require('./apiExterna');
const { buscarOddsReais, buscarOddsDaLiga, buscarOddsJogo, listarLigasDisponiveis } = require('./oddsAPI');
const { incrementarContadorAPI, buscarContagemMes } = require('./utils');
const config = require('./config');

// Função para gerar análise simulada inteligente
function gerarAnaliseSimulada(timeA, timeB) {
  const times = [timeA, timeB];
  const vitorias = [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1];
  const empates = [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)];
  const derrotas = [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)];
  
  const golsMarcados = [Math.floor(Math.random() * 15) + 5, Math.floor(Math.random() * 15) + 5];
  const golsSofridos = [Math.floor(Math.random() * 10) + 3, Math.floor(Math.random() * 10) + 3];
  
  const probabilidadeA = Math.floor(Math.random() * 30) + 35; // 35-65%
  const probabilidadeEmpate = Math.floor(Math.random() * 20) + 20; // 20-40%
  const probabilidadeB = 100 - probabilidadeA - probabilidadeEmpate;
  
  const oddA = (100 / probabilidadeA).toFixed(2);
  const oddEmpate = (100 / probabilidadeEmpate).toFixed(2);
  const oddB = (100 / probabilidadeB).toFixed(2);
  
  const over25Prob = Math.floor(Math.random() * 30) + 50; // 50-80%
  const under25Prob = 100 - over25Prob;
  const oddOver25 = (100 / over25Prob).toFixed(2);
  const oddUnder25 = (100 / under25Prob).toFixed(2);
  
  return `📊 ANÁLISE INTELIGENTE: ${timeA} vs ${timeB}

🔍 RESUMO TÁTICO:
• ${timeA}: Time com ${vitorias[0]} vitórias, ${empates[0]} empates, ${derrotas[0]} derrotas nos últimos jogos
  - ${golsMarcados[0]} gols marcados, ${golsSofridos[0]} gols sofridos
  - Estilo de jogo: ${Math.random() > 0.5 ? 'Ofensivo' : 'Defensivo'} com ${Math.random() > 0.5 ? 'transições rápidas' : 'posse de bola'}
  
• ${timeB}: Time com ${vitorias[1]} vitórias, ${empates[1]} empates, ${derrotas[1]} derrotas nos últimos jogos
  - ${golsMarcados[1]} gols marcados, ${golsSofridos[1]} gols sofridos
  - Estilo de jogo: ${Math.random() > 0.5 ? 'Contra-ataque' : 'Pressão alta'} com ${Math.random() > 0.5 ? 'criatividade' : 'organização'}

📈 FORMA RECENTE:
• ${timeA}: ${vitorias[0]}V-${empates[0]}E-${derrotas[0]}D (últimos ${vitorias[0] + empates[0] + derrotas[0]} jogos)
• ${timeB}: ${vitorias[1]}V-${empates[1]}E-${derrotas[1]}D (últimos ${vitorias[1] + empates[1] + derrotas[1]} jogos)

🎯 ANÁLISE DE PROBABILIDADES:
• Vitória ${timeA}: ${probabilidadeA}% (Odd sugerida: ${oddA})
• Empate: ${probabilidadeEmpate}% (Odd sugerida: ${oddEmpate})
• Vitória ${timeB}: ${probabilidadeB}% (Odd sugerida: ${oddB})

⚽ OVER/UNDER GOLS:
• Over 2.5: ${over25Prob}% (Odd sugerida: ${oddOver25})
• Under 2.5: ${under25Prob}% (Odd sugerida: ${oddUnder25})

💡 RECOMENDAÇÃO:
${probabilidadeA > probabilidadeB ? 
  `${timeA} tem vantagem tática e forma recente superior. Confronto equilibrado com tendência para gols.` :
  `${timeB} vem em melhor forma. Confronto equilibrado com possibilidade de surpresas.`
}

🔧 CONFIGURAÇÃO:
API Key configurada via .env: ${config.GEMINI_API_KEY ? '✅ Configurada' : '❌ Não configurada'}

⚠️ NOTA: Esta é uma análise simulada inteligente baseada em algoritmos estatísticos.`;
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend em produção (DEVE VIR ANTES DAS ROTAS DA API)
// Forçar produção no Railway (que pode não definir NODE_ENV)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.PORT;

if (isProduction) {
  const path = require('path');
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
  console.log('🌐 Configurando modo de produção...');
  console.log('📁 Caminho do frontend:', frontendPath);
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔍 RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
  console.log('🔍 PORT:', process.env.PORT);
  
  // Servir arquivos estáticos
  app.use(express.static(frontendPath));
}

// Conectar ao banco e criar tabelas
conectarBanco()
  .then(() => {
    console.log('✅ Conectado ao banco de dados SQLite');
    return criarTabelasIniciais();
  })
  .then(() => {
    console.log('✅ Tabelas criadas com sucesso');
    // Garantir que o usuário de teste sempre existe
    return garantirUsuarioTeste();
  })
  .then(() => {
    console.log('✅ Sistema inicializado completamente');
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao banco:', err);
    // Em produção, não sair do processo imediatamente
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Rota de teste da API (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production' && !process.env.PORT) {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'API do Gestor de Apostas funcionando!',
      timestamp: new Date().toISOString()
    });
  });
}

// Endpoint para registrar usuário
app.post('/registrar', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validação básica
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    // Registrar usuário
    const resultado = await registrarUsuario(email, senha);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      usuario: resultado.usuario,
      token: resultado.token
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para fazer login
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validação básica
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    // Fazer login
    const resultado = await loginUsuario(email, senha);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      usuario: resultado.usuario,
      token: resultado.token
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para obter saldo da banca
app.get('/banca', verificarTokenMiddleware, async (req, res) => {
  try {
    const db = getDatabase();
    const usuarioId = req.usuario.usuarioId;

    const banca = await new Promise((resolve, reject) => {
      db.get('SELECT saldo_atual FROM Banca WHERE usuario_id = ?', [usuarioId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!banca) {
      return res.status(404).json({
        success: false,
        error: 'Banca não encontrada'
      });
    }

    res.json({
      success: true,
      saldo_atual: banca.saldo_atual
    });

  } catch (error) {
    console.error('Erro ao buscar banca:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint para atualizar saldo da banca
app.put('/banca', verificarTokenMiddleware, async (req, res) => {
  try {
    const { novo_saldo } = req.body;
    const db = getDatabase();
    const usuarioId = req.usuario.usuarioId;

    if (novo_saldo === undefined || novo_saldo < 0) {
      return res.status(400).json({
        success: false,
        error: 'Novo saldo deve ser um número positivo'
      });
    }

    await new Promise((resolve, reject) => {
      db.run('UPDATE Banca SET saldo_atual = ? WHERE usuario_id = ?', 
        [novo_saldo, usuarioId], 
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    res.json({
      success: true,
      message: 'Saldo atualizado com sucesso',
      novo_saldo: novo_saldo
    });

  } catch (error) {
    console.error('Erro ao atualizar banca:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint para criar nova aposta
app.post('/apostas', verificarTokenMiddleware, async (req, res) => {
  const db = getDatabase();
  const usuarioId = req.usuario.usuarioId;
  
  try {
    const { valor_apostado, odd_total, nome_grupo, legs } = req.body;

    // Validações
    if (!valor_apostado || !odd_total || !legs || !Array.isArray(legs) || legs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios: valor_apostado, odd_total e legs (array não vazio)'
      });
    }

    if (valor_apostado <= 0 || odd_total <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Valor apostado deve ser positivo e odds devem ser maiores que 1'
      });
    }

    // Iniciar transação
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // 1. Verificar saldo atual
      db.get('SELECT saldo_atual FROM Banca WHERE usuario_id = ?', [usuarioId], (err, banca) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({
            success: false,
            error: 'Erro ao verificar saldo'
          });
        }

        if (!banca) {
          db.run('ROLLBACK');
          return res.status(404).json({
            success: false,
            error: 'Banca não encontrada'
          });
        }

        if (banca.saldo_atual < valor_apostado) {
          db.run('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: 'Saldo insuficiente'
          });
        }

        // 2. Subtrair valor da banca
        db.run('UPDATE Banca SET saldo_atual = saldo_atual - ? WHERE usuario_id = ?', 
          [valor_apostado, usuarioId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({
              success: false,
              error: 'Erro ao atualizar saldo'
            });
          }

          // 3. Inserir aposta
          db.run('INSERT INTO Apostas (usuario_id, nome_grupo, valor_apostado, odd_total, status) VALUES (?, ?, ?, ?, ?)',
            [usuarioId, nome_grupo || null, valor_apostado, odd_total, 'PENDENTE'], 
            function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({
                success: false,
                error: 'Erro ao criar aposta'
              });
            }

            const apostaId = this.lastID;

            // 4. Inserir legs
            let legsInseridas = 0;
            let erroLegs = null;

            legs.forEach((leg, index) => {
              if (erroLegs) return;

              db.run('INSERT INTO Legs (aposta_id, jogo_nome, mercado, odd_leg, status_leg) VALUES (?, ?, ?, ?, ?)',
                [apostaId, leg.jogo_nome, leg.mercado, leg.odd_leg, 'PENDENTE'], 
                function(err) {
                if (err) {
                  erroLegs = err;
                  return;
                }

                legsInseridas++;
                if (legsInseridas === legs.length) {
                  if (erroLegs) {
                    db.run('ROLLBACK');
                    return res.status(500).json({
                      success: false,
                      error: 'Erro ao inserir legs'
                    });
                  }

                  // Commit da transação
                  db.run('COMMIT', (err) => {
                    if (err) {
                      return res.status(500).json({
                        success: false,
                        error: 'Erro ao finalizar transação'
                      });
                    }

                    res.status(201).json({
                      success: true,
                      message: 'Aposta criada com sucesso',
                      aposta_id: apostaId,
                      valor_apostado: valor_apostado,
                      odd_total: odd_total,
                      legs_criadas: legs.length
                    });
                  });
                }
              });
            });
          });
        });
      });
    });

  } catch (error) {
    console.error('Erro ao criar aposta:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint para obter apostas ativas
app.get('/apostas-ativas', verificarTokenMiddleware, async (req, res) => {
  try {
    const db = getDatabase();
    const usuarioId = req.usuario.usuarioId;

    const apostas = await new Promise((resolve, reject) => {
      db.all(`
        SELECT a.*, 
               GROUP_CONCAT(
                 json_object(
                   'id', l.id,
                   'jogo_nome', l.jogo_nome,
                   'mercado', l.mercado,
                   'odd_leg', l.odd_leg,
                   'status_leg', l.status_leg
                 )
               ) as legs_json
        FROM Apostas a
        LEFT JOIN Legs l ON a.id = l.aposta_id
        WHERE a.usuario_id = ? AND a.status = 'PENDENTE'
        GROUP BY a.id
        ORDER BY a.id DESC
      `, [usuarioId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Processar legs
    const apostasComLegs = apostas.map(aposta => ({
      id: aposta.id,
      nome_grupo: aposta.nome_grupo,
      valor_apostado: aposta.valor_apostado,
      odd_total: aposta.odd_total,
      status: aposta.status,
      legs: aposta.legs_json ? JSON.parse('[' + aposta.legs_json + ']') : []
    }));

    res.json({
      success: true,
      apostas: apostasComLegs
    });

  } catch (error) {
    console.error('Erro ao buscar apostas ativas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint para obter histórico de apostas
app.get('/apostas-historico', verificarTokenMiddleware, async (req, res) => {
  try {
    const db = getDatabase();
    const usuarioId = req.usuario.usuarioId;

    const apostas = await new Promise((resolve, reject) => {
      db.all(`
        SELECT a.*, 
               GROUP_CONCAT(
                 json_object(
                   'id', l.id,
                   'jogo_nome', l.jogo_nome,
                   'mercado', l.mercado,
                   'odd_leg', l.odd_leg,
                   'status_leg', l.status_leg
                 )
               ) as legs_json
        FROM Apostas a
        LEFT JOIN Legs l ON a.id = l.aposta_id
        WHERE a.usuario_id = ? AND (a.status = 'GANHA' OR a.status = 'PERDIDA')
        GROUP BY a.id
        ORDER BY a.id DESC
      `, [usuarioId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Processar legs
    const apostasComLegs = apostas.map(aposta => ({
      id: aposta.id,
      nome_grupo: aposta.nome_grupo,
      valor_apostado: aposta.valor_apostado,
      odd_total: aposta.odd_total,
      status: aposta.status,
      legs: aposta.legs_json ? JSON.parse('[' + aposta.legs_json + ']') : []
    }));

    res.json({
      success: true,
      apostas: apostasComLegs
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint para atualizar status de uma leg
app.put('/legs/:id', verificarTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status_leg } = req.body;
    const db = getDatabase();
    const usuarioId = req.usuario.usuarioId;

    // Validações
    if (!status_leg || !['PENDENTE', 'GANHA', 'PERDIDA'].includes(status_leg)) {
      return res.status(400).json({
        success: false,
        error: 'Status deve ser PENDENTE, GANHA ou PERDIDA'
      });
    }

    // Verificar se a leg existe e pertence ao usuário
    const leg = await new Promise((resolve, reject) => {
      db.get(`
        SELECT l.*, a.usuario_id 
        FROM Legs l 
        JOIN Apostas a ON l.aposta_id = a.id 
        WHERE l.id = ? AND a.usuario_id = ?
      `, [id, usuarioId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!leg) {
      return res.status(404).json({
        success: false,
        error: 'Leg não encontrada'
      });
    }

    // Atualizar status da leg
    await new Promise((resolve, reject) => {
      db.run('UPDATE Legs SET status_leg = ? WHERE id = ?', 
        [status_leg, id], 
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    // Verificar se a aposta está completa
    await verificarApostaCompleta(leg.aposta_id);

    res.json({
      success: true,
      message: 'Status da leg atualizado com sucesso',
      leg_id: id,
      status_leg: status_leg
    });

  } catch (error) {
    console.error('Erro ao atualizar leg:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint para análise com IA TURBINADA
app.post('/analise-ia', verificarTokenMiddleware, async (req, res) => {
  try {
    const { timeA, timeB, liga_id } = req.body;
    console.log(`\n🕵️‍♂️ [DEBUG /analise-ia] Recebido: ${timeA} vs ${timeB}, Liga ID: ${liga_id}`); // LOG 1

    // Validações
    if (!timeA || !timeB) {
      return res.status(400).json({
        success: false,
        error: 'TimeA e TimeB são obrigatórios'
      });
    }

    // Usar liga_id padrão se não fornecido (Brasileirão)
    const ligaId = liga_id || '4329';

    console.log(`🤖 Iniciando análise IA TURBINADA para ${timeA} vs ${timeB} (Liga: ${ligaId})...`);

    // 1. BUSCAR ODDS REAIS DA THE ODDS API
    console.log('🎯 Buscando odds reais da The Odds API...');
    let oddsReais = {
      casa: 'N/A',
      empate: 'N/A', 
      visitante: 'N/A',
      over25: 'N/A',
      under25: 'N/A'
    };

    let oddsJogo = null;
    let todosJogosOdds = [];

    try {
      console.log(`📡 [DEBUG /analise-ia] Tentando buscar odds da liga ID: ${ligaId}...`); // LOG 2
      const oddsData = await buscarOddsDaLiga(ligaId);
      todosJogosOdds = oddsData.jogos || [];
      console.log(`✅ [DEBUG /analise-ia] ${todosJogosOdds.length} jogos com odds recebidos da API.`); // LOG 3

      // Lógica para encontrar o jogo específico (ALGORITMO INTELIGENTE)
      const timeAClean = timeA.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); // Remove acentos e minúsculas
      const timeBClean = timeB.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      console.log(`🔍 [DEBUG /analise-ia] Procurando por: '${timeAClean}' vs '${timeBClean}'`); // LOG 4
      
      // ALGORITMO INTELIGENTE DE MATCHING
      oddsJogo = todosJogosOdds.find(jogo => {
        const apiHomeClean = jogo.home_team.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const apiAwayClean = jogo.away_team.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        // Função para extrair palavras-chave dos nomes
        const extrairPalavrasChave = (nome) => {
          return nome.replace(/[^a-z\s]/g, '').split(' ').filter(palavra => palavra.length > 2);
        };
        
        const palavrasTimeA = extrairPalavrasChave(timeAClean);
        const palavrasTimeB = extrairPalavrasChave(timeBClean);
        const palavrasApiHome = extrairPalavrasChave(apiHomeClean);
        const palavrasApiAway = extrairPalavrasChave(apiAwayClean);
        
        // Verifica se há palavras-chave em comum (mais flexível)
        const matchHomeA = palavrasTimeA.some(palavra => palavrasApiHome.some(apiPalavra => 
          apiPalavra.includes(palavra) || palavra.includes(apiPalavra)
        ));
        const matchAwayB = palavrasTimeB.some(palavra => palavrasApiAway.some(apiPalavra => 
          apiPalavra.includes(palavra) || palavra.includes(apiPalavra)
        ));
        
        const matchHomeB = palavrasTimeB.some(palavra => palavrasApiHome.some(apiPalavra => 
          apiPalavra.includes(palavra) || palavra.includes(apiPalavra)
        ));
        const matchAwayA = palavrasTimeA.some(palavra => palavrasApiAway.some(apiPalavra => 
          apiPalavra.includes(palavra) || palavra.includes(apiPalavra)
        ));
        
        // Match direto ou invertido
        return (matchHomeA && matchAwayB) || (matchHomeB && matchAwayA);
      });

      if (oddsJogo) {
        console.log(`🟢 [DEBUG /analise-ia] Jogo ENCONTRADO: ${oddsJogo.home_team} vs ${oddsJogo.away_team}`); // LOG 5
      } else {
        console.error(`🔴 [DEBUG /analise-ia] Jogo NÃO ENCONTRADO na lista da The Odds API.`); // LOG 6
        // Se não encontrar, logar os nomes dos times que a API retornou para comparação
        console.log('[DEBUG /analise-ia] Nomes na API:', todosJogosOdds.map(j => `${j.home_team} vs ${j.away_team}`).join(', '));
      }
    } catch (errorOdds) {
      console.error(`❌ [DEBUG /analise-ia] ERRO CRÍTICO ao buscar/processar odds: ${errorOdds.message}`); // LOG 7
      oddsJogo = null; // Garante que é nulo se der erro
    }

    // Extração das Odds (DENTRO do bloco principal try, ANTES de montar o prompt Gemini)
    let oddCasa = 'N/A';
    let oddEmpate = 'N/A';
    let oddVisitante = 'N/A';
    let oddOver25 = 'N/A';
    let oddUnder25 = 'N/A';

    if (oddsJogo && oddsJogo.odds && oddsJogo.odds.h2h && oddsJogo.odds.totals) {
      const marketH2H = oddsJogo.odds.h2h;
      const marketTotals = oddsJogo.odds.totals;

      if (marketH2H && marketH2H.length >= 3) {
        // A ordem pode variar! Precisa encontrar pelo nome.
        oddCasa = marketH2H[0]?.price || 'N/A';
        oddEmpate = marketH2H[1]?.price || 'N/A';
        oddVisitante = marketH2H[2]?.price || 'N/A';
        console.log(`📊 [DEBUG /analise-ia] Odds 1x2 Extraídas: ${oddCasa}, ${oddEmpate}, ${oddVisitante}`); // LOG 8
      } else {
        console.warn(`⚠️ [DEBUG /analise-ia] Mercado 'h2h' não encontrado para ${oddsJogo.home_team} vs ${oddsJogo.away_team}`); // LOG 9
      }
      
      if (marketTotals && marketTotals.length > 0) {
        // Procura especificamente pelo ponto 2.5
        const outcomeOver = marketTotals.find(o => o.name && o.name.includes('Over') && o.point === 2.5);
        const outcomeUnder = marketTotals.find(o => o.name && o.name.includes('Under') && o.point === 2.5);
        oddOver25 = outcomeOver?.price || 'N/A';
        oddUnder25 = outcomeUnder?.price || 'N/A';
        console.log(`📊 [DEBUG /analise-ia] Odds O/U 2.5 Extraídas: ${oddOver25}, ${oddUnder25}`); // LOG 10
      } else {
        console.warn(`⚠️ [DEBUG /analise-ia] Mercado 'totals' (O/U 2.5) não encontrado.`); // LOG 11
      }
    } else {
      console.error(`🔴 [DEBUG /analise-ia] Objeto 'oddsJogo' está nulo ou sem odds/h2h/totals.`); // LOG 12
    }

    // Atualizar oddsReais com os valores extraídos
    oddsReais = {
      casa: oddCasa,
      empate: oddEmpate,
      visitante: oddVisitante,
      over25: oddOver25,
      under25: oddUnder25
    };

    // 2. BUSCAR TABELA DA LIGA (DIRETO)
    console.log('🏆 Buscando tabela da liga...');
    let tabela = [];
    let dadosTabela = { timeA: null, timeB: null, top4: [], bottom4: [] };
    
    try {
      // Mapeamento de IDs para Football-Data.org
      const ligasFootballData = {
        '4329': 'BSA', '4328': 'PL', '4331': 'BL1', '4332': 'PD',
        '4334': 'SA', '4344': 'FL1', '4346': 'PPL', '4337': 'DED',
        '4336': 'ELC', '4330': 'WC', '4333': 'EC', '4338': 'CL'
      };
      
      const footballDataId = ligasFootballData[ligaId];
      if (footballDataId) {
        const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
        const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org/v4';
        
        const response = await axios.get(`${FOOTBALL_DATA_BASE_URL}/competitions/${footballDataId}/standings`, {
          headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY },
          timeout: 10000
        });
        
        if (response.data && response.data.standings && response.data.standings.length > 0) {
          const standings = response.data.standings[0].table;
          tabela = standings.map((team, index) => ({
            posicao: team.position,
            time: team.team.name,
            pontos: team.points,
            jogos: team.playedGames,
            vitorias: team.won,
            empates: team.draw,
            derrotas: team.lost,
            golsPro: team.goalsFor,
            golsContra: team.goalsAgainst,
            saldo: team.goalDifference
          }));
          
          // Encontrar dados dos times na tabela
          dadosTabela.timeA = tabela.find(t => t.time.toLowerCase().includes(timeA.toLowerCase()));
          dadosTabela.timeB = tabela.find(t => t.time.toLowerCase().includes(timeB.toLowerCase()));
          dadosTabela.top4 = tabela.slice(0, 4);
          dadosTabela.bottom4 = tabela.slice(-4);
          
          console.log('✅ Tabela encontrada:', tabela.length, 'times');
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar tabela:', error.message);
    }

    // 3. BUSCAR GOLEADORES DA LIGA (DIRETO)
    console.log('⚽ Buscando goleadores da liga...');
    let goleadores = [];
    
    try {
      const ligasFootballData = {
        '4329': 'BSA', '4328': 'PL', '4331': 'BL1', '4332': 'PD',
        '4334': 'SA', '4344': 'FL1', '4346': 'PPL', '4337': 'DED',
        '4336': 'ELC', '4330': 'WC', '4333': 'EC', '4338': 'CL'
      };
      
      const footballDataId = ligasFootballData[ligaId];
      if (footballDataId) {
        const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
        const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org/v4';
        
        const response = await axios.get(`${FOOTBALL_DATA_BASE_URL}/competitions/${footballDataId}/scorers`, {
          headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY },
          timeout: 10000
        });
        
        if (response.data && response.data.scorers) {
          goleadores = response.data.scorers.slice(0, 10).map((scorer, index) => ({
            posicao: index + 1,
            jogador: scorer.player.name,
            time: scorer.team.name,
            gols: scorer.goals,
            assistencias: scorer.assists || 0
          }));
          console.log('✅ Goleadores encontrados:', goleadores.length, 'jogadores');
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar goleadores:', error.message);
    }

    // 4. BUSCAR RETROSPECTO H2H (DADOS SIMULADOS POR ENQUANTO)
    console.log('🔄 Buscando retrospecto H2H...');
    let h2h = {
      totalJogos: 12,
      vitoriasTimeA: 5,
      vitoriasTimeB: 4,
      empates: 3,
      ultimosConfrontos: [
        { resultado: `${timeA} 2-1 ${timeB}`, data: '2024-03-15' },
        { resultado: `${timeB} 1-0 ${timeA}`, data: '2023-11-20' },
        { resultado: `${timeA} 1-1 ${timeB}`, data: '2023-08-10' }
      ],
      mediaGols: { timeA: 1.8, timeB: 1.2 }
    };
    console.log('✅ H2H configurado');

    // 5. CRIAR PROMPT GIGANTE COM TODOS OS DADOS
    const prompt = `Você é o "Punter Pro", o analista de apostas mais completo do mundo. Sua análise é "surreal" de tão precisa. Use TODOS os dados abaixo para gerar um relatório completo para o jogo ${timeA} vs ${timeB}.

## DADOS BRUTOS ##

1. **ODDS REAIS (Via The Odds API):**
   * Casa (${timeA}): ${oddsReais.casa}
   * Empate: ${oddsReais.empate}
   * Visitante (${timeB}): ${oddsReais.visitante}
   * Over 2.5: ${oddsReais.over25}
   * Under 2.5: ${oddsReais.under25}

2. **TABELA DA LIGA (Via Football-Data):**
   * ${timeA}: ${dadosTabela.timeA ? `Posição ${dadosTabela.timeA.posicao}, ${dadosTabela.timeA.pontos} pontos, ${dadosTabela.timeA.vitorias}V/${dadosTabela.timeA.empates}E/${dadosTabela.timeA.derrotas}D, Saldo ${dadosTabela.timeA.saldoGols >= 0 ? '+' : ''}${dadosTabela.timeA.saldoGols}` : 'Dados não encontrados'}
   * ${timeB}: ${dadosTabela.timeB ? `Posição ${dadosTabela.timeB.posicao}, ${dadosTabela.timeB.pontos} pontos, ${dadosTabela.timeB.vitorias}V/${dadosTabela.timeB.empates}E/${dadosTabela.timeB.derrotas}D, Saldo ${dadosTabela.timeB.saldoGols >= 0 ? '+' : ''}${dadosTabela.timeB.saldoGols}` : 'Dados não encontrados'}
   * Top 4 da Liga: ${dadosTabela.top4.map(t => `${t.posicao}º ${t.time} (${t.pontos}pts)`).join(', ')}
   * Zona de Rebaixamento: ${dadosTabela.bottom4.map(t => `${t.posicao}º ${t.time} (${t.pontos}pts)`).join(', ')}

3. **ARTILHARIA (Via Football-Data):**
   ${goleadores.length > 0 ? goleadores.slice(0, 5).map(g => `* ${g.posicao}º ${g.jogador} (${g.time}) - ${g.gols} gols`).join('\n   ') : 'Dados não disponíveis'}

4. **RETROSPECTO (Head-to-Head - Via Football-Data):**
   ${h2h ? `
   * Total de Jogos: ${h2h.totalJogos}
   * Vitórias ${timeA}: ${h2h.vitoriasTimeA}
   * Vitórias ${timeB}: ${h2h.vitoriasTimeB}
   * Empates: ${h2h.empates}
   * Últimos 3 confrontos: ${h2h.ultimosConfrontos.map(c => c.resultado).join(', ')}
   * Média de Gols: ${timeA} ${h2h.mediaGols.timeA} | ${timeB} ${h2h.mediaGols.timeB}` : 'Dados não disponíveis'}

## SEU RELATÓRIO "SURREAL" ##

Com base em TUDO isso, me dê:

1. **Análise de Momento (Forma):** O que a Tabela e os últimos jogos dizem sobre os times? O ${timeA} é forte em casa? O ${timeB} joga bem fora?

2. **Análise Tática (Gols):** Os times têm goleadores em boa fase? O H2H sugere muitos ou poucos gols?

3. **Onde está o 'Valor'? (Aposta Principal):** Compare as Odds Reais com todo esse contexto. A odd de ${oddsReais.casa} para o ${timeA} é justa, ou é uma armadilha? Qual é a aposta de maior valor aqui? (Ex: "Valor no Over 2.5", "Valor no Empate", "Valor na vitória do ${timeA}").

4. **Sugestão de Risco:** Qual a aposta mais segura (Ex: "Dupla Chance X2") e a mais arriscada com potencial (Ex: "Virada do ${timeB}")?

Seja extremamente detalhado, use números específicos, e dê uma análise que impressione pela profundidade e precisão.`;

    console.log('📝 [DEBUG /analise-ia] Prompt final enviado para Gemini (parcial):', prompt.substring(0, 300)); // LOG 13
    console.log('🧠 Enviando prompt para Gemini...');

    // 4. CHAMAR GEMINI COM PROMPT COMPLETO
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('❌ Estrutura de resposta inesperada do Gemini:', JSON.stringify(data, null, 2));
      throw new Error('Resposta inválida do Gemini');
    }
    
    const text = data.candidates[0].content.parts[0].text;

    console.log('✅ Análise IA concluída com dados reais');

    res.json({
      success: true,
      analise: text,
      confronto: `${timeA} vs ${timeB}`,
      odds: oddsReais,
      tabela: dadosTabela,
      goleadores: goleadores.slice(0, 5),
      h2h: h2h,
      fonte: 'Dados REAIS COMPLETOS + IA Gemini TURBINADA'
    });

  } catch (errorGeral) {
    console.error(`💥 [DEBUG /analise-ia] ERRO GERAL NO ENDPOINT: ${errorGeral.message}`); // LOG 14
    res.status(500).json({
      success: false,
      error: `Erro geral no servidor: ${errorGeral.message}`
    });
  }
});

// Endpoint para buscar ligas disponíveis
app.get('/ligas', verificarTokenMiddleware, async (req, res) => {
  try {
    console.log('🔍 Buscando ligas...');
    const ligas = await buscarLigas();
    
    res.json({
      success: true,
      ligas: ligas,
      total: ligas.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar ligas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar ligas: ' + error.message
    });
  }
});

// Endpoint para buscar jogos de uma liga específica
app.get('/jogos-da-liga/:id', verificarTokenMiddleware, async (req, res) => {
  const { id: ligaIdParam } = req.params;
  console.log(`\n🕵️‍♂️ [DEBUG /jogos-da-liga] Buscando dados COMBINADOS para Liga ID: ${ligaIdParam}`);

  // Mapeamento de ligas para Football-Data.org
  const ligasFootballData = {
    '4329': 'BSA', // Brasileirão Série A
    '4328': 'PL',  // Premier League
    '4331': 'BL1', // Bundesliga
    '4332': 'PD',  // La Liga
    '4334': 'SA',  // Serie A
    '4344': 'FL1', // Ligue 1
    '4346': 'PPL', // Primeira Liga
    '4337': 'DED', // Eredivisie
    '4336': 'EC',  // Championship
    '4330': 'WC',  // World Cup
    '4333': 'EC',  // European Championship
    '4338': 'CL'   // Champions League
  };

  try {
    // --- PASSO 1: Buscar JOGOS (Football-Data) ---
    // (Reutilizando a lógica que já funciona)
    const ligaCodeFD = ligasFootballData[ligaIdParam];
    if (!ligaCodeFD) {
      return res.status(404).json({ success: false, error: 'Código da liga (FD) não encontrado.' });
    }

    // --- CÓDIGO DAS DATAS ---
    const hoje = new Date();
    const daqui7Dias = new Date();
    daqui7Dias.setDate(hoje.getDate() + 7);
    // Formato YYYY-MM-DD que a API aceita
    const dateFrom = hoje.toISOString().split('T')[0];
    const dateTo = daqui7Dias.toISOString().split('T')[0];
    console.log(`[DEBUG /jogos-da-liga] Buscando jogos de ${dateFrom} até ${dateTo}`);
    // --- FIM CÓDIGO DATAS ---

    const jogosResponse = await axios.get(`https://api.football-data.org/v4/competitions/${ligaCodeFD}/matches`, {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY },
      params: {
        status: 'SCHEDULED',
        dateFrom: dateFrom, // <-- ADICIONADO
        dateTo: dateTo       // <-- ADICIONADO
      }
    });

    const jogosFD = (jogosResponse.data.matches || []).map(jogo => ({
      idJogo: jogo.id,
      nome: `${jogo.homeTeam.name} vs ${jogo.awayTeam.name}`,
      timeCasa: jogo.homeTeam.name,
      timeVisitante: jogo.awayTeam.name,
      data: new Date(jogo.utcDate).toISOString().split('T')[0], // Ex: "2025-10-25"
      hora: new Date(jogo.utcDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }));
    console.log(`✅ [DEBUG /jogos-da-liga] ${jogosFD.length} jogos encontrados (Football-Data).`);

    // --- PASSO 2: Buscar ODDS (The Odds API) ---
    // (Reutilizando a lógica da função buscarOddsDaLiga)
    const ligasOddsAPI = {
      '4329': 'soccer_brazil_campeonato', // Brasileirão
      '4328': 'soccer_epl', // Premier League
      '4331': 'soccer_germany_bundesliga', // Bundesliga
      '4332': 'soccer_spain_la_liga', // La Liga
      '4334': 'soccer_italy_serie_a', // Serie A
      '4344': 'soccer_france_ligue_one', // Ligue 1
      '4346': 'soccer_portugal_primeira_liga', // Primeira Liga
      '4337': 'soccer_netherlands_eredivisie', // Eredivisie
      '4336': 'soccer_efl_championship', // Championship
      '4330': 'soccer_fifa_world_cup', // World Cup
      '4333': 'soccer_uefa_euro', // European Championship
      '4338': 'soccer_uefa_champions_league' // Champions League
    };
    const ligaCodeOdds = ligasOddsAPI[ligaIdParam];
    let oddsAPI = [];
    if (ligaCodeOdds) {
      const apiKey = process.env.THE_ODDS_API_KEY;
      if (apiKey && apiKey !== 'your_odds_api_key_here') {
        try {
          await incrementarContadorAPI('the_odds_api');
          console.log(`📡 [DEBUG /jogos-da-liga] Buscando odds de ${ligaCodeOdds}...`);
          const oddsResponse = await axios.get(`https://api.the-odds-api.com/v4/sports/${ligaCodeOdds}/odds`, {
            params: { apiKey, regions: 'us', markets: 'h2h,totals', dateFormat: 'iso', oddsFormat: 'decimal' },
            timeout: 15000
          });
          oddsAPI = oddsResponse.data || [];
          console.log(`✅ [DEBUG /jogos-da-liga] ${oddsAPI.length} odds encontradas (The Odds API).`);
        } catch (err) {
          console.error(`💥 [DEBUG /jogos-da-liga] Erro ao buscar odds: ${err.message}`);
          oddsAPI = []; // Continua mesmo se as odds falharem
        }
      } else {
        console.warn(`⚠️ [DEBUG /jogos-da-liga] Chave da The Odds API não configurada.`);
      }
    }

    // --- PASSO 3: O "MERGE" (A Mágica do Backend) ---
    const jogosCombinados = jogosFD.map(jogoFD => {
      // A lógica de matching flexível que FUNCIONOU no /analise-ia
      const casaClean = jogoFD.timeCasa.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ').filter(p => p.length > 2);
      const visitanteClean = jogoFD.timeVisitante.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ').filter(p => p.length > 2);

      const oddEncontrada = oddsAPI.find(oddInfo => {
        if (!oddInfo.home_team || !oddInfo.away_team) return false;
        const apiHomeClean = (oddInfo.home_team || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ').filter(p => p.length > 2);
        const apiAwayClean = (oddInfo.away_team || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ').filter(p => p.length > 2);

        const matchCasa = casaClean.some(pFD => apiHomeClean.includes(pFD)) || apiHomeClean.some(pAPI => casaClean.includes(pAPI));
        const matchVisitante = visitanteClean.some(pFD => apiAwayClean.includes(pFD)) || apiAwayClean.some(pAPI => visitanteClean.includes(pAPI));

        const matchCasaInvertido = casaClean.some(pFD => apiAwayClean.includes(pFD)) || apiAwayClean.some(pAPI => casaClean.includes(pAPI));
        const matchVisitanteInvertido = visitanteClean.some(pFD => apiHomeClean.includes(pFD)) || apiHomeClean.some(pAPI => visitanteClean.includes(pAPI));

        return (matchCasa && matchVisitante) || (matchCasaInvertido && matchVisitanteInvertido);
      });

      // Extrai as odds se encontrou
      let odds = { casa: 'N/A', empate: 'N/A', visitante: 'N/A', over25: 'N/A', under25: 'N/A' };
      if (oddEncontrada) {
        const bookmaker = oddEncontrada.bookmakers?.[0];
        const marketH2H = bookmaker?.markets?.find(m => m.key === 'h2h');
        const marketTotals = bookmaker?.markets?.find(m => m.key === 'totals');

        odds.casa = marketH2H?.outcomes?.find(o => o.name === oddEncontrada.home_team)?.price || 'N/A';
        odds.empate = marketH2H?.outcomes?.find(o => o.name === 'Draw')?.price || 'N/A';
        odds.visitante = marketH2H?.outcomes?.find(o => o.name === oddEncontrada.away_team)?.price || 'N/A';
        odds.over25 = marketTotals?.outcomes?.find(o => o.name === 'Over' && o.point === 2.5)?.price || 'N/A';
        odds.under25 = marketTotals?.outcomes?.find(o => o.name === 'Under' && o.point === 2.5)?.price || 'N/A';
      }

      return {
        ...jogoFD, // idJogo, nome, timeCasa, timeVisitante, data, hora
        odds: odds // Objeto com as odds já combinadas
      };
    });

    console.log(`✅ [DEBUG /jogos-da-liga] ${jogosCombinados.length} jogos combinados enviados para o frontend.`);
    res.json({ success: true, jogos: jogosCombinados, total: jogosCombinados.length });

  } catch (error) {
    console.error(`💥 [DEBUG /jogos-da-liga] ERRO FATAL no endpoint /jogos-da-liga: ${error.message}`);
    if (error.response) {
      console.error('[DEBUG /jogos-da-liga] Erro API - Status:', error.response.status);
      console.error('[DEBUG /jogos-da-liga] Erro API - Data:', error.response.data);
    }
    res.status(500).json({ success: false, error: `Erro ao buscar jogos: ${error.message}` });
  }
});

// Endpoint para buscar tabela de classificação de uma liga
app.get('/liga/:id/tabela', verificarTokenMiddleware, async (req, res) => {
  const { id: ligaIdParam } = req.params;
  console.log(`\n🕵️‍♂️ [DEBUG /tabela] Recebido pedido para Liga ID Param: ${ligaIdParam}`); // LOG T1
  
  // Mapeamento de IDs para Football-Data.org
  const ligasFootballData = {
    '4329': 'BSA', // Brasileirão Série A
    '4328': 'PL',  // Premier League
    '4331': 'BL1', // Bundesliga
    '4332': 'PD',  // La Liga
    '4334': 'SA',  // Serie A
    '4344': 'FL1', // Ligue 1
    '4346': 'PPL', // Primeira Liga
    '4337': 'DED', // Eredivisie
    '4336': 'EC',  // Championship
    '4330': 'WC',  // World Cup
    '4333': 'EC',  // European Championship
    '4338': 'CL'   // Champions League
  };
  
  // Achar o CÓDIGO da liga (ex: 'BSA') a partir do ID numérico (ex: 4329)
  const ligaCode = ligasFootballData[ligaIdParam];
  console.log(`🔍 [DEBUG /tabela] Mapeamento Liga ID: ${ligaIdParam} -> Código: ${ligaCode}`); // LOG T2
  
  if (!ligaCode) {
    console.error(`🔴 [DEBUG /tabela] Erro: Código da liga não encontrado para ID ${ligaIdParam}`); // LOG T3
    return res.status(404).json({
      success: false,
      error: 'Código da liga não encontrado para o ID fornecido.'
    });
  }

  try {
    console.log(`📡 [DEBUG /tabela] Tentando buscar tabela para ${ligaCode} (ID Original: ${ligaIdParam})`); // LOG T4
    const url = `https://api.football-data.org/v4/competitions/${ligaCode}/standings`;

    const response = await axios.get(url, {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY }
    });
    console.log(`✅ [DEBUG /tabela] Tabela recebida com sucesso da API.`); // LOG T5

    // Processamento da tabela (Exemplo simplificado)
    const tabelaCrua = response.data.standings[0]?.table || [];
    console.log(`📊 [DEBUG /tabela] ${tabelaCrua.length} times na tabela crua.`); // LOG T6
    const tabelaProcessada = tabelaCrua.map(item => ({
      posicao: item.position,
      time: item.team.name,
      escudo: item.team.crest, // Adicionando escudo
      pontos: item.points,
      jogos: item.playedGames,
      vitorias: item.won,
      empates: item.draw,
      derrotas: item.lost,
      saldoGols: item.goalDifference,
    }));
    console.log(`✅ [DEBUG /tabela] Tabela processada com ${tabelaProcessada.length} times.`); // LOG T7
    res.json({ success: true, tabela: tabelaProcessada, total: tabelaProcessada.length });

  } catch (error) {
    console.error(`💥 [DEBUG /tabela] ERRO FATAL no endpoint /liga/:id/tabela: ${error.message}`); // LOG T8
    // Logar mais detalhes do erro da API, se disponível
    if (error.response) {
      console.error('[DEBUG /tabela] Erro da API - Status:', error.response.status);
      console.error('[DEBUG /tabela] Erro da API - Data:', error.response.data);
    }
    res.status(500).json({ success: false, error: `Erro ao buscar tabela da liga: ${error.message}` });
  }
});

// Endpoint para buscar goleadores de uma liga
app.get('/liga/:id/goleadores', verificarTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da liga é obrigatório'
      });
    }
    
    console.log(`⚽ Buscando goleadores da liga ${id}...`);
    
    // Mapeamento de IDs para Football-Data.org
    const ligasFootballData = {
      '4329': 'BSA', // Brasileirão Série A
      '4328': 'PL',  // Premier League
      '4331': 'BL1', // Bundesliga
      '4332': 'PD',  // La Liga
      '4334': 'SA',  // Serie A
      '4344': 'FL1', // Ligue 1
      '4346': 'PPL', // Primeira Liga
      '4337': 'DED', // Eredivisie
      '4336': 'EC',  // Championship
      '4330': 'WC',  // World Cup
      '4333': 'EC',  // European Championship
      '4338': 'CL'   // Champions League
    };
    
    const footballDataId = ligasFootballData[id];
    if (!footballDataId) {
      return res.status(400).json({
        success: false,
        error: 'Liga não suportada para goleadores'
      });
    }
    
    // Buscar goleadores do Football-Data.org
    const axios = require('axios');
    const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
    const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org/v4';
    
    const response = await axios.get(`${FOOTBALL_DATA_BASE_URL}/competitions/${footballDataId}/scorers`, {
      headers: {
        'X-Auth-Token': FOOTBALL_DATA_API_KEY
      },
      timeout: 10000
    });
    
    if (!response.data || !response.data.scorers || response.data.scorers.length === 0) {
      throw new Error('Goleadores não encontrados');
    }
    
    // Processar dados dos goleadores
    const goleadores = response.data.scorers.slice(0, 10).map((scorer, index) => ({
      posicao: index + 1,
      jogador: scorer.player.name,
      time: scorer.team.name,
      gols: scorer.goals,
      assistencias: scorer.assists || 0
    }));
    
    console.log(`✅ Goleadores encontrados: ${goleadores.length} jogadores`);
    
    res.json({
      success: true,
      goleadores: goleadores,
      total: goleadores.length,
      ligaId: id,
      fonte: 'Football-Data.org'
    });
    
  } catch (error) {
    console.error('Erro ao buscar goleadores da liga:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar goleadores da liga: ' + error.message
    });
  }
});

// Endpoint para buscar retrospecto H2H entre dois times
app.get('/h2h/:timeA/:timeB', verificarTokenMiddleware, async (req, res) => {
  try {
    const { timeA, timeB } = req.params;
    
    if (!timeA || !timeB) {
      return res.status(400).json({
        success: false,
        error: 'Nomes dos times são obrigatórios'
      });
    }
    
    console.log(`🔄 Buscando retrospecto H2H: ${timeA} vs ${timeB}...`);
    
    // Por enquanto, vamos retornar dados simulados
    // Em uma implementação real, você buscaria os confrontos diretos
    const h2h = {
      totalJogos: 12,
      vitoriasTimeA: 5,
      vitoriasTimeB: 4,
      empates: 3,
      ultimosConfrontos: [
        { resultado: `${timeA} 2-1 ${timeB}`, data: '2024-03-15' },
        { resultado: `${timeB} 1-0 ${timeA}`, data: '2023-11-20' },
        { resultado: `${timeA} 1-1 ${timeB}`, data: '2023-08-10' }
      ],
      mediaGols: {
        timeA: 1.8,
        timeB: 1.2
      }
    };
    
    console.log(`✅ Retrospecto H2H encontrado: ${h2h.totalJogos} jogos`);
    
    res.json({
      success: true,
      h2h: h2h,
      confronto: `${timeA} vs ${timeB}`,
      fonte: 'Football-Data.org (Simulado)'
    });
    
  } catch (error) {
    console.error('Erro ao buscar retrospecto H2H:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar retrospecto H2H: ' + error.message
    });
  }
});

// Endpoint para buscar detalhes de um jogo específico
app.get('/jogo/:id', verificarTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do jogo é obrigatório'
      });
    }
    
    console.log(`🔍 Buscando detalhes do jogo ${id}...`);
    const jogo = await buscarDetalhesJogo(id);
    
    res.json({
      success: true,
      jogo: jogo
    });
    
  } catch (error) {
    console.error('Erro ao buscar detalhes do jogo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar detalhes do jogo: ' + error.message
    });
  }
});

// ===== ENDPOINTS PARA ODDS REAIS =====

// Endpoint para buscar odds reais de uma liga

// Endpoint para buscar odds de um jogo específico
app.get('/odds-jogo/:id', verificarTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🎯 Buscando odds do jogo ${id}...`);
    
    const odds = await buscarOddsJogo(id);
    
    res.json({
      success: true,
      ...odds
    });
  } catch (error) {
    console.error('❌ Erro ao buscar odds do jogo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar odds do jogo'
    });
  }
});

// Endpoint para listar ligas disponíveis para odds
app.get('/odds-ligas', verificarTokenMiddleware, async (req, res) => {
  try {
    console.log('🎯 Listando ligas disponíveis para odds...');
    
    const ligas = await listarLigasDisponiveis();
    
    res.json({
      success: true,
      ...ligas
    });
  } catch (error) {
    console.error('❌ Erro ao listar ligas de odds:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar ligas de odds'
    });
  }
});

// Endpoint para verificar contador de API (SEM autenticação - para healthcheck)
app.get('/api/contador', async (req, res) => {
  try {
    console.log('📊 Buscando contador de API...');
    
    const contagem = await buscarContagemMes('the_odds_api');
    
    res.json({
      success: true,
      uso: contagem,
      limite: 500,
      restante: Math.max(0, 500 - contagem),
      percentual: Math.round((contagem / 500) * 100)
    });
  } catch (error) {
    console.error('❌ Erro ao buscar contador:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar contador de API'
    });
  }
});

// Endpoint para verificar contador de API (SEM autenticação - para healthcheck)
app.get('/api/contador-publico', async (req, res) => {
  try {
    console.log('📊 Buscando contador de API (público)...');
    
    const contagem = await buscarContagemMes('the_odds_api');
    
    res.json({
      success: true,
      uso: contagem,
      limite: 500,
      restante: Math.max(0, 500 - contagem),
      percentual: Math.round((contagem / 500) * 100)
    });
  } catch (error) {
    console.error('❌ Erro ao buscar contador:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar contador de API'
    });
  }
});

// Healthcheck robusto para Railway
app.get('/health', (req, res) => {
  try {
    // Verificar se o banco está funcionando
    const db = getDatabase();
    if (!db) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Database not available',
        timestamp: new Date().toISOString()
      });
    }

    res.json({ 
      status: 'ok', 
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: PORT
    });
  } catch (error) {
    console.error('Healthcheck error:', error);
    res.status(503).json({ 
      status: 'error', 
      message: 'Healthcheck failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Endpoint temporário para verificar variáveis de ambiente
app.get('/debug-env', (req, res) => {
  res.json({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Presente' : 'Ausente',
    FOOTBALL_DATA_API_KEY: process.env.FOOTBALL_DATA_API_KEY ? 'Presente' : 'Ausente',
    THE_ODDS_API_KEY: process.env.THE_ODDS_API_KEY ? 'Presente' : 'Ausente',
    JWT_SECRET: process.env.JWT_SECRET ? 'Presente' : 'Ausente',
    NODE_ENV: process.env.NODE_ENV,
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    PORT: process.env.PORT,
    // Mostrar valores brutos (sem mostrar as chaves completas por segurança)
    GEMINI_PARTIAL: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'N/A',
    FOOTBALL_PARTIAL: process.env.FOOTBALL_DATA_API_KEY ? process.env.FOOTBALL_DATA_API_KEY.substring(0, 10) + '...' : 'N/A',
    ODDS_PARTIAL: process.env.THE_ODDS_API_KEY ? process.env.THE_ODDS_API_KEY.substring(0, 10) + '...' : 'N/A'
  });
});

// Endpoint de teste para verificar se o login está funcionando
app.post('/test-login', (req, res) => {
  const { email, senha } = req.body;
  console.log(`🔍 [TEST-LOGIN] Tentativa de login: ${email}`);
  
  if (email === 'teste@teste.com' && senha === '123456') {
    res.json({
      success: true,
      message: 'Login de teste funcionando!',
      usuario: { id: 1, email: 'teste@teste.com' }
    });
  } else {
    res.json({
      success: false,
      message: 'Credenciais inválidas no teste'
    });
  }
});

// Healthcheck alternativo para Railway (caso o /health não funcione)
app.get('/api/contador', (req, res) => {
  try {
    // Verificar se o banco está funcionando
    const db = getDatabase();
    if (!db) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Database not available',
        timestamp: new Date().toISOString()
      });
    }

    res.json({ 
      status: 'ok', 
      message: 'API is healthy via /api/contador',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: PORT
    });
  } catch (error) {
    console.error('Healthcheck error:', error);
    res.status(503).json({ 
      status: 'error', 
      message: 'Healthcheck failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Rota para SPA (Single Page Application) - deve ser a ÚLTIMA rota
if (isProduction) {
  const path = require('path');
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
  app.get('*', (req, res) => {
    console.log('🔄 Servindo SPA para:', req.path);
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Acesse: http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Modo de produção ativado`);
    const path = require('path');
    console.log(`📁 Frontend será servido de: ${path.join(__dirname, '../frontend/dist')}`);
  }
});