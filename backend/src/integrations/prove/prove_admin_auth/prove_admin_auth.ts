import { AppEnvSelect } from '@src/_global/index';
//package import 
import qs from 'query-string';
import axios from 'axios';
//module import 
import { ADMIN_OAUTH_HASHING_SECRET, ADMIN_PREFILL_CREDENTIALS, ADMIN_USER_ID, ADMIN_USER_ID_DEV } from './prove_admin_auth.constants';
import {
    OAPI_BASE_URL,
} from '../prove.constants';
import { AuthResult, } from '../prove.definitions';
import { ProveAdminAuthUser } from './prove_admin_auth.models';
import { encryptAES, decryptAES } from '../../../helpers/crypto.helper';
import { IOAuthTokensEncrypted, IProveAdmin, ProveApiCredentialTypes, ProveApiAdminCredentials, AdminUsernamePassword, RefreshAdminTokens, AdminAccessTokens, } from './prove_admin_auth.definitions';

export class ProveAdminAuth {
    private accessTokens = new Map<ProveApiCredentialTypes, string>();
    constructor(private env: AppEnvSelect) { }
    get adminUserID(): string {
        return this.env === AppEnvSelect.PRODUCTION ? ADMIN_USER_ID : ADMIN_USER_ID_DEV;
    }
    async getCurrentToken(type: ProveApiCredentialTypes = ProveApiAdminCredentials.PREFILL): Promise<string> {
        if (!this.accessTokens.get(type)) {
            await this.getAdminTokens(type as ProveApiCredentialTypes);
            return this.accessTokens.get(type) as string;
        }
        return this.accessTokens.get(type) as string;
    }
    async refreshAdminTokens(type: ProveApiCredentialTypes = ProveApiAdminCredentials.PREFILL): Promise<void> {
        try {
            let { id_token, access_token, session_state } = await this.authenticate(type);
            await this.insertAdminTokens(type, { id_token, access_token, session_state });
            this.accessTokens.set(type, access_token);
        } catch (e) {
            throw e;
        }
    }
    private async getAdminTokens(type: ProveApiCredentialTypes = ProveApiAdminCredentials.PREFILL): Promise<void> {
        let { accessTokens } = await this.fetchAdminTokens();
        if (accessTokens && accessTokens.get(type)) {
            try {
                const accessToken = accessTokens.get(type)!.accessToken; 
                const decryptedToken = await decryptAES(accessToken, ADMIN_OAUTH_HASHING_SECRET);
                this.accessTokens.set(type, decryptedToken);
            } catch {
                await this.refreshAdminTokens(type);
            }
        } else {
            await this.refreshAdminTokens(type);
        }
    }
    private async authenticate(type: ProveApiCredentialTypes = ProveApiAdminCredentials.PREFILL): Promise<AuthResult> {
        const authResult = await this.login(type as ProveApiCredentialTypes);
        return authResult;
    }
    private async fetchAdminTokens(): Promise<Partial<IProveAdmin>> {
        let adminTokens = await ProveAdminAuthUser.findOne({ _id: this.adminUserID }, {}, { lean: true }).exec();
        return adminTokens;
    }
    private async insertAdminTokens(type: ProveApiCredentialTypes = ProveApiAdminCredentials.PREFILL, refreshedTokens: RefreshAdminTokens): Promise<Partial<IProveAdmin>> {
        const { access_token, id_token, session_state, } = refreshedTokens;
        const { accessTokenHash, idTokenHash } = await this.encryptOAuthTokens(access_token, id_token);
        let doc: IProveAdmin = await ProveAdminAuthUser.findOne({ _id: this.adminUserID }).exec();
        doc.set(`accessTokens.${type}` as ProveApiCredentialTypes, {
            accessToken: accessTokenHash,
            idToken: idTokenHash,
            sessionState: session_state
        });
        return doc.save();
    }
    private async encryptOAuthTokens(accessToken: string, idToken?: string,): Promise<IOAuthTokensEncrypted> {
        const accessTokenHash = await encryptAES(accessToken, ADMIN_OAUTH_HASHING_SECRET);
        const idTokenHash = await encryptAES(idToken, ADMIN_OAUTH_HASHING_SECRET);
        return { accessTokenHash, idTokenHash, };
    }
    private getAdminUsernamePassword(type: ProveApiCredentialTypes): AdminUsernamePassword {
        let username: string, password: string;
        switch (type) {
            case ProveApiAdminCredentials.PREFILL:
                username = ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].username;
                password = ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].password;
                break;
            default:
                username = ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].username;
                password = ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].password;
                break;
        }
        return {
            username,
            password,
        }
    }
    private async login(type: ProveApiCredentialTypes = ProveApiAdminCredentials.PREFILL): Promise<AuthResult> {
        const { username, password, } = this.getAdminUsernamePassword(type);
        return this.apiPost(`token`, {
            'grant_type': 'password',
            username,
            password
        });
    }
    private apiPost(path: string, data?: any, options?: any) {
        return this.apiRequest('POST', path, data, options);
    }
    private async apiRequest(method: string, path: string, data?: any, options?: any) {
        try {
            const url: string = `${OAPI_BASE_URL[this.env as AppEnvSelect]}/${path}`;
            const { data: result } = await axios({
                method,
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                data: qs.stringify(data),
                url,
            });
            return result;
        } catch (err: any) {
            if (!!err.response) {
                const { message } = err.response.data || {};
                if (message) {
                    err = new Error(message);
                    throw err;
                }
            }
            throw err;
        }
    }
}