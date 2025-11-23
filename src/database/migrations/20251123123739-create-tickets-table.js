'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tickets', {
      id_ticket: {
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
      response_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'form_responses',
          key: 'id', 
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
      responsible_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id_user', 
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('ABERTO', 'EM_ANDAMENTO', 'FECHADO'),
        allowNull: false,
        defaultValue: 'ABERTO',
      },
      priority: {
        type: Sequelize.ENUM('BAIXA', 'MEDIA', 'ALTA'),
        allowNull: false,
        defaultValue: 'BAIXA',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    
    await queryInterface.addIndex('tickets', ['form_id']);
    await queryInterface.addIndex('tickets', ['response_id']);
    await queryInterface.addIndex('tickets', ['creator_id']);
    await queryInterface.addIndex('tickets', ['responsible_id']);
    await queryInterface.addIndex('tickets', ['status']);
    await queryInterface.addIndex('tickets', ['priority']);
    await queryInterface.addIndex('tickets', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tickets');
  },
};