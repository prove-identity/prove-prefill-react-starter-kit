'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('response_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      payload: {
        type: Sequelize.JSONB,
      },
      parent_state: {
        type: Sequelize.STRING,
      },
      prefill_without_mno_consent_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'prefill_without_mno_consents',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addConstraint('response_details', {
      fields: ['prefill_without_mno_consent_id'],
      type: 'foreign key',
      name: 'fk_request_details_prefill_without_mno_consents',
      references: {
        table: 'prefill_without_mno_consents',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('response_details');
  },
};
