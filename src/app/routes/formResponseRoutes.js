const express = require('express');
const FormResponseController = require('../controllers/FormResponseController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CRUD de respostas de formulários
router.post('/forms-responses', FormResponseController.create);
router.get('/forms-responses', FormResponseController.read);
router.get('/forms-responses/:id', FormResponseController.readId);
router.put('/forms-responses/:id', FormResponseController.update);
router.delete('/forms-responses/:id', FormResponseController.delete);

module.exports = router;