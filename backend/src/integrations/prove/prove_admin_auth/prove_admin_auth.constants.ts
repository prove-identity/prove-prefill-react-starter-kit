import { AppEnvSelect } from '@src/_global/index';

export const ADMIN_USER_ID = process.env.ADMIN_USER_ID!;
export const ADMIN_USER_ID_DEV = process.env.ADMIN_USER_ID_DEV!;
export const ADMIN_OAUTH_HASHING_SECRET =
  process.env.ADMIN_OAUTH_HASHING_SECRET;

export const ADMIN_PREFILL_CREDENTIALS: {
  [type in AppEnvSelect]: { username: string; password: string };
} = {
  [AppEnvSelect.PRODUCTION]: {
    username: process.env.PROVE_PREFILL_USERNAME_PROD!,
    password: process.env.PROVE_PREFILL_PASSWORD_PROD!,
  },
  [AppEnvSelect.SANDBOX]: {
    username: process.env.ADMIN_PREFILL_USERNAME_DEV!,
    password: process.env.ADMIN_PREFILL_PASSWORD_DEV!,
  },
};

export const ADMIN_PREFILL_CLIENT_IDS: {
  [type in AppEnvSelect]: { clientId: string; subClientId: string };
} = {
  [AppEnvSelect.PRODUCTION]: {
    clientId: process.env.PROVE_API_CLIENT_ID!,
    subClientId: process.env.PROVE_API_CLIENT_ID!,
  },
  [AppEnvSelect.SANDBOX]: {
    clientId: process.env.PROVE_API_CLIENT_ID!,
    subClientId: process.env.PROVE_API_CLIENT_ID!,
  },
};
