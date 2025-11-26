const FormService = require("../../services/FormServices");
const formService = new FormService();

class FormController {

    // CREATE - Criar um novo formulario
    async create(req, res) {
        try {

            const result = await formService.createForm(req.body);

            //--Se a criação falhou retorna um erro
            if (!result.success) {
                return res.status(400).json({ error: result.errors[0] });
            }

            //--Formulario criado
            return res.status(201).json(result.form);

        } catch (error) { //---ERROR
            console.error("Erro ao criar form:", error);
            return res.status(500).json({ error: "Erro ao criar form." });
        }
    }

    // READ LIST
    async read(req, res) {
        try {
            //---Pega os parametros de paginação da URL
            const { page = 1, limit = 10 } = req.query;

            //--Listar os formularios com paginação
            const result = await formService.listForms(page, limit);

            //--Retorna lista paginada, total de paginas, paginas atual e forms
            return res.json({
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
                currentPage: parseInt(page),
                forms: result.forms
            });

        } catch (error) {
            console.error("Erro ao listar forms:", error);
            return res.status(500).json({ error: "Erro ao listar forms." });
        }
    }

    // READ BY ID 
    async readId(req, res) {
        try {
            //--Buscar um formulario pelo ID
            const result = await formService.getFormById(req.params.id);

            //--Se não encontrar retorna um erro
            if (!result.success) {
                return res.status(404).json({ error: result.errors[0] });
            }

            //---retorna formulario
            return res.json(result.form);

        } catch (error) {
            console.error("Erro ao buscar form:", error);
            return res.status(500).json({ error: "Erro ao buscar form." });
        }
    }

    // UPDATE
    async update(req, res) {
        try {

            //--Chama o service para atualizar o formulario passando o id e as novas atualizações
            const result = await formService.updateForm(req.params.id, req.body);

            //--Se não encontrar o formulario retorna erro
            if (!result.success) {
                return res.status(404).json({ error: result.errors[0] });
            }

            //--Retorna o formulario atualizado
            return res.json({ message: "Form atualizado com sucesso!", form: result.form });

        } catch (error) {
            console.error("Erro ao atualizar form:", error);
            return res.status(500).json({ error: "Erro ao atualizar form." });
        }
    }

    // DELETE
    async delete(req, res) {
        try {
            //---Chama o service para deletar o formulario passando o id
            const result = await formService.deleteForm(req.params.id);

            //---Se não encontrar retorna erro
            if (!result.success) {
                return res.status(404).json({ error: result.errors[0] });
            }

            //--Formulario deleteado
            return res.status(204).send();

        } catch (error) {
            console.error("Erro ao deletar form:", error);
            return res.status(500).json({ error: "Erro ao deletar form." });
        }
    }
}

module.exports = FormController;
