const express = require('express');
const UserController = require('../controllers/UserController');
// const authMiddleware = require('../middlewares/auth');
// const { interno } = require('../middlewares/authorization');
const router = express.Router();

// Rotas de usuários
// Rota protegida - Criar usuário 
router.post('/users', UserController.create);       // Criar usuário

// Qualquer usuário autenticado pode ver usuários
router.get('/users', UserController.read);        // Listar todos
router.get('/users/:id',  UserController.readId);     // Buscar por ID

// Apenas INTERNOS podem atualizar e deletar usuários
router.put('/users/:id',  UserController.update);   // Atualizar
router.delete('/users/:id', UserController.delete); // Deletar

module.exports = router;