# 📁 Estrutura do Projeto - Gestor de Apostas

## 🎯 Visão Geral

Sistema de gestão de apostas esportivas com backend Node.js, Express e SQLite.

## 📂 Estrutura de Arquivos

```
APOSTAS/
├── backend/                    # Backend Node.js
│   ├── server.js              # Servidor principal
│   ├── database.js            # Configuração do banco SQLite
│   ├── auth.js                # Funções de autenticação
│   ├── package.json           # Dependências do projeto
│   ├── gestor_apostas.db      # Banco de dados SQLite (criado automaticamente)
│   ├── teste-simples.js       # Teste completo do sistema
│   ├── teste-auth.js          # Teste de autenticação
│   └── node_modules/          # Dependências instaladas
├── frontend/                   # Frontend (a ser implementado)
├── README.md                  # Documentação principal
├── INSTRUCOES.md              # Instruções de execução
└── ESTRUTURA.md               # Este arquivo
```

## 🗄️ Banco de Dados (SQLite)

### Arquivo: `gestor_apostas.db`

#### Tabela: **Usuarios**
```sql
CREATE TABLE Usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL
)
```

#### Tabela: **Banca**
```sql
CREATE TABLE Banca (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  saldo_atual REAL DEFAULT 0,
  FOREIGN KEY(usuario_id) REFERENCES Usuarios(id)
)
```

#### Tabela: **Apostas**
```sql
CREATE TABLE Apostas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  nome_grupo TEXT NOT NULL,
  valor_apostado REAL NOT NULL,
  odd_total REAL NOT NULL,
  status TEXT DEFAULT 'PENDENTE',
  FOREIGN KEY(usuario_id) REFERENCES Usuarios(id)
)
```

#### Tabela: **Legs**
```sql
CREATE TABLE Legs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aposta_id INTEGER NOT NULL,
  jogo_nome TEXT NOT NULL,
  mercado TEXT NOT NULL,
  odd_leg REAL NOT NULL,
  status_leg TEXT DEFAULT 'PENDENTE',
  FOREIGN KEY(aposta_id) REFERENCES Apostas(id)
)
```

## 🔧 Arquivos Principais

### 1. **server.js**
- Servidor Express na porta 3001
- CORS habilitado
- Rota principal de status
- Inicialização do banco de dados

### 2. **database.js**
- Conexão com SQLite
- Função `conectarBanco()`
- Função `criarTabelasIniciais()`
- Função `getDatabase()`

### 3. **auth.js**
- `registrarUsuario(email, senha)`
- `loginUsuario(email, senha)`
- `verificarToken(token)`
- Hash de senhas com bcrypt
- Tokens JWT

## 🧪 Arquivos de Teste

### 1. **teste-simples.js**
- Teste completo do sistema
- Conecta ao banco
- Cria tabelas
- Testa registro e login

### 2. **teste-auth.js**
- Teste específico de autenticação
- Testa cenários de erro
- Verifica tokens JWT

## 📦 Dependências

### Produção
- `express` - Framework web
- `sqlite3` - Banco de dados
- `jsonwebtoken` - Autenticação JWT
- `bcryptjs` - Hash de senhas
- `cors` - Cross-Origin Resource Sharing

### Desenvolvimento
- `nodemon` - Auto-reload do servidor

## 🚀 Comandos de Execução

### Instalação
```bash
cd backend
npm install
```

### Execução
```bash
# Modo produção
npm start

# Modo desenvolvimento
npm run dev
```

### Testes
```bash
# Teste completo
node teste-simples.js

# Teste de autenticação
node teste-auth.js
```

## 🔒 Segurança Implementada

- ✅ Senhas hasheadas com bcrypt (salt rounds: 10)
- ✅ JWT com expiração de 24 horas
- ✅ CORS habilitado
- ✅ Validação de dados de entrada
- ✅ Tratamento de erros

## 📊 Status do Projeto

### ✅ Implementado
- [x] Estrutura base do projeto
- [x] Configuração do banco SQLite
- [x] Criação automática de tabelas
- [x] Sistema de autenticação
- [x] Hash de senhas
- [x] Tokens JWT
- [x] Testes automatizados
- [x] Documentação

### 🔄 Próximos Passos
- [ ] Implementar rotas de API
- [ ] CRUD de apostas
- [ ] CRUD de legs
- [ ] Gestão de banca
- [ ] Relatórios e estatísticas
- [ ] Frontend React
- [ ] Deploy em produção

## 🎯 Funcionalidades do Sistema

### Autenticação
- Registro de usuários
- Login de usuários
- Verificação de tokens
- Hash seguro de senhas

### Banco de Dados
- Estrutura para usuários
- Estrutura para apostas
- Estrutura para legs
- Estrutura para banca

### API
- Servidor Express
- CORS configurado
- Rota de status
- Pronto para expansão

---

**Estrutura base implementada com sucesso! 🎉**
