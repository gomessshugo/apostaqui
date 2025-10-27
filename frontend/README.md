# 🎯 Frontend - Sistema de Apostas

Frontend React com Vite para o sistema de apostas esportivas.

## 🚀 Tecnologias

- **React 18** - Biblioteca de interface
- **Vite** - Build tool rápido
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Ícones

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Layout principal com sidebar
│   ├── pages/
│   │   ├── PaginaLogin.jsx     # Login/Registro
│   │   ├── PaginaBanca.jsx     # Gestão de banca
│   │   └── PaginaDashboard.jsx # Dashboard com apostas
│   ├── services/
│   │   └── api.js              # Serviços de API
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Ponto de entrada
│   └── index.css               # Estilos globais
├── package.json                # Dependências
├── vite.config.js              # Configuração Vite
├── tailwind.config.js          # Configuração Tailwind
└── index.html                  # HTML principal
```

## 🔧 Instalação e Execução

### 1. Instalar Dependências
```bash
cd frontend
npm install
```

### 2. Executar Frontend
```bash
npm run dev
```

### 3. Acessar Aplicação
```
http://localhost:5173
```

## 📱 Páginas Implementadas

### 🔐 **PaginaLogin.jsx**
- **Formulário de login/registro**
- **Toggle entre login e registro**
- **Validação de campos**
- **Salvamento de token JWT**
- **Redirecionamento automático**

**Funcionalidades:**
- ✅ Login com email/senha
- ✅ Registro de novos usuários
- ✅ Validação de formulário
- ✅ Tratamento de erros
- ✅ Interface responsiva

### 💰 **PaginaBanca.jsx**
- **Visualização do saldo atual**
- **Atualização de saldo**
- **Histórico de transações**
- **Validações de entrada**

**Funcionalidades:**
- ✅ Consultar saldo (GET /banca)
- ✅ Atualizar saldo (PUT /banca)
- ✅ Formatação de moeda
- ✅ Validações de entrada
- ✅ Feedback visual

### 🎯 **PaginaDashboard.jsx**
- **Lista de apostas ativas**
- **Cards de apostas com legs**
- **Controle manual de status**
- **Interface "Ao Vivo"**

**Funcionalidades:**
- ✅ Listar apostas ativas (GET /apostas-ativas)
- ✅ Cards de apostas com informações
- ✅ Lista de legs para cada aposta
- ✅ Botões de status manual (GANHA/PERDIDA/PENDENTE)
- ✅ Estados visuais em tempo real
- ✅ Atualização de dados

## 🔌 Integração com Backend

### **Serviços de API (api.js)**
```javascript
// Autenticação
authService.register(email, senha)
authService.login(email, senha)

// Banca
bancaService.getSaldo()
bancaService.updateSaldo(novoSaldo)

// Apostas
apostasService.getApostasAtivas()
apostasService.getHistorico()
```

### **Interceptors Axios**
- ✅ **Token automático** - Adiciona JWT em todas as requisições
- ✅ **Tratamento de 401** - Redireciona para login se token inválido
- ✅ **Configuração base** - URL do backend configurada

## 🎨 Interface

### **Design System**
- ✅ **Tailwind CSS** - Framework de estilos
- ✅ **Cores primárias** - Azul como cor principal
- ✅ **Componentes reutilizáveis** - Botões, inputs, cards
- ✅ **Ícones Lucide** - Interface moderna
- ✅ **Responsividade** - Mobile-first

### **Layout**
- ✅ **Sidebar fixa** - Navegação principal
- ✅ **Header dinâmico** - Título da página atual
- ✅ **Conteúdo principal** - Área de trabalho
- ✅ **Navegação** - Links para Dashboard e Banca

## 🧪 Testes

### **Teste de Integração**
```bash
# Testar backend + frontend
node teste-frontend.js
```

### **Cenários Testados**
- ✅ Registro de usuário
- ✅ Login com credenciais
- ✅ Gestão de banca
- ✅ Criação de apostas
- ✅ Listagem de apostas ativas
- ✅ Interface responsiva

## 📊 Funcionalidades Principais

### **🔐 Autenticação**
- Login/Registro integrado
- Token JWT no localStorage
- Redirecionamento automático
- Proteção de rotas

### **💰 Gestão de Banca**
- Visualização de saldo
- Atualização de saldo
- Formatação de moeda
- Validações de entrada

### **🎯 Dashboard de Apostas**
- Lista de apostas ativas
- Cards com informações completas
- Legs detalhadas para cada aposta
- Controle manual de status
- Interface "Ao Vivo"

### **📱 Interface Responsiva**
- Design mobile-first
- Sidebar adaptável
- Cards responsivos
- Navegação intuitiva

## 🔄 Estados das Apostas

### **Status Visuais**
- ✅ **GANHA** - Verde com ícone ✅
- ❌ **PERDIDA** - Vermelho com ícone ❌
- ⚠️ **PENDENTE** - Amarelo com ícone ⚠️

### **Controle Manual**
- Botões para cada leg
- Estados visuais em tempo real
- Não persiste no banco (ainda)
- Interface intuitiva

## 🚀 Como Usar

### **1. Acessar Sistema**
```
http://localhost:5173
```

### **2. Fazer Login**
- Email: `teste@frontend.com`
- Senha: `123456`

### **3. Navegar**
- **Dashboard** - Ver apostas ativas
- **Banca** - Gerenciar saldo

### **4. Testar Funcionalidades**
- Criar apostas no backend
- Visualizar no dashboard
- Alterar status das legs
- Gerenciar saldo da banca

## 🔧 Configuração

### **Variáveis de Ambiente**
```javascript
// api.js
const API_BASE_URL = 'http://localhost:3001'
```

### **Roteamento**
```javascript
// App.jsx
/ - Redireciona para /dashboard
/login - Página de login
/dashboard - Dashboard de apostas
/banca - Gestão de banca
```

## 📈 Próximos Passos

### **Funcionalidades a Implementar**
- [ ] **Salvar status das legs** - Persistir no banco
- [ ] **Histórico de apostas** - Página de histórico
- [ ] **Estatísticas** - Análise de performance
- [ ] **Notificações** - Alertas de apostas
- [ ] **Exportação** - Dados em CSV/PDF

### **Melhorias Técnicas**
- [ ] **Context API** - Estado global
- [ ] **Loading states** - Melhor UX
- [ ] **Error boundaries** - Tratamento de erros
- [ ] **PWA** - Aplicativo offline

---

**🎉 Frontend React completo e funcional!**

**Interface moderna e responsiva para o sistema de apostas.**
