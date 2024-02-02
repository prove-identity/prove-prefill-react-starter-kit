import { AppEnvSelect } from '@src/(global_constants)/index';
import axios from 'axios';
const qs = require('qs');
import { v4 as uuid } from 'uuid';
import {
  ADMIN_OAUTH_HASHING_SECRET,
  ADMIN_PREFILL_CREDENTIALS,
  ADMIN_USER_ID_PROD,
  ADMIN_USER_ID_SANDBOX,
} from './(constants)';
import { OAPI_BASE_URL } from '../(constants)';
import ProveAdminAuthUser from '../../../models/prove-admin-auth-user';
import { encryptAES, decryptAES } from '../../../helpers/crypto.helper';
import {
  ProveApiCredentialTypes,
  ProveApiAdminCredentials,
  RefreshAdminTokens,
} from './prove-admin-auth.definitions';

interface AuthResult {
  id_token: string;
  access_token: string;
  session_state: string;
}

interface AdminAccessTokens {
  [key: string]: {
    accessToken: string;
    idToken: string;
    sessionState: string;
  };
}

class ProveAdminAuth {
  private accessTokens = new Map<ProveApiCredentialTypes, string>();
  private adminUserID: string;
  constructor(private env: AppEnvSelect) {
    this.adminUserID =(env === AppEnvSelect.PRODUCTION ? ADMIN_USER_ID_PROD : ADMIN_USER_ID_SANDBOX) || uuid();
  }

  async getCurrentToken(
    type: ProveApiCredentialTypes = ProveApiAdminCredentials.PREFILL,
  ): Promise<string> {
    if (!this.accessTokens.get(type)) {
      await this.getAdminTokens(type);
      return this.accessTokens.get(type) as string;
    }
    return this.accessTokens.get(type) as string;
  }

  async refreshAdminTokens(
    type: ProveApiCredentialTypes = ProveApiAdminCredentials.PREFILL,
  ): Promise<void> {
    try {
      const { id_token, access_token, session_state } =
        await this.authenticate(type);
      await this.insertAdminTokens(type, {
        id_token,
        access_token,
        session_state,
      });
      this.accessTokens.set(type, access_token);
    } catch (e) {
      throw e;
    }
  }

  private async getAdminTokens(
    type: ProveApiCredentialTypes = ProveApiAdminCredentials.PREFILL,
  ): Promise<void> {
    try {
      const admin = await ProveAdminAuthUser.findOne({
        where: { id: this.adminUserID },
      });
      let accessTokens: AdminAccessTokens | any =
        admin?.get('accessTokens') || {};

      if (
        !accessTokens ||
        !accessTokens[type] ||
        !accessTokens[type].accessToken
      ) {
        await this.refreshAdminTokens(type);
        return;
      }

      const accessToken: any = accessTokens[type].accessToken;
      const decryptedToken = await decryptAES(
        accessToken,
        ADMIN_OAUTH_HASHING_SECRET || '',
      );
      this.accessTokens.set(type, decryptedToken);
    } catch {
      await this.refreshAdminTokens(type);
    }
  }

  private async insertAdminTokens(
    type: ProveApiCredentialTypes = ProveApiAdminCredentials.PREFILL,
    refreshedTokens: RefreshAdminTokens,
  ): Promise<void> {
    try {
      const { access_token, id_token, session_state } = refreshedTokens;
      const accessTokenHash: any = await encryptAES(
        access_token || '',
        ADMIN_OAUTH_HASHING_SECRET || '',
      );
      const idTokenHash: any = await encryptAES(
        id_token!,
        ADMIN_OAUTH_HASHING_SECRET || '',
      );
      const admin = await ProveAdminAuthUser.findOne({
        where: { id: this.adminUserID },
      });
      let accessTokens: AdminAccessTokens | {} =
        admin?.get('accessTokens') || {};

      accessTokens = {
        ...accessTokens,
        [type]: {
          accessToken: accessTokenHash,
          idToken: idTokenHash,
          sessionState: session_state || '',
        },
      };

      await admin?.update({ accessTokens });
    } catch (error: any) {
      throw error;
    }
  }

  private async authenticate(
    type: ProveApiCredentialTypes = ProveApiAdminCredentials.PREFILL,
  ): Promise<AuthResult> {
    try {
      const { username, password } = this.getAdminUsernamePassword(type);
      const result = await this.apiPost(`token`, {
        grant_type: 'password',
        username,
        password,
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  }

  private async apiPost(path: string, data?: any): Promise<any> {
    try {
      const url: string = `${OAPI_BASE_URL[this.env as AppEnvSelect]}/${path}`;
      const response = await axios.post(url, qs.stringify(data), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      } else {
        throw error;
      }
    }
  }

  private getAdminUsernamePassword(type: ProveApiCredentialTypes): {
    username: string;
    password: string;
  } {
    let username: string = '';
    let password: string = '';

    switch (type) {
      case ProveApiAdminCredentials.PREFILL:
        const prefillCreds =
          ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect];
        username = prefillCreds.username || '';
        password = prefillCreds.password || '';
        break;
      default:
        const credentials = ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect];
        username = credentials.username || '';
        password = credentials.password || '';
        break;
    }
    return {
      username,
      password,
    };
  }
}

export { ProveAdminAuth };
