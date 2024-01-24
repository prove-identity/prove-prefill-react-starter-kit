import { DataTypes, Model, Optional } from 'sequelize';
import {
  Table,
  Column,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import PrefillWithoutMnoConsent from './prefill-without-mno-consent'; // Import your PrefillWithoutMnoConsent model
import { AuthState } from '@src/integrations/prove/(constants)';
import { SuccessTrustResponse } from '@src/services/reputation/(definitions)';
import { SuccessIdentityConfirmationResponse, SuccessIdentityResponse } from '@src/services/ownership/(definitions)';
import { SuccessSendSMSResponse, SuccessInstantLinkResult } from '@src/services/possesion/(definitions)';

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

export interface ResponseDetailAttributes {
  id: number;
  payload?: ResponseDetailPayload;
  parent_state: AuthState;
  prefill_without_mno_consent_id: number;
}

export interface ResponseDetailPayload {
  success_trust_response?: Partial<SuccessTrustResponse>;
  success_sms_response?: Partial<SuccessSendSMSResponse>;
  success_instant_link_result?: Partial<SuccessInstantLinkResult>; 
  success_identity_response?: Partial<SuccessIdentityResponse>;
  success_identity_confirmation_response?: Partial<SuccessIdentityConfirmationResponse>;
}

interface ResponseDetailCreationAttributes
  extends Optional<ResponseDetailAttributes, 'id'> { }

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
