const { password } = require("../../config/database");

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id_user: {
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(100)
      },
      cpf: {
        type: Sequelize.STRING(14),
        unique: true,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM("interno", "externo"),
        defaultValue: "interno",
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE, 
        allowNull:false
      }
    })
  },

  async down (queryInterface) {
    await queryInterface.dropTable("users");
  }
};
