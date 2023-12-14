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

interface ResponseDetailAttributes {
  id: number;
  payload: Record<string, unknown>;
  parent_state: string;
  prefill_without_mno_consent_id: number;
  created_at: Date;
  updated_at: Date;
}

interface ResponseDetailCreationAttributes
  extends Optional<ResponseDetailAttributes, 'id'> {}

@Table({
  tableName: 'response_details',
  underscored: true,
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

  @Column(DataTypes.DATE)
  created_at!: Date;

  @Column(DataTypes.DATE)
  updated_at!: Date;

  // @ts-ignore
  @BelongsTo(() => PrefillWithoutMnoConsent)
  prefillWithoutMnoConsent!: PrefillWithoutMnoConsent;
}
