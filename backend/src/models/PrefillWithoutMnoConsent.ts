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

interface PrefillWithoutMnoConsentAttributes {
  id: number;
  callback_url: string;
  state_counter: number;
  created_at: Date;
  updated_at: Date;
  state: string;
}

interface PrefillWithoutMnoConsentCreationAttributes
  extends Optional<PrefillWithoutMnoConsentAttributes, 'id'> {}

@Table({
  timestamps: true,
  underscored: true,
})
export default class PrefillWithoutMnoConsent extends Model<
  PrefillWithoutMnoConsentAttributes,
  PrefillWithoutMnoConsentCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER)
  id!: number;

  @Column(DataTypes.TEXT)
  callback_url!: string;

  @Column(DataTypes.INTEGER)
  state_counter!: number;

  @Column(DataTypes.DATE)
  created_at!: Date;

  @Column(DataTypes.DATE)
  updated_at!: Date;

  @Column(DataTypes.STRING)
  state!: string;

  // @ts-ignore
  @HasOne(() => RequestDetail)
  requestDetails!: RequestDetail[];

  // @ts-ignore
  @HasMany(() => ResponseDetail)
  responseDetails!: ResponseDetail[];
}
