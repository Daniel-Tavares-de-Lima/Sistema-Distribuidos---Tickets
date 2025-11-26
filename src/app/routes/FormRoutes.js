const express = require('express');
const FormController = require('../controllers/FormController');
// const authMiddleware = require('../middlewares/auth');
// const { isInterno } = require('../middlewares/authorization');

const formController = new FormController();
const router = express.Router();

// router.use(authMiddleware);

router.post('/forms', formController.create);       // Criar form
router.get('/forms', formController.read);          // Listar todos
router.get('/forms/:id',  formController.readId);    // Buscar por ID
router.put('/forms/:id', formController.update);    // Atualizar
router.delete('/forms/:id', formController.delete); // Deletar (soft delete)

module.exports = router;
