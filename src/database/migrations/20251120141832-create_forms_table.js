
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('forms', {
      id_form: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      assunto: {
        type: Sequelize.STRING,
        allowNull: false
      },
      benefiario: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('forms');
  }
};
