'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('form_responses', {
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
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      creator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id_user',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      content: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Respostas do formulário em formato JSON',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Índices para melhorar performance
    await queryInterface.addIndex('form_responses', ['form_id']);
    await queryInterface.addIndex('form_responses', ['creator_id']);
    await queryInterface.addIndex('form_responses', ['created_at']);
  },

  async down (queryInterface) {
    await queryInterface.dropTable('form_responses');
  }
};
