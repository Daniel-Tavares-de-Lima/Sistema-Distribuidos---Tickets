const FormResponseService = require("../../services/FormResponseServices");
const { paginated, error, success } = require("../../utils/responseFormatter");

const formResponseService = new FormResponseService();

class FormResponseController {
  // CREATE
  async create(req, res) {
    //---Chama o servicer para criar o forms passando o usuario que está logado e o corpo
    const result = await formResponseService.createResponse(req.user, req.body);

    //--Se tiver alguma falha retorna erro
    if (!result.success) {
      return res.status(400).json(error("Erro ao criar resposta", result.errors));
    }

    //--Retorna o formulario criado
    return res.status(201).json(success(result.response));
  }

  // GET
  async read(req, res) {
    //---Pega os parametros da query para fazer a paginação e o filtro
    const { page = 1, limit = 10, form_id } = req.query;

    //--Objeto de filtros a ser passado
    const filters = { form_id };

    //-Chama o service para mostrar as reposta com base nos paremetros
    const result = await formResponseService.listResponses(req.user, page, limit, filters);


    return res.json(
      paginated(result.responses, result.total, page, limit)
    );
  }

  // GET BY ID
  async readId(req, res) {
    //--Pega o ID
    const { id } = req.params;

    //---Chama o service para buscar a resposta pelo usuario logado e ID
    const result = await formResponseService.getResponseById(id, req.user);

    //--Se nao encintrar retorna erro
    if (!result.success) {
      return res.status(404).json(error(result.errors[0]));
    }

    //--Retorna a resposta
    return res.json(success(result.response));
  }

  // UPDATE
  async update(req, res) {
    //--Pega o id
    const { id } = req.params;

    ///--Chama o service para atualizar
    const result = await formResponseService.updateResponse(id, req.user, req.body);

    
    if (!result.success) {
      return res.status(400).json(error(result.errors[0]));
    }

    return res.json(success(result.response, "Resposta atualizada com sucesso"));
  }

  // DELETE
  async delete(req, res) {
    const { id } = req.params;

    const result = await formResponseService.deleteResponse(id, req.user);

    if (!result.success) {
      return res.status(400).json(error(result.errors[0]));
    }

    return res.status(204).send();
  }
}

module.exports = FormResponseController;
