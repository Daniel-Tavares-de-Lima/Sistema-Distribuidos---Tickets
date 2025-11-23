// const { Ticket, Form, FormResponse, User } = require('../models');
const { sequelize } = require('../models');
const TicketServices = require("../../services/TicketServices");

const {success, error, paginated} = require("../../utils/responseFormatter");
//--Classe instanciada
const ticketServices = new TicketServices();

//--Validações services
class TicketController {
  // CREATE - Criar um novo ticket
  async create(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      // const { form_id, response_id, priority, notes } = req.body;
      const creator_id = req.user.id;

      const result = await ticketServices.createTicket(req.body, creator_id);

      if(!result.success){
        await transaction.rollback();
        return res.status(400).json(error("Erro ao criar ticket", result.errors))
      }

      await transaction.commit()
      return res.status(200).json(success(result.ticket, "Ticket criado com sucesso"));

    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao criar ticket:', error);
      return res.status(500).json({
        error: 'Erro ao criar ticket.'
      });
    }
  }

  // READ - Listar tickets
  async read(req, res) {
    try {
      //----Criar um middlewares------------
      const {page = 1, limit = 10, status, priority, form_id, responsible_id} = req.query;

      const filters = {status, priority, form_id, responsible_id};

      const result = await ticketServices.listTickets(req.user,page, limit,filters)

      return res.json(paginated(result.tickets), result.total, page, limit);

    } catch (err) {
      console.error('Erro ao listar tickets:', err);
      return res.status(500).json(error("Erro ao listar tickets"));
    }
  }

  // READ BY ID - Buscar ticket por ID
  async readId(req, res) {
    try {
      const { id } = req.params;

      const result = await ticketServices.getTicketById(id, req.user);

      if(!result.success){
        const statusCode = result.errors[0] === "Ticket não encontrado" ? 404 : 403;
        return res.status(statusCode).json(error(result.errors[0]));
      }

      return res.json(success(result.ticket));
      
    } catch (err) {
      console.error('Erro ao buscar ticket:', err);
      return res.status(500).json(error("Erro ao buscar ticket"));
    }
  }

  // UPDATE - Atualizar ticket
  async update(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      if(req.user.role === "externo"){
        await transaction.rollback();
        return res.status(400).json(
          error("Apenas usuários INTERNOS podem atualizar os tickets")
        )
      }

      const result = await ticketServices.updateTicket(id, req.body);

      //---Verifica se encontrou o corpo da requisição, caso não
      if(!result.success){
        await transaction.rollback();
        return res.status(400).json(
          error("Erro ao atualizar o ticket", result.errors)
        );
      }

      await transaction.commit();

      return res.json(success(result.ticket, "Ticket atualizado com sucesso"));
      
    } catch (erro) {
      await transaction.rollback();
      console.error('Erro ao atualizar ticket:', erro);
      return res.status(500).json({
        error: 'Erro ao atualizar ticket.',
      });
    }
  }

  // DELETE - Apagar um  ticket
  async delete(req, res) {
    try {
      const { id } = req.params;

      // EXTERNO não pode deletar
      if (req.user.role === 'externo') {
        return res.status(403).json(
          error('Apenas usuários INTERNOS podem deletar tickets')
        );
      }

      const result = await ticketServices.deleteTicket(id);

      if (!result.success) {
        return res.status(400).json(error(result.errors[0]));
      }

      return res.status(204).send();
    } catch (err) {
      console.error('Erro ao deletar ticket:', err);
      return res.status(500).json(error('Erro interno ao deletar ticket'));
    }
  }

  // AÇÃO: Pegar ticket para mim
  async assignToMe(req, res) {
    //----Verificar 
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Apenas INTERNO pode pegar tickets
      // if (req.user.role !== 'interno') {
      //   await transaction.rollback();
      //   return res.status(403).json(
      //     error('Apenas usuários INTERNOS podem assumir tickets')
      //   );
      // }

      const result = await ticketServices.assignTicket(id, req.user.id);

      if (!result.success) {
        await transaction.rollback();
        return res.status(400).json(error(result.errors[0]));
      }

      //-----Passar pro services
      await transaction.commit();

      return res.json(success(result.ticket, 'Ticket atribuído com sucesso'));
    } catch (err) {
      await transaction.rollback();
      console.error('Erro ao atribuir ticket:', err);
      return res.status(500).json(error('Erro interno ao atribuir ticket'));
    }
  }

  // Devolver ticket para a fila
  async returnToQueue(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Apenas INTERNO pode devolver
      // if (req.user.role !== 'interno') {
      //   await transaction.rollback();
      //   return res.status(403).json(
      //     error('Apenas usuários INTERNOS podem devolver tickets')
      //   );
      // }

      const result = await ticketServices.returnToQueue(id);

      if (!result.success) {
        await transaction.rollback();
        return res.status(400).json(error(result.errors[0]));
      }

      await transaction.commit();

      return res.json(success(result.ticket, 'Ticket devolvido para a fila com sucesso'));
    } catch (err) {
      await transaction.rollback();
      console.error('Erro ao devolver ticket:', err);
      return res.status(500).json(error('Erro interno ao devolver ticket'));
    }
  }


  
  // async close(req, res) {
  //   const transaction = await sequelize.transaction();

  //   try {
  //     const { id } = req.params;

  //     // Apenas INTERNO pode fechar
  //     if (req.user.role !== 'interno') {
  //       await transaction.rollback();
  //       return res.status(403).json(
  //         error('Apenas usuários INTERNOS podem fechar tickets')
  //       );
  //     }

  //     const result = await TicketService.closeTicket(id);

  //     if (!result.success) {
  //       await transaction.rollback();
  //       return res.status(400).json(error(result.errors[0]));
  //     }

  //     await transaction.commit();

  //     return res.json(success(result.ticket, 'Ticket fechado com sucesso'));
    
  // }
}

module.exports = new TicketController();