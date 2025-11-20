const express = require('express');
const FormController = require('../controllers/FormController');
// const authMiddleware = require('../middlewares/auth');
// const { isInterno } = require('../middlewares/authorization');

const router = express.Router();

// router.use(authMiddleware);

router.post('/forms', FormController.create);       // Criar form
router.get('/forms', FormController.read);          // Listar todos
router.get('/forms/:id',  FormController.readId);    // Buscar por ID
router.put('/forms/:id', FormController.update);    // Atualizar
router.delete('/forms/:id', FormController.delete); // Deletar (soft delete)

module.exports = router;
