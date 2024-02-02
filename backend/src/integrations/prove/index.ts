//package import
import
axios, {
  AxiosInstance,
  AxiosRequestConfig,
  Method
} from 'axios';
import axiosRetry from 'axios-retry';
import * as _ from 'lodash';
import {
  StatusCodes
} from 'http-status-codes';
import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes
} from 'crypto';
import { v4 as uuidv4 } from 'uuid';
//module import
import {
  API_BASE_URL,
  OAPI_BASE_URL,
  DEFAULT_REQUEST_HEADERS,
  MFA_SMS_API_URL,
  APPLICATION_DOMAIN,
  Products,
  MAX_RETRIES,
} from './(constants)';
import {
  AuthUrlResponse,
  ProveAuthUrlApiResponse,
  ProveInstantLinkResponse,
  ProveInstantLinkResult,
  ProveVerifyIdentityResponse,
  ProvePrefillResponse,
  ProvePrefillResult,
  ProveSendSMSResponse,
  ProveTrustResponse,
  TrustResponse,
  UserAuthGuidPayload,
  VerifyIdentityPayload,
  VerifyIdentityResponse,
  ConsentStatus,
  ProveStatusCodes,
} from '@src/integrations/prove/(definitions)';
import {
  ProveAdminAuth
} from '@src/integrations/prove/prove-admin-auth/prove-admin-auth';
import {
  ProveApiAdminCredentials
} from '@src/integrations/prove/prove-admin-auth/prove-admin-auth.definitions';
import {
  ADMIN_PREFILL_CLIENT_IDS,
  ADMIN_PREFILL_CREDENTIALS,
} from '@src/integrations/prove/prove-admin-auth/(constants)';
import { 
  AppEnvSelect 
} from '@src/(global_constants)';

export class Prove {
  private tokenProvider: ProveAdminAuth;
  private authCredentialsType?: Products;
  private env: AppEnvSelect = AppEnvSelect.SANDBOX;

  constructor(
    private sessionId: string | undefined = undefined,
    product: Products | undefined = Products.PREFILL,
  ) {
    this.env = process.env.NODE_ENV === "production" ? AppEnvSelect.PRODUCTION : AppEnvSelect.SANDBOX;
    this.authCredentialsType = product;
    this.tokenProvider = new ProveAdminAuth(this.env);
    this.sessionId = sessionId || uuidv4();
  }

  private getCreds(opts?: { clientType: '' }): {
    apiClientId: string;
    apiSubClientId: string;
    username: string;
    password: string;
  } {
    let apiClientId: string,
      apiSubClientId: string,
      username: string,
      password: string;
    apiClientId =
      ADMIN_PREFILL_CLIENT_IDS[this.env as AppEnvSelect].clientId || '';
    apiSubClientId =
      ADMIN_PREFILL_CLIENT_IDS[this.env as AppEnvSelect].subClientId || '';
    username = ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].username;
    password = ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].password;
    console.log(
      'creds',
      `${apiClientId}, ${apiSubClientId}, ${username}, ${password}`,
    );
    return { apiClientId, apiSubClientId, username, password };
  }

  static async generateUserAuthGuid(): Promise<UserAuthGuidPayload> {
    const userAuthGuid = uuidv4();
    const response = await this.encryptUserAuthGuid(userAuthGuid);
    return response;
  }

  static generateEncryptionKey() {
    return randomBytes(32); // Directly return the 32-byte buffer
  }

  static async encryptUserAuthGuid(
    userAuthGuid: string,
  ): Promise<UserAuthGuidPayload> {
    const iv = randomBytes(16); // Generate a random IV
    const key = this.generateEncryptionKey();
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    let encryptedGuid = cipher.update(userAuthGuid, 'utf8', 'hex');
    encryptedGuid += cipher.final('hex');

    return {
      userAuthGuid,
      encryptedGuid,
      iv: iv.toString('hex'),
      key: key.toString('hex'), // Optionally store the key as hex if needed elsewhere
    };
  }

  static async decryptUserAuthGuid(
    userAuthGuid: string,
    key: string,
    ivHex: string,
  ) {
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = createDecipheriv('aes-256-ctr', key, iv);
      let decryptedGuid = decipher.update(userAuthGuid, 'hex', 'utf8');
      decryptedGuid += decipher.final('utf8');
      return decryptedGuid;
    } catch (e) {
      throw new Error('notauthorized');
    }
  }
  static decryptedToString(decrypted: any) {
    var chars = [],
      decryptedArr = decrypted.toString().split('');
    while (decryptedArr.length !== 0) {
      chars.push(
        String.fromCharCode(parseInt(decryptedArr.splice(0, 2).join(''), 16)),
      );
    }
    return chars.join('');
  }

  public async checkTrust(
    phone: string,
    requestId: string,
    consentStatus: string = ConsentStatus.OPTED_IN,
  ): Promise<Partial<TrustResponse>> {
    try {
      const requestBody = {
        requestId: requestId,
        consentStatus,
        phoneNumber: phone.replace(/[\+,\s]+/gi, ''),
        details: true,
      };
      const proveResult = await this.apiPost(
        'trust/v2',
        requestBody,
        {
          type: this.authCredentialsType,
        },
      ) as Partial<ProveTrustResponse>;
      if (proveResult.status === 0) {
        return {
          ...proveResult.response,
          verified: true,
        }
      } else {
        return {
          ...proveResult.response,
          verified: false,
        }
      }
    } catch (e) {
      throw e;
    }
  }
  public async getAuthUrl(
    sourceIp: string,
    phone: string,
    userAuthGuid: string,
  ): Promise<AuthUrlResponse> {
    const requestId = this.getRequestId();
    try {
      const finalTargetUrl = this.getFinalTargetUrl(userAuthGuid);
      const creds = this.getCreds();
      const proveResult: ProveAuthUrlApiResponse = await this.apiPost(
        'fortified/2015/06/01/getAuthUrl',
        {
          RequestId: requestId,
          sessionId: this.sessionId,
          ApiClientId: creds.apiClientId,
          SubClientId: creds.apiSubClientId,
          SourceIp: sourceIp || '127.0.0.1',
          FinalTargetUrl: finalTargetUrl,
          MobileNumber: phone,
        },
        {
          type: this.authCredentialsType,
        },
      );
      const redirectUrl = await this.getProveRedirectUrl(
        proveResult?.Response?.AuthenticationUrl,
      );
      return {
        ...proveResult.Response,
        redirectUrl,
      } as AuthUrlResponse;
    } catch (e) {
      throw e;
    }
  }

  public async sendSMS(
    phone: string,
    link: string,
    clientName?: string,
  ): Promise<ProveSendSMSResponse> {
    const requestId = this.getRequestId();
    try {
      if (!phone) {
        new Error('please pass a valid phone number');
      }
      const hashedString = createHash('sha256')
        .update(requestId)
        .digest('hex');

      const truncatedString = hashedString.slice(0, 64);
      const phoneNumber: string = phone ? phone : '';
      const smsUrl: string = MFA_SMS_API_URL!;
      const re: any = {
        clientId: process.env.MFA_CLIENT_ID,
        app: 'SmsDelivery',
        clientAcctId: '',
        clientContext: truncatedString,
        license: process.env.MFA_LICENSE_KEY,
        data: {
          namedData: {
            messageText: `Verify your phone number with Prove Zero Knowledge technology. Tap to continue: ${link}`,
          },
          phoneNumber: phoneNumber,
        },
      };
      const proveResult = await this.apiPost(smsUrl, JSON.stringify(re), {
        type: this.authCredentialsType,
        maxBodyLength: 'Infinity',
        moreHeaders: {
          'Request-Id': requestId,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      console.log('Prove API SMS response:', proveResult);
      return proveResult as ProveSendSMSResponse;
    } catch (e) {
      throw e;
    }
  }

  public async getInstantLinkResult(vfp: string): Promise<ProveInstantLinkResult> {
    const requestId = this.getRequestId();
    try {
      const creds = this.getCreds();
      const instantLinkResult: ProveInstantLinkResponse = await this.apiPost(
        `fortified/2015/06/01/instantLinkResult`,
        {
          RequestId: requestId,
          sessionId: this.sessionId,
          apiClientId: creds.apiClientId,
          subClientId: creds.apiSubClientId,
          VerificationFingerprint: vfp,
        },
        {
          type: this.authCredentialsType,
        },
      );
      if (instantLinkResult.Status !== 0) {
        throw new Error(
          'Error validating response; please contact customer support.',
        );
      } else {
        //use criteria to determine if phone is verified
        if (
          instantLinkResult.Response.LinkClicked &&
          instantLinkResult.Response.PhoneMatch !== 'false' &&
          (instantLinkResult?.Response?.LineType === 'Mobile' ||
            instantLinkResult?.Response?.LineType === 'FixedVoIP')
        ) {
          //"indeterminate" means no carrier available (WiFi) waterfalls to "ipMatch" result
          return { verified: true, ...instantLinkResult.Response };
        } else {
          return { verified: false, ...instantLinkResult.Response };
        }
      }
    } catch (e) {
      throw e;
    }
  }
  public async verifyIdentity(
    params: VerifyIdentityPayload,
  ): Promise<VerifyIdentityResponse> {
    const requestId = this.getRequestId(); 
    try {
      const payload = this.constructIdentityConfirmPayload({ ...params, requestId },);
      const proveResult = await this.postVerifyIdentity(payload);
      return this.constructIdentityConfirmResponse(proveResult);
    } catch (e: any) {
      return this.handleError(e, requestId);
    }
  }
  
  private constructIdentityConfirmPayload(params: VerifyIdentityPayload): VerifyIdentityPayload {
    return {
      ...params,
      consentStatus: ConsentStatus.OPTED_IN,
      details: true,
      knowYourCustomer: true,
      dob: params.dob || undefined,
      last4: params.last4 || undefined,
    };
  }
  
  private async postVerifyIdentity(payload: VerifyIdentityPayload): Promise<ProveVerifyIdentityResponse> {
    return this.apiPost(
      `identity/verify/v2`,
      payload,
      {
        type: ProveApiAdminCredentials.PREFILL,
        moreHeaders: { 'Consent-Status': ConsentStatus.OPTED_IN },
      },
    );
  }
  
  private constructIdentityConfirmResponse(proveResult: ProveVerifyIdentityResponse): VerifyIdentityResponse {
    const verified = proveResult.status === ProveStatusCodes.SUCCESS && this.validateIdentity(proveResult).verified;
    return {
      ...proveResult.response,
      status: proveResult?.status,
      proveVerified: proveResult.response.verified,
      verified,
      errorReasons: verified ? undefined : this.validateIdentity(proveResult).errorReasons,
    };
  }
  
  private handleError(e: Error, requestId: string): Partial<VerifyIdentityResponse> {
  // Log error or handle it as needed
    return { verified: false, requestId };
  }
  
  private validateIdentity(proveResult: ProveVerifyIdentityResponse) {
    let errorReasons = [];
    if (!proveResult.response.identifiers)
      errorReasons.push('identifiers condition failed');
    if (!proveResult.response.verified)
      errorReasons.push('verified condition failed');
    if (!proveResult.response?.identifiers?.dob && !proveResult.response?.identifiers?.last4)
      errorReasons.push('dob/ssn condition failed');
    if (errorReasons && errorReasons.length) {
      return { verified: false, errorReasons };
    } else {
      return { verified: true, errorReasons };
    }
  }

  public async identity(
    phoneNumber: string,
    dob?: string,
    last4?: string,
  ): Promise<ProvePrefillResult> {
    const requestId = this.getRequestId();
    try {
      const proveResult = await this.executeIdentityRequest(phoneNumber, requestId, dob, last4,);

      if (proveResult.status !== ProveStatusCodes.SUCCESS) {
        //NO CRM DATA AVAILALBE (allow user to manual entry)
        if (proveResult.status === ProveStatusCodes.NO_DATA_AVAILABLE) {
          return { verified: true, status: proveResult.status, manualEntryRequired: true, requestId };
        } else {
          return { verified: false, status: proveResult.status, requestId };
        }
      }

      return this.processProveResult(proveResult);
    } catch (error) {
      console.error('Error in identity verification:', error);
      return { verified: false, requestId };
    }
  }

  private async executeIdentityRequest(
    phoneNumber: string,
    requestId: string,
    dob?: string,
    last4?: string,
  ): Promise<ProvePrefillResponse> {
    let payload: {
      requestId: string;
      phoneNumber: string;
      last4?: string;
      dob?: string;
    } = {
      requestId,
      phoneNumber,
    };

    if (!!last4) payload = { ...payload, last4 };
    if (!!dob) payload = { ...payload, dob };
    return this.apiPost(`identity/v2`, payload, { type: this.authCredentialsType });
  }

  private processProveResult(proveResult: ProvePrefillResponse): ProvePrefillResult {
    if (proveResult.response && proveResult.response.individual) {
      const { individual } = proveResult.response;
      return {
        verified: true,
        firstName: individual.firstName,
        lastName: individual.lastName,
        dob: individual.dob,
        last4: individual.ssn?.slice(-4)?.toString(),
        address: individual.addresses[0].address,
        extendedAddress: individual.addresses[0].extendedAddress,
        city: individual.addresses[0].city,
        region: individual.addresses[0].region,
        postalCode: individual.addresses[0].postalCode,
      };
    }
    return { verified: false };
  }

  private async getProveRedirectUrl(
    authenticationUrl: string,
  ): Promise<string | null> {
    const url = new URL(authenticationUrl);
    const vfp = url.searchParams.get('vfp');
    if (vfp) {
      const redirectUrl = `${APPLICATION_DOMAIN}/?vfp=${vfp}`;
      return redirectUrl;
    } else {
      return null;
    }
  }

  private getFinalTargetUrl(userAuthGuid: string): string {
    const finalTargetUrl: string = `${APPLICATION_DOMAIN}/redirect/${userAuthGuid}`;
    return finalTargetUrl;
  }

  private useOAuthURL(path: string): boolean {
    return (
      path.includes('trust/v2') ||
      path.includes('eligibility/v2') ||
      path.includes('identity/v2') ||
      path.includes('verify/v2')
    );
  }

  private getRequestId(): string {
    const requestId = `session-${this.sessionId}-request-${uuidv4()}`;
    return requestId;
  }
  //#endregion
  private apiPost(path: string, data?: any, options?: any) {
    return this.apiRequest('POST', path, data, options);
  }
  private createAxiosApiRequest(path: string = ''): AxiosInstance {
    const smsUrlOverride = path.includes('mfa.proveapis');
    const baseURL: string = this.useOAuthURL(path)
      ? OAPI_BASE_URL[this.env as AppEnvSelect] || '' // Use the value from OAPI_BASE_URL if available
      : API_BASE_URL[this.env as AppEnvSelect] || ''; // Use the value from API_BASE_URL if available;
    const url = !smsUrlOverride ? `${baseURL}/${path}` : MFA_SMS_API_URL;
    const api = axios.create({
      baseURL: url,
      headers: DEFAULT_REQUEST_HEADERS,
    });
    axiosRetry(api, {
      retries: MAX_RETRIES,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error: any) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response &&
            [StatusCodes.UNAUTHORIZED, StatusCodes.FORBIDDEN].includes(
              error.response.status,
            ))
        );
      },
      shouldResetTimeout: true,
    });
    return api;
  }
  private async apiRequest(
    method: Method,
    path: string = '',
    data?: any,
    options?: any,
  ) {
    options = _.defaults(options, {
      type: ProveApiAdminCredentials.PREFILL,
    });
    const api = this.createAxiosApiRequest(path);
    const token = this.useOAuthURL(path) ? await this.tokenProvider.getCurrentToken(options.type) : '';
    // clone default headers
    let headers = {
      ...DEFAULT_REQUEST_HEADERS,
      ...(options?.moreHeaders || {}),
    }; 
    //add x-correlation-id to connect the request paths together
    if (!!this.sessionId) headers['x-correlation-id'] = this.sessionId;
    if (!!token) headers.Authorization = `Bearer ${token}`;
    let config: AxiosRequestConfig = {
      method,
      url: api.defaults.baseURL,
      data,
      headers,
    };
    if (method.toLowerCase() === 'get') {
      delete config.data;
    }
    try {
      const response = await api(config);
      return response.data;
    } catch (err: any) {
      if (
        err.response &&
        [StatusCodes.UNAUTHORIZED, StatusCodes.FORBIDDEN].includes(
          err.response.status,
        )
      ) {
        // clone default headers
        headers = {
          ...DEFAULT_REQUEST_HEADERS,
          ...(options?.moreHeaders || {}),
        }; 
        await this.tokenProvider.refreshAdminTokens(options.type);
        const token = this.useOAuthURL(path) ? await this.tokenProvider.getCurrentToken(options.type) : '';
        if (!!this.sessionId) headers['x-correlation-id'] = this.sessionId;
        if (!!token) config!.headers!.Authorization = `Bearer ${token}`;
        const response = await api(config);
        return response.data;
      }
      throw err;
    }
  }
}

