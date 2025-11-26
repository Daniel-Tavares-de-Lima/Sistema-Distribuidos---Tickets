const express = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth');

const authController = new AuthController();
const router = express.Router();

// Rota pública - Login
router.post('/login', authController.login);

// Rota protegida - Validar token e retornar dados do usuário
router.get('/validate', authMiddleware, authController.valida);

module.exports = router;