const { Model, Sequelize } = require("sequelize");

class Ticket extends Model{
    static init(sequelize){
        super.init({
            id_ticket:{
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            form_id:{
                type: Sequelize.INTEGER,
                allowNull: false,
                references:{
                    model: "forms",
                    key:"id_form"
                },
                comment: "ID do formulário vinculado"
            },
            response_id:{
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "form_responses",
                    key: "id"
                },
                comment: "ID da resposta do formulário"
            },

            creator_id:{
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id_user"
                },
                comment: "ID do usuário que criou o ticket"
            },
            responsible_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references:{
                    model: "users",
                    key:"id_user"
                },
                comment: "ID do usuário responsável pelo ticket"
            },
            status: {
                type: Sequelize.ENUM("ABERTO", "EM_ANDAMENTO", "FECHADO"),
                allowNull: false,
                defaultValue: "ABERTO",
                comment: "Status atual do ticket"
            },
            priority:{
                type: Sequelize.ENUM("BAIXA", "MEDIA", "ALTA"),
                allowNull: false,
                defaultValue: "BAIXA",
                comment: "Prioridade do ticket"
            },
            notes:{
                type: Sequelize.TEXT,
                allowNull: true,
                comment: "Descrição"
            }
            
        },

        {
        sequelize,
        tableName: "tickets",
        modelName: "Ticket",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        timestamps: true,
        underscored: true,
        paranoid: true ////----
      }
    )

    return this;
    }

    static associate(models){
        //--Ticket pertence a um Form
        this.belongsTo(models.Form, {
            foreignKey: "form_id",
            as: "form"
        });

        //--Ticket pode ter uma Form Response vinculada
        this.belongsTo(models.FormResponse, {
            foreignKey: "response_id",
            as: "response"
        })

        //---Ticket pertence a um usuário
        this.belongsTo(models.User, {
            foreignKey: "creator_id",
            as: "creator"
        });

        //---Ticket pode ter um responsável
        this.belongsTo(models.User,{
            foreignKey: "responsible_id",
            as: "responsible"
        })
    }

    //--Verifica se pode alterar o Ticket
    editTicket(){
        return this.status !== "FECHADO";
    }

    //---Verifica a transição de status válida
    statusTicket(newStatus){
        const transicoes = {
            ABERTO: ["EM_ANDAMENTO"],
            EM_ANDAMENTO: ["FECHADO", "ABERTO"],
            FECHADO: []
        }

        return transicoes[this.status]?.includes(newStatus) || false;
    }

    ///--utils validações não faz parte do model.

    //--Metodo para verificar se pode ir para EM_ANDAMENTO
    andamento(){
        return this.status === "ABERTO" && this.responsible_id != null;
    }

    //--Metodo para verificar se pode FECHAR
    fechar(){
        return this.status === "EM_ANDAMENTO"
    }

    //---Metodo para verificar se pode voltar para ABERTO
    aberto(){
        return this.status === "EM_ANDAMENTO" && this.responsible_id === null;
    }

}

module.exports = Ticket;