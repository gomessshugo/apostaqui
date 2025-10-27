# 📚 Documentação da API - Sistema de Apostas

## 🔗 Base URL
```
http://localhost:3001/api
```

## 🔐 Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer <access_token>
```

## 📋 Endpoints

### 🔑 Autenticação

#### `POST /auth/register`
Registrar novo usuário

**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phone": "string",
  "birthDate": "YYYY-MM-DD"
}
```

**Response:**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Usuário Teste",
    "isPremium": false
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### `POST /auth/login`
Fazer login

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

#### `POST /auth/refresh`
Renovar token de acesso

**Body:**
```json
{
  "refreshToken": "string"
}
```

#### `POST /auth/logout`
Fazer logout

**Headers:** `Authorization: Bearer <token>`

#### `GET /auth/verify`
Verificar se token é válido

**Headers:** `Authorization: Bearer <token>`

### 👤 Usuários

#### `GET /users/profile`
Obter perfil do usuário

**Headers:** `Authorization: Bearer <token>`

#### `PUT /users/profile`
Atualizar perfil

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "fullName": "string",
  "phone": "string",
  "birthDate": "YYYY-MM-DD"
}
```

#### `PUT /users/password`
Alterar senha

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

#### `GET /users/stats`
Obter estatísticas do usuário

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "stats": {
    "totalBets": 10,
    "wonBets": 6,
    "lostBets": 4,
    "totalStaked": 1000.00,
    "totalWon": 1500.00,
    "totalLost": 400.00,
    "profitLoss": 100.00,
    "winRate": 60.0
  }
}
```

#### `POST /users/upgrade-premium`
Upgrade para conta premium

**Headers:** `Authorization: Bearer <token>`

#### `DELETE /users/account`
Deletar conta

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "password": "string"
}
```

### 🎯 Apostas

#### `GET /bets`
Listar apostas do usuário

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `status` (string): Filtrar por status (pending, won, lost, cancelled)
- `category` (number): Filtrar por categoria

#### `GET /bets/:id`
Obter aposta específica

**Headers:** `Authorization: Bearer <token>`

#### `POST /bets`
Criar nova aposta

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "stakeAmount": 100.00,
  "odds": 2.50,
  "categoryId": 1,
  "notes": "string"
}
```

#### `PUT /bets/:id`
Atualizar aposta

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "stakeAmount": 100.00,
  "odds": 2.50,
  "categoryId": 1,
  "notes": "string"
}
```

#### `PUT /bets/:id/result`
Atualizar resultado da aposta

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "status": "won|lost|cancelled",
  "resultDate": "YYYY-MM-DD",
  "notes": "string"
}
```

#### `DELETE /bets/:id`
Deletar aposta

**Headers:** `Authorization: Bearer <token>`

#### `GET /bets/categories/list`
Listar categorias de apostas

**Headers:** `Authorization: Bearer <token>`

## 📊 Status Codes

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `409` - Conflito (usuário já existe)
- `500` - Erro interno do servidor

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- JWT com expiração de 15 minutos
- Refresh tokens com expiração de 7 dias
- Rate limiting: 100 requests por 15 minutos
- CORS configurado
- Headers de segurança com Helmet

## 🧪 Testes

Execute o arquivo de teste:
```bash
node test-api.js
```

## 🚀 Iniciar Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```
