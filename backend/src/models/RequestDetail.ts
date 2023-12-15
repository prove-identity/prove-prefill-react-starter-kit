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

// Define the model configuration object
export const modelConfig = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  request_id: DataTypes.STRING,
  session_id: DataTypes.STRING,
  payload: DataTypes.JSONB,
  prefill_without_mno_consent_id: DataTypes.BIGINT,
  state: DataTypes.STRING,
};

interface RequestDetailAttributes {
  id: number;
  request_id: string;
  session_id: string;
  payload: Record<string, unknown>;
  prefill_without_mno_consent_id: number;
  state: string;
}

interface RequestDetailCreationAttributes
  extends Optional<RequestDetailAttributes, 'id'> {}

@Table({
  underscored: true,
  timestamps: true,
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

  @Column(DataTypes.STRING)
  state!: string;

  // @ts-ignore
  @BelongsTo(() => PrefillWithoutMnoConsent, {
    onDelete: 'no action',
    foreignKey: 'prefill_without_mno_consent_id',
  })
  prefillWithoutMnoConsent!: PrefillWithoutMnoConsent;
}
