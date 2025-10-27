# 🤖 CONFIGURAR IA REAL DO GEMINI

## 🔑 **PASSO A PASSO PARA CONFIGURAR API KEY REAL**

### **1. Obter API Key Gratuita**
1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### **2. Configurar no Sistema**
1. Crie um arquivo `.env` na pasta `backend/`
2. Adicione a linha:
```
GEMINI_API_KEY=sua_chave_aqui
```

### **3. Exemplo de Arquivo .env**
```
# Google Gemini API Key
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# JWT Secret (opcional)
JWT_SECRET=sua-chave-secreta-super-segura
```

### **4. Reiniciar o Servidor**
```bash
cd backend
node server.js
```

## 🧪 **TESTAR IA REAL**

### **Teste via Terminal**
```bash
cd backend
node teste-ia-simulada.js
```

### **Teste via Frontend**
1. Acesse http://localhost:5173/construtor
2. Digite dois times na seção "Análise com IA"
3. Clique em "Analisar com IA"
4. Veja a análise real do Gemini

## ⚠️ **IMPORTANTE**

- A API key é **GRATUITA** e tem limite de uso
- Não compartilhe sua API key publicamente
- Mantenha o arquivo `.env` seguro
- A chave deve começar com `AIzaSy`

## 🎯 **RESULTADO ESPERADO**

Com a API key configurada, você receberá análises **REAIS** do Gemini, não simuladas!

### **Análise Real vs Simulada**
- ✅ **Real**: Dados atuais, estatísticas reais, análise profunda
- ❌ **Simulada**: Dados fictícios, análise básica

---

**🚀 Configure sua API key e tenha análises reais do Gemini!**
