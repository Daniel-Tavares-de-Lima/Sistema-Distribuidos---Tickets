const express = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Rota pública - Login
router.post('/login', AuthController.login);

// Rota protegida - Validar token e retornar dados do usuário
router.get('/validate', authMiddleware, AuthController.valida);

module.exports = router;