import { AppEnvSelect } from '@src/_global/index';
import qs from 'query-string';
import axios from 'axios';
import {
  ADMIN_OAUTH_HASHING_SECRET,
  ADMIN_PREFILL_CREDENTIALS,
  ADMIN_USER_ID,
  ADMIN_USER_ID_DEV,
} from './prove_admin_auth.constants';
import { OAPI_BASE_URL } from '../prove.constants';
import { ProveAdminAuthUser } from './prove_admin_auth.models';
import { encryptAES, decryptAES } from '../../../helpers/crypto.helper';
import {
  ProveApiCredentialTypes,
  ProveApiAdminCredentials,
  RefreshAdminTokens,
} from './prove_admin_auth.definitions';

interface AuthResult {
  id_token: string;
  access_token: string;
  session_state: string;
  // Add other necessary fields based on your authentication result
}

interface AdminAccessTokens {
  [key: string]: {
    accessToken: string;
    idToken: string;
    sessionState: string;
    // Add other necessary fields for tokens
  };
}

class ProveAdminAuth {
  private accessTokens = new Map<ProveApiCredentialTypes, string>();
  constructor(private env: AppEnvSelect) {}

  get adminUserID(): string {
    return this.env === AppEnvSelect.PRODUCTION
      ? ADMIN_USER_ID
      : ADMIN_USER_ID_DEV;
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
    const credentials = ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect];
    let username: string = '';
    let password: string = '';

    if (credentials) {
      switch (type) {
        case ProveApiAdminCredentials.PREFILL:
          username = credentials.username || '';
          password = credentials.password || '';
          break;
        default:
          username = credentials.username || '';
          password = credentials.password || '';
          break;
      }
    }
    return {
      username,
      password,
    };
  }
}

export { ProveAdminAuth };
