const express = require('express');
const FormResponseController = require('../controllers/FormResponseController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
const formResponseController = new FormResponseController();
// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CRUD de respostas de formulários
router.post('/forms-responses', formResponseController.create);
router.get('/forms-responses', formResponseController.read);
router.get('/forms-responses/:id', formResponseController.readId);
router.put('/forms-responses/:id', formResponseController.update);
router.delete('/forms-responses/:id', formResponseController.delete);

module.exports = router;