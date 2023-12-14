// Import Sequelize and necessary modules
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../helpers/sequelize-config';

// Define the attributes for the model
interface ProveAdminAuthAttributes {
  id: string;
  name: string;
  accessTokens: any; // Adjust the data type as needed
  createdAt: Date;
  updatedAt: Date;
}

// Define the creation attributes (optional)
interface ProveAdminAuthCreationAttributes
  extends Optional<ProveAdminAuthAttributes, 'id'> {}

// Define the model class
class ProveAdminAuthUser extends Model<
  ProveAdminAuthAttributes,
  ProveAdminAuthCreationAttributes
> {
  public id!: string;
  public name!: string;
  public accessTokens!: any; // Adjust the data type as needed
  public createdAt!: Date;
  public updatedAt!: Date;

  // Define associations here if needed

}

// Initialize the model
ProveAdminAuthUser.init(
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
      type: DataTypes.JSONB, // Adjust the data type as needed
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'ProveAdminAuthUser',
    tableName: 'prove_admin_auth', // Adjust the table name as needed
    timestamps: true,
  }
);

export default ProveAdminAuthUser;
