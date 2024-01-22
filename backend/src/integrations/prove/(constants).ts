import { AppEnvSelect } from '@src/(global_constants)/index';
export const PROVE_TRUST_SCORE_CUTOFF_DEFAULT = parseInt(
  process.env.PROVE_TRUST_SCORE_CUTOFF_DEFAULT!,
);
export const PROVE_SMS_API_URL = process.env.PROVE_SMS_API_URL;

export const PROVE_SMS_CLIENTID: string = process.env.SMS_CLIENTID!;
export const PROVE_UI_URL: string = process.env.PROVE_UI_URL!;

export enum AuthState {
  INITIAL = 'initial', 
  GET_AUTH_URL = 'get_auth_url',
  SMS_SENT = 'sms_sent', 
  SMS_CLICKED = 'sms_clicked', 
  CHECK_ELIGIBILITY = 'check_eligibility',
  IDENTITY_VERIFY = 'identity_verify', 
  IDENTITY_CONFIRMATION = 'identity_confirmation'
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
