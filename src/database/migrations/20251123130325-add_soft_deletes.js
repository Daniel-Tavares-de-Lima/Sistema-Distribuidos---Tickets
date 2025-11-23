'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    ///---Adiciona deleted_at em form_resposes;
    await queryInterface.addColumn("form_responses", "deleted_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    
  },

  async down (queryInterface) {
    //--Remove as colunas
    await queryInterface.removeColumn("form_responses", "deleted_at");
  }
};
