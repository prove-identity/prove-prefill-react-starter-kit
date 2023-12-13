// models/PrefillWithoutMnoConsent.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../helpers/sql-lite';
import Client from './Client';

interface PrefillWithoutMnoConsentAttributes {
  id: number;
  callback_url: string;
  state_counter: number;
  created_at: Date;
  updated_at: Date;
  state: string;
  partner_id: number;
}

interface PrefillWithoutMnoConsentCreationAttributes
  extends Optional<PrefillWithoutMnoConsentAttributes, 'id'> {}

class PrefillWithoutMnoConsent extends Model<
  PrefillWithoutMnoConsentAttributes,
  PrefillWithoutMnoConsentCreationAttributes
> {
  public id!: number;
  public callback_url!: string;
  public state_counter!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public state!: string;
  public partner_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any): void {
    PrefillWithoutMnoConsent.belongsTo(models.Client, {
      foreignKey: 'partner_id',
      as: 'client',
    });
    PrefillWithoutMnoConsent.hasMany(models.RequestDetail, {
      foreignKey: 'prefill_without_mno_consent_id',
      as: 'requestDetails',
    });
    PrefillWithoutMnoConsent.hasMany(models.ResponseDetail, {
      foreignKey: 'prefill_without_mno_consent_id',
      as: 'responseDetails',
    });
  }
}

PrefillWithoutMnoConsent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    callback_url: DataTypes.TEXT,
    state_counter: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    state: DataTypes.STRING,
    partner_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'PrefillWithoutMnoConsent',
    tableName: 'prefill_without_mno_consents',
    underscored: true,
  },
);

export default PrefillWithoutMnoConsent;
