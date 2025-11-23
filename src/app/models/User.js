const { Model, Sequelize } = require('sequelize');
const bcrypt = require("bcryptjs");

class User extends Model{
    static init(sequelize){
        super.init({
            //--ID do usuário
            id_user: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: "id_user"
            },
            //--Email do usuário 
            name:  {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(50),
                unique: true,
                allowNull: false,
                validate: {isEmail: true}
            },
            //---CPF do usuário
            cpf: Sequelize.STRING,
            //--Senha do usuário
            password: {
                type: Sequelize.STRING(60),
            },
            //---Tipo de usuário
            role: {
                //---Interno(admin) - Pode fazer tudo no sistema
                //--- Externo(atendente/cliente) - Tem restrições
                type: Sequelize.ENUM("interno", "externo"),
                defaultValue: "interno"
            }
            //--Jogar tudo para paranoid
        }, {
            sequelize, 
            tableName: 'users',
            modelName: "User",
            createdAt: "created_at",
            updatedAt: "updated_at",
            deletedAt: "deleted_at",
            timestamps: true,
            underscored: true,
            paranoid: true
        }
        
    )
    //-- Transforma a senha em Hash antes de salvar ou atualizar.
    this.addHook('beforeSave', async(user) => {
        //--Se existe senha e se ela foi atualizada cria o hash com 8 rounds
        if(user.password && user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 8);
        }
    })
    }

    static associate(models){
        // this.hasMany(models.Ticket, {foreignKey: "user_id", as: "tickets"});
        // this.hasMany(models.Ticket, {foreignKey: 'creator_id',as: 'createdTickets'});
        // this.hasMany(models.Ticket, {foreignKey: 'responsible_id',as: 'assignedTickets',});
        this.hasMany(models.FormResponse, {foreignKey: "creator_id", as:"formResponse"})
    }
    //--Comparar a senha hash com a senha em texto
    checkPassword(password){
        return bcrypt.compare(password, this.password);
    }

    //
}

// export default new User();
module.exports = User;
