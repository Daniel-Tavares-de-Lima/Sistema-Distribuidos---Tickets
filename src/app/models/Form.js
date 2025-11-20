const { Model, DataTypes, Sequelize } = require('sequelize');

class Form extends Model {
  static init(sequelize) {
    super.init(
      {
        //id
        id_form:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        assunto: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: "Assunto do Chamado"
        },
        benefiario:{
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            comment: "Digite o conteúdo de texto que desejar aqui(DESCRIÇÃO)"
        },
        is_active:{
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
        
      },
      {
        sequelize, 
        modelName: 'Form', 
        tableName: 'forms', 
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        timestamps: true, 
        underscored: true, 
        paranoid: true //------------
      }
    );

    
  }

    // static associate(models) {
    //     this.hasMany(models.FormResponse, { foreignKey: 'form_id', as: 'questions' });
    //     this.hasMany(models.Ticket, {foreignKey: 'form_id',as: 'tickets'});
    // }
}

module.exports = Form;
