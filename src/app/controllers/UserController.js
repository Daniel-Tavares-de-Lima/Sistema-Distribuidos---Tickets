const UserServices = require("../../services/UserServices");
const { success, error, paginated } = require("../../utils/responseFormatter");
const { User } = require("../models");

class UserController{
    //--CREATE - Criar um novo Usuário
    async create(req, res){
       try{
        const result = await UserServices.createUser(req.body);

        if(!result.success){
            return res.status(400).json(error("Erro ao criar usuário", result.errors));
        }

        return res.status(200).json(success(result.user, "Usuário criado com sucesso"));
       }catch(err){
            console.log("Erro ao criar usuário: ", err.message);
            return res.status(500).json(error(err.message))
       }
    }


    //---GET - Listar todos os usuários
    async read(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await UserServices.listUsers(page, limit);

            return res.json(paginated(result.users, result.total, page, limit));
        } catch (err) {
            console.error('Erro ao listar usuários:', err);
            return res.status(500).json(error('Erro interno ao listar usuários'));
        }
    }


    //--GET(ID) - Listar usuário por ID
    async readId(req, res) {
    try {
      const { id } = req.params;
      const result = await UserServices.getUserById(id);

      if (!result.success) {
        return res.status(404).json(error('Usuário não encontrado'));
      }

      return res.json(success(result.user));
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json(error('Erro interno ao buscar usuário'));
    }
  }

    //---UPDATE - Atualizar um usuário
    async update(req, res) {
        try {
            const { id } = req.params;
            const result = await UserServices.updateUser(id, req.body);

            if (!result.success) {
                return res.status(400).json(error('Erro ao atualizar usuário', result.errors));
            }

            return res.json(success(result.user, 'Usuário atualizado com sucesso'));
        } catch (err) {
            console.error('Erro ao atualizar usuário:', err);
            return res.status(500).json(error('Erro interno ao atualizar usuário'));
        }
    }


    //--DELETE - Remover o usuário
    async delete(req, res) {
        try {
            const { id } = req.params;

            const result = await UserServices.deleteUser(id);

            if(!result.success){
                return res.status(404).json("Usuário não encontrado");
            }

        
            return res.status(204).send(); // 204 = No Content (sucesso sem corpo)
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            return res.status(500).json({
            error: 'Erro ao deletar usuário'
            });
        }
    }
}


module.exports = UserController;
