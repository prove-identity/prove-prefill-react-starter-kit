// models/ResponseDetail.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../helpers/sequelize-config';

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

class ResponseDetail extends Model<
  ResponseDetailAttributes,
  ResponseDetailCreationAttributes
> {
  public id!: number;
  public payload!: Record<string, unknown>;
  public parent_state!: string;
  public prefill_without_mno_consent_id!: number;
  public created_at!: Date;
  public updated_at!: Date;

  public static associate(models: any): void {
    ResponseDetail.belongsTo(models.PrefillWithoutMnoConsent, {
      foreignKey: 'prefill_without_mno_consent_id',
      as: 'prefillWithoutMnoConsent',
    });
  }
}

ResponseDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    payload: DataTypes.JSONB,
    parent_state: DataTypes.STRING,
    prefill_without_mno_consent_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'ResponseDetail',
    tableName: 'response_details',
    underscored: true,
  },
);

export default ResponseDetail;
