'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('request_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      request_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4, // Use Sequelize's UUIDV4 function for generating UUIDs
      },
      session_id: {
        type: Sequelize.STRING,
      },
      payload: {
        type: Sequelize.JSONB,
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      state: {
        type: Sequelize.STRING,
      },
    });
    await queryInterface.addConstraint('request_details', {
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
    await queryInterface.dropTable('request_details');
  },
};
