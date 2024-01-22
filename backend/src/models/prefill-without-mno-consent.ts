import { DataTypes, Model, Optional } from 'sequelize';
import {
  Column,
  PrimaryKey,
  AutoIncrement,
  Table,
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import RequestDetail from './request-detail'; // Import your RequestDetail model
import ResponseDetail from './response-detail'; // Import your ResponseDetail model

// Define the model configuration object
export const modelConfig = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  session_id: DataTypes.STRING,
  user_id: DataTypes.STRING,
  user_auth_guid: DataTypes.STRING,
  user_auth_guid_claimed: DataTypes.BOOLEAN,
  is_mobile: DataTypes.BOOLEAN,
  callback_url: DataTypes.STRING,
  state_counter: DataTypes.INTEGER,
  state: DataTypes.STRING,
  ownership_check_count: DataTypes.INTEGER,
  verified: DataTypes.BOOLEAN,
  sms_sent_date_time: DataTypes.STRING,
  sms_sent_count: DataTypes.INTEGER,
};

export interface PrefillWithoutMnoConsentAttributes {
  id: number;
  callback_url?: string;
  state_counter?: number;
  state?: string;
  ownership_check_count?: number;
  verified?: boolean; 
  session_id?: string;
  user_id?: string; 
  is_mobile?: boolean; 
  user_auth_guid?: string; 
  user_auth_guid_claimed?: boolean; 
  sms_sent_date_time?: string; 
  sms_sent_count?: number; 
  requestDetail: RequestDetail;
  responseDetails: ResponseDetail;
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
  state_counter?: number;

  @Column(DataTypes.STRING)
  state?: string;

  @Column(DataTypes.STRING)
  sms_sent_date_time?: string; 
  
  @Column(DataTypes.INTEGER)
  sms_sent_count?: number;

  @Column(DataTypes.INTEGER)
  ownership_check_count?: number;

  @Column(DataTypes.BOOLEAN)
  verified?: boolean;   

  @Column(DataTypes.STRING)
  session_id?: string;

  @Column(DataTypes.STRING)
  user_id?: string; 

  @Column(DataTypes.BOOLEAN)
  is_mobile?: boolean; 

  @Column(DataTypes.STRING)
  user_auth_guid?: string;

  @Column(DataTypes.BOOLEAN)
  user_auth_guid_claimed?: boolean; 

  // @ts-ignore
  @HasOne(() => RequestDetail, 'prefill_without_mno_consent_id')
  requestDetail!: RequestDetail;
  // @ts-ignore
  @HasMany(() => ResponseDetail, 'prefill_without_mno_consent_id')
  responseDetails!: ResponseDetail[];
}
