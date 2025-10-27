# 🎯 Endpoints Completos - Sistema de Apostas

## 🌐 Base URL
```
http://localhost:3001
```

## 🔐 Autenticação

Todos os endpoints protegidos requerem o header:
```
Authorization: Bearer <token>
```

## 📋 Endpoints Implementados

### 🔑 **Autenticação**

#### **POST /registrar**
Registrar novo usuário

**Body:**
```json
{
  "email": "usuario@example.com",
  "senha": "123456"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### **POST /login**
Fazer login

**Body:**
```json
{
  "email": "usuario@example.com",
  "senha": "123456"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 💰 **Gestão de Banca**

#### **GET /banca**
Obter saldo atual da banca

**Headers:** `Authorization: Bearer <token>`

**Resposta:**
```json
{
  "success": true,
  "saldo_atual": 1000.00
}
```

#### **PUT /banca**
Atualizar saldo da banca

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "novo_saldo": 1000.00
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Saldo atualizado com sucesso",
  "novo_saldo": 1000.00
}
```

### 🎯 **Gestão de Apostas**

#### **POST /apostas**
Criar nova aposta (com transação de banco)

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "valor_apostado": 100.00,
  "odd_total": 2.5,
  "nome_grupo": "Sistema Teste",
  "legs": [
    {
      "jogo_nome": "Flamengo x Palmeiras",
      "mercado": "Resultado Final",
      "odd_leg": 1.5
    },
    {
      "jogo_nome": "São Paulo x Corinthians",
      "mercado": "Over 2.5 Gols",
      "odd_leg": 1.67
    }
  ]
}
```

**Processo da Transação:**
1. ✅ Verifica saldo disponível
2. ✅ Subtrai valor da banca
3. ✅ Insere aposta na tabela `Apostas`
4. ✅ Insere todas as legs na tabela `Legs`
5. ✅ Commit da transação

**Resposta:**
```json
{
  "success": true,
  "message": "Aposta criada com sucesso",
  "aposta_id": 1,
  "valor_apostado": 100.00,
  "odd_total": 2.5,
  "legs_criadas": 2
}
```

#### **GET /apostas-ativas**
Listar apostas pendentes com legs

**Headers:** `Authorization: Bearer <token>`

**Resposta:**
```json
{
  "success": true,
  "apostas": [
    {
      "id": 1,
      "nome_grupo": "Sistema Teste",
      "valor_apostado": 100.00,
      "odd_total": 2.5,
      "status": "PENDENTE",
      "legs": [
        {
          "id": 1,
          "jogo_nome": "Flamengo x Palmeiras",
          "mercado": "Resultado Final",
          "odd_leg": 1.5,
          "status_leg": "PENDENTE"
        },
        {
          "id": 2,
          "jogo_nome": "São Paulo x Corinthians",
          "mercado": "Over 2.5 Gols",
          "odd_leg": 1.67,
          "status_leg": "PENDENTE"
        }
      ]
    }
  ]
}
```

#### **GET /apostas-historico**
Listar apostas finalizadas (GANHA/PERDIDA) com legs

**Headers:** `Authorization: Bearer <token>`

**Resposta:**
```json
{
  "success": true,
  "apostas": [
    {
      "id": 2,
      "nome_grupo": "Sistema Anterior",
      "valor_apostado": 50.00,
      "odd_total": 1.8,
      "status": "GANHA",
      "legs": [
        {
          "id": 3,
          "jogo_nome": "Santos x Grêmio",
          "mercado": "Ambas Marcam",
          "odd_leg": 1.8,
          "status_leg": "GANHA"
        }
      ]
    }
  ]
}
```

## 🔒 **Middleware de Autenticação**

### **verificarTokenMiddleware**
- ✅ Verifica token JWT no header `Authorization`
- ✅ Valida token e extrai dados do usuário
- ✅ Adiciona `req.usuario` com dados do usuário
- ✅ Retorna erro 401 se token inválido

## 🗄️ **Banco de Dados**

### **Transações Implementadas**
- ✅ **POST /apostas** - Transação completa
- ✅ Verificação de saldo
- ✅ Atualização de banca
- ✅ Inserção de aposta
- ✅ Inserção de legs
- ✅ Rollback em caso de erro

### **Queries com JOIN**
- ✅ **GET /apostas-ativas** - JOIN com legs
- ✅ **GET /apostas-historico** - JOIN com legs
- ✅ Agregação de legs em JSON

## 🧪 **Testes Implementados**

### **Cenários Testados**
- ✅ Registro e login de usuário
- ✅ Gestão de banca (consultar/atualizar)
- ✅ Criação de apostas simples e múltiplas
- ✅ Listagem de apostas ativas
- ✅ Listagem de histórico
- ✅ Validações (saldo insuficiente, dados inválidos)
- ✅ Autenticação (token válido/inválido)

### **Resultado dos Testes**
```
🧪 Testando sistema completo de apostas...

✅ Servidor funcionando
✅ Usuário registrado: usuario@teste.com
✅ Saldo inicial: 0
✅ Saldo definido para R$ 1000
✅ Saldo atual: 1000
✅ Aposta simples criada: 1
✅ Aposta múltipla criada: 2
✅ Saldo final: 850
✅ Apostas ativas: 2
✅ Apostas no histórico: 0
✅ Validações funcionando

🎉 Sistema completo funcionando perfeitamente!
```

## 📊 **Exemplos de Uso**

### **cURL - Criar Aposta**
```bash
curl -X POST http://localhost:3001/apostas \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "valor_apostado": 100,
    "odd_total": 2.5,
    "nome_grupo": "Sistema Teste",
    "legs": [
      {
        "jogo_nome": "Flamengo x Palmeiras",
        "mercado": "Resultado Final",
        "odd_leg": 1.5
      }
    ]
  }'
```

### **JavaScript - Listar Apostas Ativas**
```javascript
const response = await fetch('http://localhost:3001/apostas-ativas', {
  headers: {
    'Authorization': 'Bearer SEU_TOKEN'
  }
});

const data = await response.json();
console.log(data.apostas);
```

## 🚀 **Funcionalidades Implementadas**

### ✅ **Autenticação Completa**
- Registro de usuários
- Login com JWT
- Middleware de proteção
- Validação de tokens

### ✅ **Gestão de Banca**
- Consultar saldo
- Atualizar saldo
- Controle de saldo em apostas

### ✅ **Sistema de Apostas**
- Criação com transação
- Apostas simples e múltiplas
- Gestão de legs
- Listagem com JOIN

### ✅ **Segurança**
- Transações de banco
- Validações robustas
- Autenticação JWT
- Controle de saldo

## 🔄 **Próximos Passos**

### **Endpoints a Implementar**
- [ ] **PUT /apostas/:id/status** - Atualizar status da aposta
- [ ] **PUT /legs/:id/status** - Atualizar status da leg
- [ ] **GET /apostas/:id** - Obter aposta específica
- [ ] **DELETE /apostas/:id** - Cancelar aposta
- [ ] **GET /estatisticas** - Estatísticas do usuário

### **Funcionalidades Avançadas**
- [ ] **Sistema de Construtor** - Agrupar apostas
- [ ] **Relatórios** - Análise de performance
- [ ] **Notificações** - Alertas de apostas
- [ ] **Exportação** - Dados em CSV/PDF

---

**🎉 Sistema de apostas completo e funcional!**
