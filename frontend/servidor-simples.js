const express = require('express');
const path = require('path');
const app = express();
const port = 5173;

// Servir arquivos estáticos
app.use(express.static('dist'));

// Rota para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor frontend rodando em http://localhost:${port}`);
  console.log(`📊 Acesse: http://localhost:${port}`);
});
