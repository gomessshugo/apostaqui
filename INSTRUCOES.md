# 📋 Instruções de Execução - Gestor de Apostas

## 🚀 Como Executar o Backend

### 1. Navegar para o diretório
```bash
cd backend
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Executar servidor
```bash
# Modo produção
npm start

# Modo desenvolvimento (com nodemon)
npm run dev
```

### 4. Verificar se está funcionando
```bash
curl http://localhost:3001
```

**Resposta esperada:**
```json
{
  "message": "API do Gestor de Apostas funcionando!",
  "timestamp": "2025-10-22T21:50:14.158Z"
}
```

## 🧪 Testar o Sistema

### Teste Completo
```bash
node teste-simples.js
```

### Teste de Autenticação
```bash
node teste-auth.js
```

## 📊 Verificar Banco de Dados

O banco SQLite será criado automaticamente em:
```
backend/gestor_apostas.db
```

### Tabelas Criadas
- ✅ **Usuarios** - Dados dos usuários
- ✅ **Banca** - Saldo dos usuários
- ✅ **Apostas** - Apostas dos usuários
- ✅ **Legs** - Detalhes das apostas

## 🔧 Estrutura do Projeto

```
backend/
├── server.js              # Servidor principal
├── database.js            # Configuração do banco
├── auth.js               # Funções de autenticação
├── package.json          # Dependências
├── gestor_apostas.db     # Banco SQLite (criado automaticamente)
├── teste-simples.js      # Teste completo
├── teste-auth.js         # Teste de autenticação
└── README.md             # Documentação
```

## 🎯 Funcionalidades Implementadas

### ✅ Banco de Dados
- Conexão com SQLite
- Criação automática de tabelas
- Estrutura para apostas e legs

### ✅ Autenticação
- Registro de usuários
- Login de usuários
- Hash de senhas com bcrypt
- Tokens JWT

### ✅ API
- Servidor Express rodando na porta 3001
- CORS habilitado
- Rota de status

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ JWT com expiração de 24 horas
- ✅ CORS configurado
- ✅ Validação de dados

## 📱 Próximos Passos

1. **Implementar rotas de API:**
   - POST /api/auth/register
   - POST /api/auth/login
   - GET /api/apostas
   - POST /api/apostas
   - PUT /api/apostas/:id
   - DELETE /api/apostas/:id

2. **Implementar CRUD de apostas:**
   - Criar aposta
   - Listar apostas
   - Editar aposta
   - Deletar aposta

3. **Implementar gestão de banca:**
   - Consultar saldo
   - Atualizar saldo
   - Histórico de movimentações

4. **Implementar relatórios:**
   - Estatísticas de apostas
   - Lucro/prejuízo
   - Taxa de acerto

## 🚨 Solução de Problemas

### Erro: "address already in use"
```bash
# Parar processos na porta 3001
lsof -ti:3001 | xargs kill -9
```

### Erro: "Cannot read properties of undefined"
- Verifique se o banco está conectado
- Execute `node teste-simples.js` para verificar

### Erro: "SQLITE_ERROR"
- Verifique se o diretório tem permissão de escrita
- Delete o arquivo `gestor_apostas.db` e execute novamente

## 📞 Suporte

Se encontrar problemas:
1. Verifique se o Node.js está instalado
2. Verifique se as dependências foram instaladas
3. Verifique se a porta 3001 está livre
4. Execute os testes para verificar o funcionamento

---

**Sistema pronto para uso! 🎉**