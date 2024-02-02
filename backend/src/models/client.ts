// models/Client.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@src/helpers/sequelize-config';

// Define the model configuration object
export const modelConfig = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  api_client_id: DataTypes.INTEGER,
  username: DataTypes.STRING,
  password: DataTypes.STRING,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
};

interface ClientAttributes {
  id: number;
  name: string;
  api_client_id: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

interface ClientCreationAttributes extends Optional<ClientAttributes, 'id'> {}

class Client extends Model<ClientAttributes, ClientCreationAttributes> {
  public id!: number;
  public name!: string;
  public api_client_id!: string;
  public username!: string;
  public password!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public page_customization_attributes!: Record<string, unknown>;
  public footer_text!: string;
  public api_validation_attributes!: Record<string, unknown>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    api_client_id: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.TEXT,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Client',
    tableName: 'clients',
    underscored: true,
  },
);

export default Client;
