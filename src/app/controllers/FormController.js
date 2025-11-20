const { Form } = require('../models');

class FormController {

    // CREATE - Cria um novo formulário
    async create(req, res) {
        try {
            const { assunto, benefiario, description, is_active } = req.body;

            if (!assunto) {
                return res.status(400).json({ error: "O campo 'assunto' é obrigatório." });
            }

            const form = await Form.create({ assunto, benefiario, description, is_active });

            return res.status(201).json(form);
        } catch (error) {
            console.error("Erro ao criar form:", error);
            return res.status(500).json({ error: "Erro ao criar form." });
        }
    }
    //---Lógica services, Filtros Name - parte do usuario
    // READ - Listar todos os forms
    async read(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows: forms } = await Form.findAndCountAll({
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [["created_at", "DESC"]]
            });

            return res.json({
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                forms
            });
        } catch (error) {
            console.error("Erro ao listar forms:", error);
            return res.status(500).json({ error: "Erro ao listar forms." });
        }
    }

    // READ BY ID - Buscar form por ID
    async readId(req, res) {
        try {
            const { id } = req.params;

            const form = await Form.findOne({ where: { id_form: id } });

            if (!form) {
                return res.status(404).json({ error: "Formulário não encontrado." });
            }

            return res.json(form);
        } catch (error) {
            console.error("Erro ao buscar form:", error);
            return res.status(500).json({ error: "Erro ao buscar form." });
        }
    }

    // UPDATE - Atualizar form
    async update(req, res) {
        try {
            const { id } = req.params;
            const { assunto, benefiario, description, is_active } = req.body;

            const form = await Form.findOne({ where: { id_form: id } });

            if (!form) {
                return res.status(404).json({ error: "Formulário não encontrado." });
            }

            await form.update({
                ...(assunto && { assunto }),
                ...(benefiario && {benefiario}),
                ...(description && { description }),
                ...(is_active !== undefined && { is_active })
            });

            await form.reload();

            return res.json({ message: "Form atualizado com sucesso!", form });
        } catch (error) {
            console.error("Erro ao atualizar form:", error);
            return res.status(500).json({ error: "Erro ao atualizar form." });
        }
    }

    // DELETE - Remover form (soft delete)
    async delete(req, res) {
        try {
            const { id } = req.params;

            const form = await Form.findOne({ where: { id_form: id } });

            if (!form) {
                return res.status(404).json({ error: "Formulário não encontrado." });
            }

            await form.destroy(); // Soft delete (paranoid)

            return res.status(204).send();
        } catch (error) {
            console.error("Erro ao deletar form:", error);
            return res.status(500).json({ error: "Erro ao deletar form." });
        }
    }
}

module.exports = new FormController();
