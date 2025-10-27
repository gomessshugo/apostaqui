# 🌐 CONFIGURAR DADOS REAIS - Football-Data.org

## 📋 **PASSO A PASSO PARA DADOS REAIS:**

### 1. **Registrar na API Football-Data.org** (GRATUITA)
- Acesse: https://www.football-data.org/
- Clique em "Get API Key"
- Preencha o formulário (nome, email, projeto)
- **É GRATUITO!** 10 requests/minuto

### 2. **Obter sua API Key**
- Após registro, você receberá uma chave como: `abc123def456ghi789`
- Copie essa chave

### 3. **Configurar no Sistema**
- Abra o arquivo: `backend/apiExterna.js`
- Encontre a linha: `const FOOTBALL_DATA_API_KEY = 'YOUR_API_KEY_HERE';`
- Substitua por: `const FOOTBALL_DATA_API_KEY = 'SUA_CHAVE_AQUI';`

### 4. **Reiniciar o Servidor**
```bash
cd backend
pkill -f "node server.js"
node server.js
```

## 🎯 **RESULTADO:**
- ✅ **Dados REAIS** de jogos atuais
- ✅ **Datas corretas** (não simuladas)
- ✅ **Times reais** jogando hoje/amanhã
- ✅ **Logos dos times**
- ✅ **Status dos jogos**

## 📊 **APIs CONFIGURADAS:**

### **Football-Data.org** (PRINCIPAL)
- **Premier League**: ID 2021
- **Bundesliga**: ID 2002  
- **La Liga**: ID 2014
- **Serie A**: ID 2019
- **Ligue 1**: ID 2015

### **TheSportsDB** (FALLBACK)
- Usado se Football-Data.org falhar
- Sem necessidade de registro

## 🚀 **TESTE:**
Após configurar, acesse:
- Frontend: http://localhost:5173/mercados
- Selecione uma liga
- **Verá jogos REAIS com datas atuais!**

## ⚡ **LIMITES GRATUITOS:**
- **Football-Data.org**: 10 requests/minuto
- **TheSportsDB**: Sem limite
- **Sistema inteligente**: Usa cache para evitar rate limits

## 🔧 **TROUBLESHOOTING:**
Se não funcionar:
1. Verifique se a API key está correta
2. Verifique se o servidor foi reiniciado
3. Verifique os logs do servidor
4. O sistema usará dados simulados como fallback

**DADOS REAIS = JOGOS ATUAIS + DATAS CORRETAS!** 🎉
