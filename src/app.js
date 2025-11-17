const express = require('express');
const cors = require('cors');
const app = express();               
// Middlewares globais
app.use(cors()); // Permite requisições de outros domínios
app.use(express.json()); // Interpreta JSON no body das requisições
app.use(express.urlencoded({ extended: true })); // Interpreta dados de formulário

// Rota de teste (health check)
app.get('/', (req, res) => {
  res.json({
    message: 'API de Chamados - Ticket System',
    version: '1.0.0',
    status: 'online',
  });
});

// Rota 404 - Quando a rota não existe
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro capturado:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;