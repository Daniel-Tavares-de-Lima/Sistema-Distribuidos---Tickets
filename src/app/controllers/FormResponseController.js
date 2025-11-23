const { FormResponse, Form, User } = require('../models');
const FormValidationService = require('../../services/FormValidationServices');

class FormResponseController {
  // CREATE - Criar uma resposta de formulário
  async create(req, res) {
    try {
      const { form_id, content } = req.body;
      console.log('Usuário logado:', req.user);
      const creator_id = req.user.id;

      // Validação 
      if (!form_id || !content) {
        return res.status(400).json({
          error: "Os campos 'form_id' e 'content' são obrigatórios.",
        });
      }

      // Verifica se o formulário existe
      const form = await Form.findOne({
        where: { id_form: form_id },
      });

      if (!form) {
        return res.status(404).json({
          error: 'Formulário não encontrado.',
        });
      }

      // Verifica se o formulário está ativo
      if (!form.is_active) {
        return res.status(400).json({
          error: 'Este formulário está inativo e não pode ser respondido.',
        });
      }

      // Valida se o content está no formato correto
      const validation = FormValidationService.validateResponse(form, content);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Resposta inválida',
          details: validation.errors,
        });
      }

      // Cria a resposta
      const formResponse = await FormResponse.create({
        form_id,
        creator_id,
        content,
      });

      // Recarrega com os relacionamentos
      await formResponse.reload({
        include: [
          {
            association: 'creator',
            attributes: ['id_user', 'email', 'role'],
          },
          {
            association: 'form',
            attributes: ['id_form', 'assunto', 'benefiario', 'description'],
          },
        ],
      });

      return res.status(201).json(formResponse);
    } catch (error) {
      console.error('Erro ao criar resposta:', error);
      return res.status(500).json({
        error: 'Erro ao criar resposta.',
        details: error.message,
      });
    }
  }

  // READ - Listar respostas
  async read(req, res) {
    try {
      const { page = 1, limit = 10, form_id } = req.query;
      const offset = (page - 1) * limit;

      // Monta o filtro
      const where = {};

      // Se usuário é externo, só vê suas próprias respostas
      if (req.user.role === 'externo') {
        where.creator_id = req.user.id;
      }

      // Filtro opcional por formulário
      if (form_id) {
        where.form_id = form_id;
      }

      const { count, rows: responses } = await FormResponse.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [
          {
            association: 'creator',
            attributes: ['id_user', 'email', 'role'],
          },
          {
            association: 'form',
            attributes: ['id_form', 'assunto', 'benefiario'],
          },
        ],
      });

      return res.json({
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        responses,
      });
    } catch (error) {
      console.error('Erro ao listar respostas:', error);
      return res.status(500).json({
        error: 'Erro ao listar respostas.',
        details: error.message,
      });
    }
  }

  // READ BY ID - Buscar uma resposta específica
  async readId(req, res) {
    try {
      const { id } = req.params;

      const formResponse = await FormResponse.findByPk(id, {
        include: [
          {
            association: 'creator',
            attributes: ['id_user', 'email', 'cpf', 'role'],
          },
          {
            association: 'form',
            attributes: ['id_form', 'assunto', 'benefiario', 'description'],
          },
        ],
      });

      if (!formResponse) {
        return res.status(404).json({
          error: 'Resposta não encontrada.',
        });
      }

      // Se usuário é externo, só pode ver suas próprias respostas
      if (
        req.user.role === 'externo' &&
        formResponse.creator_id !== req.user.id
      ) {
        return res.status(403).json({
          error: 'Acesso negado.',
          message: 'Você só pode visualizar suas próprias respostas.',
        });
      }

      return res.json(formResponse);
    } catch (error) {
      console.error('Erro ao buscar resposta:', error);
      return res.status(500).json({
        error: 'Erro ao buscar resposta.',
        details: error.message,
      });
    }
  }

  // UPDATE - Atualizar uma resposta
  async update(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const formResponse = await FormResponse.findByPk(id, {
        include: ['form'],
      });

      if (!formResponse) {
        return res.status(404).json({
          error: 'Resposta não encontrada.',
        });
      }

      // Apenas o criador ou INTERNO pode atualizar
      if (
        req.user.role === 'externo' &&
        formResponse.creator_id !== req.user.id
      ) {
        return res.status(403).json({
          error: 'Acesso negado.',
          message: 'Você só pode editar suas próprias respostas.',
        });
      }

      // Se content foi enviado, valida
      if (content) {
        const validation = FormValidationService.validateResponse(
          formResponse.form,
          content
        );
        if (!validation.valid) {
          return res.status(400).json({
            error: 'Resposta inválida',
            details: validation.errors,
          });
        }

        await formResponse.update({ content });
      }

      // Recarrega com os relacionamentos
      await formResponse.reload({
        include: [
          {
            association: 'creator',
            attributes: ['id_user', 'email', 'role'],
          },
          {
            association: 'form',
            attributes: ['id_form', 'assunto', 'benefiario'],
          },
        ],
      });

      return res.json({
        message: 'Resposta atualizada com sucesso!',
        response: formResponse,
      });
    } catch (error) {
      console.error('Erro ao atualizar resposta:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar resposta.',
        details: error.message,
      });
    }
  }

  // DELETE - Remover uma resposta
  async delete(req, res) {
    try {
      const { id } = req.params;

      const formResponse = await FormResponse.findByPk(id);

      if (!formResponse) {
        return res.status(404).json({
          error: 'Resposta não encontrada.',
        });
      }

      // Apenas o criador ou INTERNO pode deletar
      if (
        req.user.role === 'externo' &&
        formResponse.creator_id !== req.user.id
      ) {
        return res.status(403).json({
          error: 'Acesso negado.',
          message: 'Você só pode deletar suas próprias respostas.',
        });
      }

      // Verifica se existe ticket vinculado
      const ticket = await formResponse.getTicket();
      if (ticket) {
        return res.status(400).json({
          error:
            'Não é possível deletar uma resposta vinculada a um ticket.',
          ticket_id: ticket.id_ticket,
        });
      }

      await formResponse.destroy();

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar resposta:', error);
      return res.status(500).json({
        error: 'Erro ao deletar resposta.',
        details: error.message,
      });
    }
  }
}

module.exports = new FormResponseController();