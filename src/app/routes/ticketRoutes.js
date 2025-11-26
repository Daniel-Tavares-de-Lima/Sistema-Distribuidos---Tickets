const express = require('express');
const TicketController = require('../controllers/TicketController');
const authMiddleware = require('../middlewares/auth');
const { interno } = require('../middlewares/authorization');

const router = express.Router();

const ticketController = new TicketController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);


router.post('/tickets', ticketController.create); // Qualquer usuário autenticado
router.get('/tickets', ticketController.read); // Filtrado por permissão
router.get('/tickets/:id', ticketController.readId); // Com verificação de permissão
router.put('/tickets/:id', interno(), ticketController.update); // Apenas INTERNO
router.delete('/tickets/:id', interno(), ticketController.delete); // Apenas INTERNO

// Ações 
router.put('/tickets/:id/assign-to-me', authMiddleware, ticketController.assignToMe);
router.put('/tickets/:id/return-to-queue', authMiddleware, ticketController.returnToQueue);
// router.post('/tickets/:id/close', interno(), TicketController.close);

module.exports = router;