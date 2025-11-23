const express = require('express');
const TicketController = require('../controllers/TicketController');
const authMiddleware = require('../middlewares/auth');
const { interno } = require('../middlewares/authorization');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);


router.post('/tickets', TicketController.create); // Qualquer usuário autenticado
router.get('/tickets', TicketController.read); // Filtrado por permissão
router.get('/tickets/:id', TicketController.readId); // Com verificação de permissão
router.put('/tickets/:id', interno(), TicketController.update); // Apenas INTERNO
router.delete('/tickets/:id', interno(), TicketController.delete); // Apenas INTERNO

// Ações 
router.put('/tickets/:id/assign-to-me', authMiddleware, TicketController.assignToMe);
router.put('/tickets/:id/return-to-queue', authMiddleware, TicketController.returnToQueue);
// router.post('/tickets/:id/close', interno(), TicketController.close);

module.exports = router;