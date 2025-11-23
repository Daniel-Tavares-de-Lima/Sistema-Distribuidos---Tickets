const { Model, Sequelize } = require('sequelize');

class FormResponse extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        form_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'forms',
            key: 'id_form',
          },
          comment: 'ID do formulário que está sendo respondido',
        },
        creator_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id_user',
          },
          comment: 'ID do usuário que criou a resposta',
        },
        content: {
          type: Sequelize.JSON,
          allowNull: false,
          comment: 'Conteúdo da resposta em formato JSON',
          validate: {
            isValidJSON(value) {
              if (!value || typeof value !== 'object') {
                throw new Error('Content deve ser um objeto JSON válido');
              }
            },
          },
        },
      },
      {
        sequelize,
        modelName: 'FormResponse',
        tableName: 'form_responses',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: "deleted_at",
        timestamps: true,
        underscored: true,
        paranoid: true
      }
    );
    return this;
  }

  static associate(models) {
    // FormResponse pertence a um usuario
    this.belongsTo(models.User, {
      foreignKey: 'creator_id',
      as: 'creator',
    });

    // FormResponse pertence a um Form
    this.belongsTo(models.Form, {
      foreignKey: 'form_id',
      as: 'form',
    });

    // FormResponse pode ter um Ticket vinculado
    this.hasOne(models.Ticket, {
      foreignKey: 'response_id',
      as: 'ticket',
    });
  }
}

module.exports = FormResponse;