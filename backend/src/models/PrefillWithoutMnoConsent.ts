import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../helpers/sequelize-config';
import {
  Column,
  PrimaryKey,
  AutoIncrement,
  Table,
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import RequestDetail from './RequestDetail'; // Import your RequestDetail model
import ResponseDetail from './ResponseDetail'; // Import your ResponseDetail model

// Define the model configuration object
export const modelConfig = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    callback_url: DataTypes.STRING,
    state_counter: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    state: DataTypes.STRING,
};

interface PrefillWithoutMnoConsentAttributes {
  id: number;
  callback_url: string;
  state_counter: number;
  state: string;
}

interface PrefillWithoutMnoConsentCreationAttributes
  extends Optional<PrefillWithoutMnoConsentAttributes, 'id'> {}

@Table({
  timestamps: true,
  underscored: false,
})
export default class PrefillWithoutMnoConsent extends Model<
  PrefillWithoutMnoConsentAttributes,
  PrefillWithoutMnoConsentCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER)
  id!: number;

  @Column(DataTypes.STRING)
  callback_url!: string;

  @Column(DataTypes.INTEGER)
  state_counter!: number;

  @Column(DataTypes.STRING)
  state!: string;

  // @ts-ignore
  @HasOne(() => RequestDetail)
  requestDetails!: RequestDetail[];

  // @ts-ignore
  @HasMany(() => ResponseDetail)
  responseDetails!: ResponseDetail[];
}
