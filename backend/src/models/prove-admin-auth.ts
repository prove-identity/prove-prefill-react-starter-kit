import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
const sequelize = new Sequelize('sqlite::memory:', { logging: false });

interface ProveAdminAuthAttributes {
  id: string;
  name: string;
  accessTokens: any; // Define the appropriate type for accessTokens
}

interface ProveAdminAuthCreationAttributes
  extends Optional<ProveAdminAuthAttributes, 'id'> {}

class ProveAdminAuth extends Model<
  ProveAdminAuthAttributes,
  ProveAdminAuthCreationAttributes
> {
  public id!: string;
  public name!: string;
  public accessTokens!: any; // Define the appropriate type for accessTokens

  // You can define associations here if needed
}

ProveAdminAuth.init(
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
    sequelize,
    modelName: 'ProveAdminAuth',
    timestamps: true,
  },
);

export default ProveAdminAuth;
