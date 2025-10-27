# 🎯 Como Acessar o Sistema de Apostas

## 🚀 Sistema Funcionando

### **Backend (API)**
- ✅ **Status**: Funcionando
- ✅ **Porta**: 3001
- ✅ **URL**: http://localhost:3001
- ✅ **Teste**: http://localhost:3001 (deve retornar JSON)

### **Frontend (Interface)**
- ⚠️ **Status**: Precisa ser iniciado
- ⚠️ **Porta**: 5173
- ⚠️ **URL**: http://localhost:5173

## 🔧 Como Iniciar o Sistema

### **1. Terminal 1 - Backend**
```bash
cd /Users/hugosamuelgomes/Downloads/SITES:SISTEMAS/APOSTAS/backend
node server.js
```

### **2. Terminal 2 - Frontend**
```bash
cd /Users/hugosamuelgomes/Downloads/SITES:SISTEMAS/APOSTAS/frontend
npm run dev
```

## 📱 Acessar o Sistema

### **1. Abrir Navegador**
- Acesse: **http://localhost:5173**

### **2. Fazer Login**
- **Email**: `teste@frontend.com`
- **Senha**: `123456`

### **3. Navegar pelo Sistema**
- **Dashboard**: Ver apostas ativas
- **Banca**: Gerenciar saldo
- **Construtor**: Criar sistemas + IA

## 🎯 Funcionalidades Disponíveis

### **🔐 Autenticação**
- ✅ Login/Registro
- ✅ Proteção por token JWT
- ✅ Redirecionamento automático

### **💰 Gestão de Banca**
- ✅ Consultar saldo
- ✅ Atualizar saldo
- ✅ Controle automático

### **🎯 Sistema de Apostas**
- ✅ Criar apostas simples
- ✅ Criar apostas múltiplas
- ✅ Controle manual de status
- ✅ Finalização automática

### **🎯 Construtor de Sistemas**
- ✅ Jogos base
- ✅ Jogo pivô
- ✅ Variações
- ✅ Criação automática

### **🤖 Integração com IA**
- ✅ Análise de confrontos
- ✅ Dados especializados
- ✅ Interface moderna

## 🧪 Testar o Sistema

### **1. Criar Usuário**
1. Acesse http://localhost:5173
2. Clique em "Criar uma nova conta"
3. Digite email e senha
4. Clique em "Criar Conta"

### **2. Definir Banca**
1. Vá para "Banca"
2. Digite um valor (ex: 1000)
3. Clique em "Atualizar Saldo"

### **3. Criar Aposta**
1. Vá para "Construtor"
2. Adicione jogos base
3. Defina jogo pivô
4. Adicione variações
5. Clique em "Gerar Sistema"

### **4. Analisar com IA**
1. No Construtor
2. Digite dois times
3. Clique em "Analisar com IA"
4. Veja a análise

### **5. Controlar Apostas**
1. Vá para "Dashboard"
2. Veja apostas ativas
3. Clique nos botões de status
4. Acompanhe finalização automática

## 🔧 Solução de Problemas

### **Backend não inicia**
```bash
# Verificar porta
lsof -i:3001

# Matar processo
lsof -ti:3001 | xargs kill -9

# Reiniciar
cd backend && node server.js
```

### **Frontend não inicia**
```bash
# Verificar dependências
cd frontend && npm install

# Executar
npm run dev
```

### **Erro de conexão**
- Verificar se backend está rodando
- Verificar se frontend está rodando
- Verificar URLs corretas

## 📊 URLs do Sistema

### **Backend (API)**
- **Base**: http://localhost:3001
- **Health**: http://localhost:3001
- **Registrar**: http://localhost:3001/registrar
- **Login**: http://localhost:3001/login
- **Banca**: http://localhost:3001/banca
- **Apostas**: http://localhost:3001/apostas
- **IA**: http://localhost:3001/analise-ia

### **Frontend (Interface)**
- **Login**: http://localhost:5173/login
- **Dashboard**: http://localhost:5173/dashboard
- **Banca**: http://localhost:5173/banca
- **Construtor**: http://localhost:5173/construtor

## 🎉 Sistema Completo

### **✅ Funcionalidades Implementadas**
- [x] **Autenticação** - Login/Registro
- [x] **Gestão de Banca** - Saldo
- [x] **Sistema de Apostas** - CRUD
- [x] **Finalização Automática** - Prêmios
- [x] **Construtor de Sistemas** - Criação automática
- [x] **Integração com IA** - Análise de confrontos
- [x] **Interface Moderna** - React + Tailwind
- [x] **Testes Automatizados** - Cobertura completa

### **🚀 Pronto para Uso**
- Sistema 100% funcional
- Interface moderna e responsiva
- Backend robusto e seguro
- Integração com IA
- Custo zero (Freemium)

---

**🎯 Acesse o sistema em: http://localhost:5173**
