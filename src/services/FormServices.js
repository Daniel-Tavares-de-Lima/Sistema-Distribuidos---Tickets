const { Form } = require("../app/models");

class FormService {
    
    // CREATE
    async createForm(data) {
        //---Desestrutura os campos recebidos
        const { assunto, benefiario, description, is_active } = data;

        //--Campo 'assunto' não pode ser null
        if (!assunto) {
            return { success: false, errors: ["O campo 'assunto' é obrigatório."] };
        }

        ///--Cria o formulario no banco de dados
        const form = await Form.create({
            assunto,
            benefiario,
            description,
            is_active
        });

        return { success: true, form };
    }

    // READ (LISTAR)
    async listForms(page, limit) {
        const offset = (page - 1) * limit; ///--Calcula o offset da pagina


        //--Busca os formularios com limite e offset
        const { count, rows: forms } = await Form.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["created_at", "DESC"]],
        });

        return {
            success: true,
            total: count,
            forms
        };
    }

    // READ BY ID
    async getFormById(id) {
        ///--Busca o formulario pelo id_form
        const form = await Form.findOne({ where: { id_form: id } });

        //--Se nao encontrar:
        if (!form) {
            return { success: false, errors: ["Formulário não encontrado"] };
        }

        return { success: true, form };
    }

    // UPDATE
    async updateForm(id, data) {
        //--Busca o form pelo id
        const form = await Form.findOne({ where: { id_form: id } });

        if (!form) {
            return { success: false, errors: ["Formulário não encontrado"] };
        }

        ///--Atualiza apenas os campos que foram enviados
        await form.update({
            ...(data.assunto && { assunto: data.assunto }),
            ...(data.benefiario && { benefiario: data.benefiario }),
            ...(data.description && { description: data.description }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        });

        //--Recarrega o objeto atualizado
        await form.reload();

        return { success: true, form };
    }

    // DELETE
    async deleteForm(id) {
        const form = await Form.findOne({ where: { id_form: id } });

        if (!form) {
            return { success: false, errors: ["Formulário não encontrado"] };
        }

        await form.destroy(); // paranoid delete

        return { success: true };
    }
}

module.exports = FormService;
