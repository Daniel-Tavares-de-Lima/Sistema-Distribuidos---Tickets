const e = require("express");
const {Ticket, Form, FormResponse, User} = require("../app/models");
const { success, error } = require("../utils/responseFormatter");
const eventPublisher = require("../utils/eventPublisher");

class TicketServices{
    //---Valida transição de status
    validateStatusTransition(currentStatus, newStatus, responsibleId = null){
        const errors = [];

        //---Todos os andamentos possíveis
        const transitions = {
            ABERTO: ["EM_ANDAMENTO"],
            EM_ANDAMENTO: ["FECHADO", "ABERTO"],
            FECHADO: []
        }

        //--Obtém as transições validas para o status atual
        const allowTransitions = transitions[currentStatus];
        console.log(allowTransitions)

        //---Verifica se não há newStatus no array allowTransitions
        if(!allowTransitions.includes(newStatus)){
            errors.push(`Não é possivel mudar de ${currentStatus} para ${newStatus}`);

            //--Retorna o resultado da validação com o erro
            return{
                valid: false,
                errors, 
                allowTransitions
            }
        }

        //---Mudar para andamento
        if(newStatus === "EM_ANDAMENTO" && !responsibleId){
            errors.push("Para mudar para 'ANDAMENTO' é necessário atribuir um responsável");
        }

        //----Fechar um ticket
        if(newStatus === "FECHADO" && currentStatus !== "EM_ANDAMENTO"){
            errors.push("Só é pissível fechar um ticket que esteja em ANDAMENTO");
        }

        //--Retorna a validação 
        return{
            valid: errors.length === 0,
            errors
        }
    }


    //---Valida se o formulário existe e se está ativo
    async validateForm(id){
        const form  = await Form.findOne({where: {id_form: id}});

        //--Não encontrado
        if(!form){
            return{
                valid: false,
                errors: ["Formulário não encontrado."]
            }
        }

        ///-Não está ativo
        if(!form.is_active){
            return{
                valid: false,
                errors: ["Esse formulário está inativo e não pode ser usado"]
            }
        }

        return{
            valid: true,
            form
        }

    }


    ///----Valida se response existe e pertence ao form
    async validateFormResponse(responseId, formId){
        //--Se não foi enviada nenhuma resposta
        if(!responseId){
            return {valid: true, response: null}
        }

        //--Busca a resposta pelo ID
        const response = await FormResponse.findByPk(responseId);

        //---Se não encontrar retorna erro
        if(!response){
            return {valid: false, errors: ["Resposta de formulário não encontrada"]}
        }   


        //--Verifica se a resposta pertence ao mesmo formulário
        if(response.form_id !== formId){
            return{
                valid: false, errors: ["A Resposta não pertence ao formulário informado"]
            }
        }

        return{
            valid: true,
            response
        }
    }


    ///---Verifica se o ticket pode ser editado
    canEditTicket(ticket){
        if(ticket.status === "FECHADO"){
            return{
                valid: false,
                errors: ["Ticket FECHADO não pode ser editado"]
            }
        }

        return {valid: true}
    }

    //--Verifica permissões de usuários sobre tickets
    checkUserPermission(user, ticket){
        if(user.role === "externo" && ticket.creator_id !== user.id){
            return{
                valid: false,
                errors: ["Voce só pode visuliazar seus próprios tickets"]
            }
        }

        return {valid: true}
    }
//--IF cada; query string - paraments/POSTMAN

    //---Monta filtros para listagem
    buildListFilters(user, filters = {}){
       const where = {};

       //--Quem é externo vê apenas seus tickets
       if(user.role === 'externo'){
            // user.creator_id = user.id

            //---Verifica se há tickets vinculado ao usuário externo
            if(user.creator_id){
                user.creator_id = user.id
            }
            else{
                return{ 
                    success: false, errors: ["Você não possui nenhum ticket atribuido a você."]
                }
            }
       }

       if(filters.status){
            where.status = filters.status;
       }
       if(filters.priority){
            where.priority = filters.priority
       }
       if(filters.form_id){
            where.form_id = filters.form_id
       }
       if(filters.responsible_id){
            where.response_id = filters.response_id
       }

       return where
    }

    //-------Inclui relacionamentos padrão
    getDefaultIncludes() {
        return [
            {
                association: 'form',
                attributes: ['id_form', 'assunto', 'benefiario', 'description'],
            },
            {
                association: 'creator',
                attributes: ['id_user', 'email', 'role'],
            },
            {
                association: 'responsible',
                attributes: ['id_user', 'email', 'role'],
            },
            {
                association: 'response',
                attributes: ['id', 'content'],
            },
        ];
    }

    //---CREATE --- Cria um novo ticket
    async createTicket(data, creatorId){
        const {form_id, response_id, priority, notes} = data;

        //---Não encontrado o id
        if(!form_id){
            return{
                success: false,
                errors: ["O campo Id é obrigatório"]
            }
        }

        //---Valida o form
        const formValidation = await this.validateForm(form_id);
        if(!formValidation.valid){
            return{
                success: false,
                errors: formValidation.errors
            }
        }


        ///--Valida o response se for informada
        if(response_id){
            const responseValidation = await this.validateFormResponse(response_id, form_id);
            if(!responseValidation.valid){
                return{
                    success: false,
                    errors: responseValidation.errors
                }
            }
        }

        //--Cria o ticket
        const ticket = await Ticket.create({
            form_id,
            response_id: response_id,
            creator_id: creatorId,
            responsible_id: null,
            status: "ABERTO",
            priority: priority,
            notes: notes
            
        })

        //--Recarrega com os relacionamentos
        await ticket.reload({
            include: this.getDefaultIncludes()
        });

        try{
            const creator = await User.findByPk(creatorId);
            const form = formValidation.form;
            await eventPublisher.publishTicketCreated(ticket, creator, form);
        }catch(err){
            console.error(" Erro ao publicar evento de ticket criado:", err.message);
        }

        return{
            success: true,
            ticket
        }
    }

//----OFFSET - Sequelize
    //----Lista tickets com os filtros
    async listTickets(user, page = 1, limit = 10, filters = {}){
        const offset = (page - 1) * limit;

        const where = this.buildListFilters(user, filters);
        //----
        //---Filtra no banco de dados
        const { count, rows: tickets} = await Ticket.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ["priority", "DESC"], //--Prioridade maior primeiro
                ["created_at", "DESC"] 
            ],
            include: this.getDefaultIncludes()
        })

        return{
            tickets,
            total: count,
            // totalPages: Math.ceil(count / limit),
            // currentPage: parseInt(page)
        }
    }


    //---Busca o ticket por ID
    async getTicketById(ticketId, user){
        const ticket = await Ticket.findOne({
            where: {id_ticket: ticketId},
            include: this.getDefaultIncludes()
        })

        if(!ticket){
            return {success: false, errors: ["Ticket não encontrado"]}
        }


        ///--Verifica permissões
        const permission = this.checkUserPermission(user, ticket );

        if(!permission.valid){
            return{
                success: false,
                errors: permission.errors
            }
        }

        return{success: true, ticket}
    }


    async updateTicket(ticketId, data){
        //---Encontra o ticket pelo id
        const ticket = await Ticket.findOne({
            where: {id_ticket: ticketId}
        });

        //---Verifica se encontrou, caso não: 
        if(!ticket){
            return{success: false, errors: ["Ticket não encontrado"]}
        }

        //--Verifica se pode editar
        const canEdit = this.canEditTicket(ticket);
        if(!canEdit.valid){
            return{
                success: false, errors: canEdit.errors
            }
        }

        const{status, priority, responsible_id, notes} = data;

    
        //----Verifica  a mudança de status
        // Capturar mudanças
        const changes = {};
        if(status && status !== ticket.status){
            changes.status = { old: ticket.status, new: status };
        }
        if(priority && priority !== ticket.priority){
            changes.priority = { old: ticket.priority, new: priority };
        }
        if(responsible_id !== undefined && responsible_id !== ticket.responsible_id){
            changes.responsible_id = { old: ticket.responsible_id, new: responsible_id };
        }

        if(status && status !== ticket.status){
            const newResponsible = responsible_id !== undefined ? responsible_id : ticket.responsible_id;
            const statusValidation = this.validateStatusTransition(ticket.status, status, newResponsible)

            if(!statusValidation.valid){
                return{success: false, errors: statusValidation.errors, allowTransitions: statusValidation.allowTransitions}
            }
        }

        ///--Verifica se está removendo responsável de um ticket em ANDAMENTO para ABERTO
        if(responsible_id === null && ticket.responsible_id !== null && ticket.status === "EM_ANDAMENTO"){
            await ticket.update({
                responsible_id: null,
                status: "ABERTO",
                ...(priority && {priority}),
                ...(notes !== undefined && {notes})
            });
        }else{
            ///--Atualiza normal
            await ticket.update({
                ...(status && {status}),
                ...(priority && {priority}),
                ...(responsible_id !== undefined && {responsible_id}),
                ...(notes !== undefined && {notes})
            })
        }

        //--Recarrega com os relacionamentos com as outras tabelas
        await ticket.reload({include: this.getDefaultIncludes()});


        // PUBLICAR EVENTOS
        try {
            if(Object.keys(changes).length > 0){
                await eventPublisher.publishTicketUpdated(ticket, changes);
            }

            // Evento específico de fechamento
            if(changes.status && status === 'FECHADO'){
                const resolutionTime = Math.floor(
                    (new Date() - new Date(ticket.created_at)) / 1000 / 60
                );
                await eventPublisher.publishTicketClosed(ticket, resolutionTime);
            }
        } catch (error) {
            console.error('Erro ao publicar eventos de atualização:', error);
        }

        return{
            success: true, ticket
        }
    }


    /////---DELETE - Deletar ticket
    async deleteTicket(ticketId) {
        const ticket = await Ticket.findOne({
            where: { id_ticket: ticketId },
        });

        if (!ticket) {
            return {
                success: false,
                errors: ['Ticket não encontrado'],
            };
        }

        // Verifica se pode deletar
        const canEdit = this.canEditTicket(ticket);
        if (!canEdit.valid) {
            return {
                success: false,
                errors: ['Ticket FECHADO não pode ser deletado'],
            };
        }

        await ticket.destroy();

        return {
            success: true,
        };
    }


    //--Atribui ticket a um usuário (Pegar para mim)
    async assignTicket(ticketId, userId) {
        //---Busca o ticket pelo id
        const ticket = await Ticket.findOne({
            where: { id_ticket: ticketId },
        });


        //---Caso não encontre renorta um erro
        if (!ticket) {
            return {
                success: false,
                errors: ['Ticket não encontrado'],
            };
        }

        //--Só pode pegar para mim se o ticket estiver aberto
        if (ticket.status !== 'ABERTO') {
            return {
                success: false,
                errors: ['Só é possível pegar tickets com status ABERTO'],
            };
        }

        //--Atualiza o ticket, define o responsável e coloca o status como ANDAMENTO
        await ticket.update({
            responsible_id: userId,
            status: 'EM_ANDAMENTO',
        });

        //---Recarrega o ticket com todos os relacionamentos incluídos
        await ticket.reload({
            include: this.getDefaultIncludes(),
        });


        // PUBLICAR EVENTO
        try {
            const responsible = await User.findByPk(userId);
            await eventPublisher.publishTicketAssigned(ticket, responsible);
        } catch (error) {
            console.error('Erro ao publicar evento de atribuição:', error);
        }

        //--Retorna o ticket
        return {
            success: true,
            ticket,
        };
  }

  //---Devolver ticket para fila
  async returnToQueue(ticketId){
    //--Busca o ticket pelo id
    const ticket = await Ticket.findOne({
      where: { id_ticket: ticketId },
    });

    //--Se não encontrar dar erro
    if (!ticket) {
      return {
        success: false,
        errors: ['Ticket não encontrado'],
      };
    }

    //--Só possível devolver um ticket caso ele esteja em ANDAMENTO
    if (ticket.status !== 'EM_ANDAMENTO') {
      return {
        success: false,
        errors: ['Só é possível devolver tickets EM_ANDAMENTO'],
      };
    }

    //--Atualiza o ticket, remove o responsável e retorna para o status aberto
    await ticket.update({
      responsible_id: null,
      status: 'ABERTO',
    });

    //--Recarrega o ticket com os seus relacionamentos
    await ticket.reload({
      include: this.getDefaultIncludes(),
    });

    // 🆕 PUBLICAR EVENTO
    try {
        await eventPublisher.publishTicketReturned(ticket);
    } catch (error) {
        console.error('Erro ao publicar evento de devolução:', error);
        }

    //--Retorna o ticket
    return {
      success: true,
      ticket,
    };
  }


//   async closeTicket(ticketId) {
//     const ticket = await Ticket.findOne({
//       where: { id_ticket: ticketId },
//     });

//     if (!ticket) {
//       return {
//         success: false,
//         errors: ['Ticket não encontrado'],
//       };
//     }

//     if (ticket.status !== 'EM_ANDAMENTO') {
//       return {
//         success: false,
//         errors: ['Só é possível fechar tickets que estejam EM_ANDAMENTO'],
//       };
//     }

   
       
}

module.exports = TicketServices;