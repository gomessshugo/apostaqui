# 🎯 Sistema de Apostas Esportivas com IA

Sistema completo de apostas esportivas com análise de IA, odds em tempo real e construtor de múltiplas.

## 🚀 Funcionalidades

- ✅ **Autenticação de usuários** (JWT)
- ✅ **Gestão de banca** (saldo, depósitos)
- ✅ **Odds em tempo real** (The Odds API)
- ✅ **Análise com IA** (Google Gemini)
- ✅ **Construtor de múltiplas** (Sistema de proteção)
- ✅ **Tabelas de classificação** (Football-Data.org)
- ✅ **Histórico de apostas** (SQLite/PostgreSQL)

## 🛠️ Tecnologias

### Backend
- **Node.js** + Express.js
- **SQLite** (desenvolvimento) / **PostgreSQL** (produção)
- **JWT** para autenticação
- **APIs Externas**: The Odds API, Football-Data.org, Google Gemini

### Frontend
- **React** + Vite
- **Tailwind CSS** para estilização
- **Axios** para requisições HTTP

## 🚀 Deploy

### Opção 1: Railway (Recomendado)

1. **Fazer fork** deste repositório
2. **Acessar** [Railway.app](https://railway.app)
3. **Conectar** com GitHub
4. **Selecionar** este repositório
5. **Configurar** variáveis de ambiente:
   ```
   NODE_ENV=production
   GEMINI_API_KEY=sua_chave_gemini
   FOOTBALL_DATA_API_KEY=sua_chave_football_data
   THE_ODDS_API_KEY=sua_chave_odds_api
   JWT_SECRET=sua_chave_jwt_secreta
   ```
6. **Deploy automático** ✅

### Opção 2: Render

1. **Conectar** com GitHub
2. **Selecionar** repositório
3. **Configurar**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. **Adicionar** variáveis de ambiente
5. **Deploy** ✅

### Opção 3: VPS (DigitalOcean/Vultr)

1. **Criar** droplet/servidor Ubuntu
2. **Instalar** Node.js 18+
3. **Clonar** repositório
4. **Configurar** variáveis de ambiente
5. **Instalar** dependências: `npm run install-all`
6. **Build**: `npm run build`
7. **Iniciar**: `npm start`

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm run install-all

# Iniciar em desenvolvimento
npm run dev

# Acessar
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## 📊 APIs Necessárias

### 1. Google Gemini AI
- **URL**: https://makersuite.google.com/app/apikey
- **Uso**: Análise de confrontos esportivos

### 2. Football-Data.org
- **URL**: https://www.football-data.org/client/register
- **Uso**: Dados de ligas, jogos, tabelas

### 3. The Odds API
- **URL**: https://the-odds-api.com/
- **Uso**: Odds em tempo real

## 🔐 Variáveis de Ambiente

```env
NODE_ENV=production
PORT=3001
GEMINI_API_KEY=sua_chave_aqui
FOOTBALL_DATA_API_KEY=sua_chave_aqui
THE_ODDS_API_KEY=sua_chave_aqui
JWT_SECRET=sua_chave_jwt_aqui
```

## 📱 Uso

1. **Registrar** usuário
2. **Definir** saldo inicial
3. **Selecionar** liga esportiva
4. **Analisar** confrontos com IA
5. **Adicionar** palpites à cesta
6. **Criar** múltiplas com proteção
7. **Acompanhar** histórico

## 🎯 Recursos Avançados

- **Sistema de Proteção**: Múltiplas com jogo pivô
- **Análise Inteligente**: IA para análise tática
- **Odds em Tempo Real**: Atualização automática
- **Interface Responsiva**: Mobile-first design
- **Gestão de Banca**: Controle de saldo
- **Histórico Completo**: Todas as apostas

## 📞 Suporte

Para dúvidas ou problemas:
- **GitHub Issues**: Abrir issue no repositório
- **Documentação**: README.md
- **Logs**: Verificar console do navegador

---

**🎉 Sistema desenvolvido com ❤️ para entusiastas de apostas esportivas!**