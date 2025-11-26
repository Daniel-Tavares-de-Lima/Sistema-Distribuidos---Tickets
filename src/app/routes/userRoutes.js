const express = require('express');
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/auth');
const { interno } = require('../middlewares/authorization');
const router = express.Router();

const userController = new UserController();
// Rotas de usuários
// Rota protegida - Criar usuário 
router.post('/users', userController.create);       // Criar usuário

// Qualquer usuário autenticado pode ver usuários
router.get('/users', userController.read);        // Listar todos
router.get('/users/:id', authMiddleware, userController.readId);     // Buscar por ID

// Apenas INTERNOS podem atualizar e deletar usuários
router.put('/users/:id', authMiddleware, interno(), userController.update);   // Atualizar
router.delete('/users/:id', authMiddleware, interno(), userController.delete); // Deletar

module.exports = router;