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
import PrefillWithoutMnoConsent from './PrefillWithoutMnoConsent';

interface RequestDetailAttributes {
  id: number;
  request_id: string;
  session_id: string;
  payload: Record<string, unknown>;
  prefill_without_mno_consent_id: number;
  created_at: Date;
  updated_at: Date;
  state: string;
}

interface RequestDetailCreationAttributes
  extends Optional<RequestDetailAttributes, 'id'> {}

@Table({
  tableName: 'request_details',
  underscored: true,
})
export default class RequestDetail extends Model<
  RequestDetailAttributes,
  RequestDetailCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER)
  id!: number;

  @Column(DataTypes.UUID)
  request_id!: string;

  @Column(DataTypes.STRING)
  session_id!: string;

  @Column(DataTypes.JSONB)
  payload!: Record<string, unknown>;

  // @ts-ignore
  @ForeignKey(() => PrefillWithoutMnoConsent)
  @Column(DataTypes.BIGINT)
  prefill_without_mno_consent_id!: number;

  @Column(DataTypes.DATE)
  created_at!: Date;

  @Column(DataTypes.DATE)
  updated_at!: Date;

  @Column(DataTypes.STRING)
  state!: string;

  // @ts-ignore
  @BelongsTo(() => PrefillWithoutMnoConsent)
  prefillWithoutMnoConsent!: PrefillWithoutMnoConsent;
}
