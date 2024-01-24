import { DataTypes, Model, Optional } from 'sequelize';
import {
  Table,
  Column,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import PrefillWithoutMnoConsent from '@src/models//prefill-without-mno-consent';
import { AuthState } from '@src/integrations/prove/(constants)';

// Define the model configuration object
export const modelConfig = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  request_id: DataTypes.STRING,
  payload: DataTypes.JSONB,
  prefill_without_mno_consent_id: DataTypes.BIGINT,
  state: DataTypes.ENUM(
    AuthState.INITIAL,
    AuthState.GET_AUTH_URL,
    AuthState.SMS_SENT,
    AuthState.SMS_CLICKED,
    AuthState.CHECK_ELIGIBILITY,
    AuthState.IDENTITY_VERIFY,
    AuthState.IDENTITY_CONFIRMATION,
  ),
};

export interface RequestDetailAttributes {
  id: number;
  request_id: string;
  payload?: {
    MobileNumber: string; 
    SourceIp: string; 
    Last4?: string; 
  }
  prefill_without_mno_consent_id: number;
  state: AuthState;
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

  @Column(DataTypes.JSONB)
  payload?: Record<string, unknown>;

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
