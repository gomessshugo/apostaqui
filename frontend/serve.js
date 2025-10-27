const express = require('express');
const path = require('path');

const app = express();
const PORT = 5173;

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Rota para servir o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});
