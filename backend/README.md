# Backend - Sistema de Apostas Esportivas

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev

# Iniciar em produção
npm start
```

## 🔧 Configuração

Crie um arquivo `.env` na raiz do backend com as seguintes variáveis:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-super-segura
JWT_REFRESH_SECRET=sua-chave-refresh-super-segura
FRONTEND_URL=http://localhost:5173
```

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verificar token

### Usuários
- `GET /api/users/profile` - Obter perfil
- `PUT /api/users/profile` - Atualizar perfil
- `PUT /api/users/password` - Alterar senha
- `GET /api/users/stats` - Estatísticas do usuário
- `POST /api/users/upgrade-premium` - Upgrade para premium
- `DELETE /api/users/account` - Deletar conta

### Apostas
- `GET /api/bets` - Listar apostas
- `GET /api/bets/:id` - Obter aposta específica
- `POST /api/bets` - Criar aposta
- `PUT /api/bets/:id` - Atualizar aposta
- `PUT /api/bets/:id/result` - Atualizar resultado
- `DELETE /api/bets/:id` - Deletar aposta
- `GET /api/bets/categories/list` - Listar categorias

## 🗄️ Banco de Dados

O sistema usa SQLite com as seguintes tabelas:

- **users** - Dados dos usuários
- **bet_categories** - Categorias de apostas
- **bets** - Apostas dos usuários
- **user_stats** - Estatísticas dos usuários
- **refresh_tokens** - Tokens de refresh

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- JWT para autenticação
- Rate limiting
- CORS configurado
- Helmet para headers de segurança

## 📊 Modelo Freemium

- **Gratuito**: Funcionalidades básicas de apostas
- **Premium**: Recursos avançados (em desenvolvimento)
