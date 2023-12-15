import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../helpers/sequelize-config';
import {
  Table,
  Column,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import PrefillWithoutMnoConsent from './PrefillWithoutMnoConsent'; // Import your PrefillWithoutMnoConsent model

// Define the model configuration object
export const modelConfig = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  payload: DataTypes.JSONB,
  parent_state: DataTypes.STRING,
  prefill_without_mno_consent_id: DataTypes.BIGINT,
};

interface ResponseDetailAttributes {
  id: number;
  payload: Record<string, unknown>;
  parent_state: string;
  prefill_without_mno_consent_id: number;
}

interface ResponseDetailCreationAttributes
  extends Optional<ResponseDetailAttributes, 'id'> {}

@Table({
  underscored: true,
  timestamps: true,
})
export default class ResponseDetail extends Model<
  ResponseDetailAttributes,
  ResponseDetailCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER)
  id!: number;

  @Column(DataTypes.JSONB)
  payload!: Record<string, unknown>;

  @Column(DataTypes.STRING)
  parent_state!: string;

  // @ts-ignore
  @ForeignKey(() => PrefillWithoutMnoConsent)
  @Column(DataTypes.BIGINT)
  prefill_without_mno_consent_id!: number;

  // @ts-ignore
  @BelongsTo(() => PrefillWithoutMnoConsent)
  prefillWithoutMnoConsent!: PrefillWithoutMnoConsent;
}
