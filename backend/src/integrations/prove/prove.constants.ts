import { AppEnvSelect } from '@src/_global/index';
export const API_PREFILL_CLIENT_ID = process.env.PROVE_API_CLIENT_ID;
export const API_PREFILL_SUB_CLIENT_ID = process.env.PROVE_API_SUB_CLIENT_ID;
export const API_PREFILL_USERNAME = process.env.PROVE_API_PREFILL_USERNAME;
export const API_PREFILL_PASSWORD = process.env.PROVE_API_PREFILL_PASSWORD;
export const PROVE_TRUST_SCORE_CUTOFF_DEFAULT = parseInt(
  process.env.PROVE_TRUST_SCORE_CUTOFF_DEFAULT!,
);
export const MOBILE_FINAL_URL = '';
export const SMS_API_URL = `sendSms/placeholder/v1`;

export const SMS_CLIENTID: string = process.env.SMS_CLIENTID!;
export const PROVE_UI_URL: string = process.env.PROVE_UI_URL!;
export enum AccountStatus {
  CREATED = 'CREATED',
  NOACCOUNT = 'NOACCOUNT',
  OPEN = 'OPEN', //Waiting on data to be submitted to one or more fields. This is the initial state before any information has been submitted, or if there were correctable problems with a previous submission.
  PENDING = 'PENDING', //    Information has been fully submitted and is waiting on review from Wyre.
  APPROVED = 'APPROVED', //Information has been reviewed and accepted by Wyre
  CLOSED = 'CLOSED', //The Account has been closed and may not transact. Customer service followup is necessary for further actions.
}

export const DEFAULT_REQUEST_HEADERS: any = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export const enum Products {
  PREFILL = 'prefill',
}

export const API_BASE_URL: { [type in AppEnvSelect]: string | undefined } = {
  [AppEnvSelect.PRODUCTION]: process.env.PROVE_IDENTITY_API_BASE_URL_PROD,
  [AppEnvSelect.SANDBOX]: process.env.PROVE_IDENTITY_API_BASE_URL_STAGING,
};

export const OAPI_BASE_URL: { [type in AppEnvSelect]: string | undefined } = {
  [AppEnvSelect.PRODUCTION]: process.env.PROVE_IDENTITY_API_BASE_URL_PROD,
  [AppEnvSelect.SANDBOX]: process.env.PROVE_IDENTITY_API_BASE_URL_STAGING,
};

export const PROVE_CLIENT_SECRET = process.env.PROVE_CLIENT_SECRET || 'test123';
export const PROVE_VERIFICATION_URL = process.env.PROVE_VERIFICATION_URL;
export const FINAL_URL = process.env.FINAL_URL;

export const OWNERSHIP_CHECK_ATTEMPT_CAP = 3;
export const MAX_RETRIES = 3;
