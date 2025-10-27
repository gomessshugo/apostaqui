# 🔐 Endpoints de Autenticação - Gestor de Apostas

## 🌐 Base URL
```
http://localhost:3001
```

## 📋 Endpoints Implementados

### 1. **GET /** - Status da API
**Descrição:** Verifica se a API está funcionando

**Resposta:**
```json
{
  "message": "API do Gestor de Apostas funcionando!",
  "timestamp": "2025-10-22T21:50:14.158Z"
}
```

### 2. **POST /registrar** - Registrar Usuário
**Descrição:** Cria um novo usuário no sistema

**Body:**
```json
{
  "email": "usuario@example.com",
  "senha": "123456"
}
```

**Validações:**
- Email e senha são obrigatórios
- Senha deve ter pelo menos 6 caracteres
- Email deve ser único

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "Usuário já existe com este email"
}
```

### 3. **POST /login** - Fazer Login
**Descrição:** Autentica um usuário existente

**Body:**
```json
{
  "email": "usuario@example.com",
  "senha": "123456"
}
```

**Validações:**
- Email e senha são obrigatórios
- Usuário deve existir
- Senha deve estar correta

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta de Erro (401):**
```json
{
  "success": false,
  "error": "Senha incorreta"
}
```

## 🔒 Segurança Implementada

### Hash de Senhas
- **Algoritmo:** bcryptjs
- **Salt Rounds:** 10
- **Processo:** Senha → Hash → Armazenamento

### Tokens JWT
- **Algoritmo:** HS256
- **Expiração:** 24 horas
- **Payload:** `{ usuarioId, email }`
- **Chave Secreta:** Configurável

### Validações
- ✅ Email único
- ✅ Senha mínima de 6 caracteres
- ✅ Campos obrigatórios
- ✅ Verificação de hash
- ✅ Tratamento de erros

## 🗄️ Banco de Dados

### Tabelas Utilizadas

#### **Usuarios**
```sql
CREATE TABLE Usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL
)
```

#### **Banca**
```sql
CREATE TABLE Banca (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  saldo_atual REAL DEFAULT 0,
  FOREIGN KEY(usuario_id) REFERENCES Usuarios(id)
)
```

### Processo de Registro
1. **Validação** dos dados de entrada
2. **Verificação** se email já existe
3. **Hash** da senha com bcrypt
4. **Inserção** do usuário na tabela `Usuarios`
5. **Criação automática** de entrada na tabela `Banca` (saldo = 0)
6. **Geração** do token JWT
7. **Retorno** dos dados do usuário e token

### Processo de Login
1. **Validação** dos dados de entrada
2. **Busca** do usuário pelo email
3. **Verificação** se usuário existe
4. **Comparação** da senha com hash
5. **Geração** do token JWT
6. **Retorno** dos dados do usuário e token

## 🧪 Testes

### Executar Testes
```bash
# Teste completo dos endpoints
node teste-endpoints-limpo.js

# Teste das funções de autenticação
node teste-simples.js
```

### Cenários Testados
- ✅ Registro de usuário válido
- ✅ Login com credenciais corretas
- ✅ Registro de usuário duplicado (erro)
- ✅ Login com senha incorreta (erro)
- ✅ Login com usuário inexistente (erro)
- ✅ Validação de senha muito curta (erro)
- ✅ Validação de campos obrigatórios (erro)

## 📊 Exemplos de Uso

### cURL - Registrar Usuário
```bash
curl -X POST http://localhost:3001/registrar \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","senha":"123456"}'
```

### cURL - Fazer Login
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","senha":"123456"}'
```

### JavaScript - Registrar Usuário
```javascript
const response = await fetch('http://localhost:3001/registrar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'usuario@example.com',
    senha: '123456'
  })
});

const data = await response.json();
console.log(data);
```

## 🚀 Próximos Passos

### Endpoints a Implementar
- [ ] **GET /usuario** - Obter dados do usuário
- [ ] **PUT /usuario** - Atualizar dados do usuário
- [ ] **POST /apostas** - Criar nova aposta
- [ ] **GET /apostas** - Listar apostas do usuário
- [ ] **PUT /apostas/:id** - Atualizar aposta
- [ ] **DELETE /apostas/:id** - Deletar aposta
- [ ] **GET /banca** - Obter saldo da banca
- [ ] **PUT /banca** - Atualizar saldo da banca

### Middleware a Implementar
- [ ] **Autenticação JWT** - Verificar token em rotas protegidas
- [ ] **Validação de dados** - Middleware para validação
- [ ] **Rate limiting** - Limitar requisições por IP
- [ ] **Logs** - Sistema de logs de requisições

---

**Autenticação implementada com sucesso! 🎉**
