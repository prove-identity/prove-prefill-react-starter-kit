// Import Sequelize and necessary modules
import { Sequelize, DataTypes } from 'sequelize';

// Create Sequelize model
const sequelize = new Sequelize('sqlite::memory:', { logging: false });

const ProveAdminAuthUser = sequelize.define(
    'ProveAdminAuth',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accessTokens: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
    },
    {
        timestamps: true,
    },
);

export { ProveAdminAuthUser };
