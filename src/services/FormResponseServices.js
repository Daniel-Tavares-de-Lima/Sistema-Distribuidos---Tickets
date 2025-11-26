const { FormResponse, Form, Ticket } = require("../app/models");
const FormValidationService = require("./FormValidationServices");
const { Op } = require("sequelize");

class FormResponseService {
  constructor() {
    this.validator = new FormValidationService();
  }

  // VALIDA o FORMULÁRIO
  async validateForm(form_id) {
    //--Busca o formulario pelo ID
    const form = await Form.findOne({ where: { id_form: form_id } });

    //--Se não encontrar:
    if (!form) {
      return { valid: false, errors: ["Formulário não encontrado."] };
    }

    ///--Se não estiver ativo: 
    if (!form.is_active) {
      return { valid: false, errors: ["Este formulário está inativo."] };
    }

    //---Retorna que é falido e objeto form
    return { valid: true, form };
  }

  // VALIDAR PERMISSÃO DO USUÁRIO
  checkUserPermission(user, formResponse) {
    //---Usuario externo so pode ver suas proprias resposta
    if (user.role === "externo" && formResponse.creator_id !== user.id) {
      return {
        valid: false,
        errors: ["Você só pode acessar suas próprias respostas."],
      };
    }

    return { valid: true };
  }

  // CREATE
  async createResponse(user, data) {
    const { form_id, content } = data;

    // valida campos
    if (!form_id || !content) {
      return { success: false, errors: ["form_id e content são obrigatórios."] };
    }

    // valida formulário
    const validationForm = await this.validateForm(form_id);
    if (!validationForm.valid) {
      return { success: false, errors: validationForm.errors };
    }

    // valida conteúdo com regras personalizadas
    const validationContent = this.validator.validateResponse(
      validationForm.form,
      content
    );

    if (!validationContent.valid) {
      return { success: false, errors: validationContent.errors };
    }

    // cria resposta
    const formResponse = await FormResponse.create({
      form_id,
      creator_id: user.id,
      content,
    });

    //--Recarrega a resposta com associações(creater e form) para retornar ao usuario 
    await formResponse.reload({
      include: [
        { association: "creator", attributes: ["id_user", "email", "role"] },
        { association: "form", attributes: ["id_form", "assunto", "benefiario", "description"] },
      ],
    });

    return { success: true, response: formResponse };
  }

  // LISTAR FORMS RESPONSES
  async listResponses(user, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;  //---Calcula o offset da pagina
    const where = {}; //--Objeto de filtros

 
    if (user.role === "externo") {
      where.creator_id = user.id;
    }

    ///--Filtro por form_id******
    if (filters.form_id) {
      where.form_id = filters.form_id;
    }   

    //--Busc resposta no banco com paginação, ordenação e relacionamentos
    const { count, rows } = await FormResponse.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
      include: [
        {
          association: "creator",
          attributes: ["id_user", "email", "role"],
        },
        {
          association: "form",
          attributes: ["id_form", "assunto", "benefiario"],
        },
      ],
    });

    return { total: count, responses: rows };
  }

  // GET BY ID
  async getResponseById(id, user) {
    const formResponse = await FormResponse.findByPk(id, {
      include: [
        { association: "creator", attributes: ["id_user", "email", "cpf", "role"] },
        { association: "form", attributes: ["id_form", "assunto", "benefiario", "description"] },
      ],
    });

    //--Se não encontar a resposta retorna erro
    if (!formResponse) {
      return { success: false, errors: ["Resposta não encontrada."] };
    }

    //--Verifica se o usuario tem permissao para acessar
    const check = this.checkUserPermission(user, formResponse);
    if (!check.valid) {
      return { success: false, errors: check.errors };
    }

    return { success: true, response: formResponse };
  }

  // UPDATE
  async updateResponse(id, user, data) {
    const formResponse = await FormResponse.findByPk(id, {
      include: ["form"], ///--Inclui o formulario para validação do conteudo
    });

    ///--Se noa encontrar retorna erro
    if (!formResponse) {
      return { success: false, errors: ["Resposta não encontrada."] };
    }

    ///-Verifica permissao do usuario
    const check = this.checkUserPermission(user, formResponse);
    if (!check.valid) {
      return { success: false, errors: check.errors };
    }

    //--Se houver conteudo novo, valida e atualiza
    if (data.content) {
      const validation = this.validator.validateResponse(formResponse.form, data.content);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      await formResponse.update({ content: data.content });
    }

    await formResponse.reload({
      include: [
        { association: "creator", attributes: ["id_user", "email", "role"] },
        { association: "form", attributes: ["id_form", "assunto", "benefiario"] },
      ],
    });

    return { success: true, response: formResponse };
  }

  // DELETE
  async deleteResponse(id, user) {
    const formResponse = await FormResponse.findByPk(id);

    if (!formResponse) {
      return { success: false, errors: ["Resposta não encontrada."] };
    }

    const check = this.checkUserPermission(user, formResponse);
    if (!check.valid) {
      return { success: false, errors: check.errors };
    }

    const ticket = await formResponse.getTicket();

    if (ticket) {
      return {
        success: false,
        errors: [`Não é possível deletar resposta vinculada ao ticket ${ticket.id_ticket}.`],
      };
    }

    await formResponse.destroy();

    return { success: true };
  }
}

module.exports = FormResponseService;
