// models/RequestDetail.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../helpers/sequelize-config';

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

class RequestDetail extends Model<
  RequestDetailAttributes,
  RequestDetailCreationAttributes
> {
  public id!: number;
  public request_id!: string;
  public session_id!: string;
  public payload!: Record<string, unknown>;
  public prefill_without_mno_consent_id!: number;
  public state!: string;

  public static associate(models: any): void {
    RequestDetail.belongsTo(models.PrefillWithoutMnoConsent, {
      foreignKey: 'prefill_without_mno_consent_id',
      as: 'prefillWithoutMnoConsent',
    });
  }
}

RequestDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
    },
    session_id: DataTypes.STRING,
    payload: DataTypes.JSONB,
    prefill_without_mno_consent_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    state: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: 'RequestDetail',
    tableName: 'request_details',
    underscored: true,
  },
);

export default RequestDetail;
