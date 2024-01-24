//package import
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import axiosRetry from 'axios-retry';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
//import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
//module import
import {
  API_BASE_URL,
  OAPI_BASE_URL,
  DEFAULT_REQUEST_HEADERS,
  MFA_SMS_API_URL,
  PROVE_UI_URL,
  Products,
  MAX_RETRIES,
} from './(constants)';
import {
  AuthUrlResponse,
  InstantLinkResult,
  ProveAuthUrlApiResponse,
  ProveInstantLinkResponse,
  ProveManualEntryKYC,
  ProvePrefillResponse,
  ProvePrefillResult,
  ProveSendSMSResponse,
  ProveTrustResponse,
  ProveVerifyIdentityResponse,
  TrustResponse,
  UserAuthGuidPayload,
  VerifyIdentityPayload,
} from './prove.definitions';
import { ProveAdminAuth } from '@src/integrations/prove/prove-admin-auth/prove-admin-auth';
import { ProveApiAdminCredentials } from '@src/integrations/prove/prove-admin-auth/prove-admin-auth.definitions';
import {
  ADMIN_PREFILL_CLIENT_IDS,
  ADMIN_PREFILL_CREDENTIALS,
} from '@src/integrations/prove/prove-admin-auth/(constants)';
import { AppEnvSelect } from '@src/(global_constants)';

export class Prove {
  private tokenProvider: ProveAdminAuth;
  private authCredentialsType?: Products;
  private env: AppEnvSelect = AppEnvSelect.SANDBOX;

  constructor(
    product: Products | undefined = Products.PREFILL,
    private sessionID: string | undefined = undefined,
  ) {
    this.env = process.env.NODE_ENV === "production" ? AppEnvSelect.PRODUCTION : AppEnvSelect.SANDBOX;
    this.authCredentialsType = product;
    this.tokenProvider = new ProveAdminAuth(this.env);
    this.sessionID = sessionID || uuidv4();
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
    consentStatus: string = 'optedIn',
  ): Promise<Partial<TrustResponse>> {
    try {
      const requestBody = {
        requestId: requestId,
        consentStatus,
        phoneNumber: phone.replace(/[\+,\s]+/gi, ''),
        details: true,
      };

      const proveResult = {
        "requestId": "123-request-d819a97a-509c-42be-92a3-866cc0fb8c02",
        "status": 0,
        "description": "Success.",
        "response": {
          "transactionId": "12234830336",
          "payfoneAlias": "A473FA4C4VKRKKX4575624C4098635AB80MEKJBQQG39P8B6371BC17DA6908A36A55370D7A735E529F6G3F3F07E4AACA79683B0D3E8F08DD1DD862722",
          "phoneNumber": "19193242574",
          "lineType": "Mobile",
          "carrier": "AT&T Wireless",
          "countryCode": "US",
          "statusIndex": "e1",
          "isBaselined": true,
          "trustScore": 1000,
          "phoneNumberVelocity": 0,
          "portVelocity": 0,
          "payfoneTenure": {
            "minimumDate": "2023-01-22T23:59:59.000Z"
          },
          "phoneNumberTenure": {
            "minimumDate": "2023-01-22T23:59:59.000Z"
          }
        }
      } as Partial<ProveTrustResponse>;

      if (proveResult.status === 0) {
        return {
          ...proveResult.response,
          verified: true,
        }
      } else{
        return {
          ...proveResult.response,
          verified: false,
        }
      }

      // return {
      //   "requestId": "123-request-d819a97a-509c-42be-92a3-866cc0fb8c02",
      //   "status": 0,
      //   "description": "Success.",
      //   "response": {
      //     "transactionId": "12234830336",
      //     "payfoneAlias": "A473FA4C4VKRKKX4575624C4098635AB80MEKJBQQG39P8B6371BC17DA6908A36A55370D7A735E529F6G3F3F07E4AACA79683B0D3E8F08DD1DD862722",
      //     "phoneNumber": "19193242574",
      //     "lineType": "Mobile",
      //     "carrier": "AT&T Wireless",
      //     "countryCode": "US",
      //     "statusIndex": "e1",
      //     "isBaselined": true,
      //     "trustScore": 0,
      //     "phoneNumberVelocity": 0,
      //     "portVelocity": 0,
      //     "payfoneTenure": {
      //       "minimumDate": "2023-01-22T23:59:59.000Z"
      //     },
      //     "phoneNumberTenure": {
      //       "minimumDate": "2023-01-22T23:59:59.000Z"
      //     }
      //   }
      // } as Partial<ProveTrustResponse>;

      //TODO: readd this api call 
      // const proveResult: ProveTrustResponse = await this.apiPost(
      //   'trust/v2',
      //   requestBody,
      //   {
      //     type: this.authCredentialsType,
      //   },
      // );
      // if (proveResult.status === 0) {
      //   return {
      //     ...proveResult.response,
      //     verified: true,
      //   }
      // } else{
      //   return {
      //     ...proveResult.response,
      //     verified: false,
      //   }
      // }
      //return proveResult.response as ProveAuthResponse;
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
          SessionId: 'SubmittedSessionId',
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
      console.log('Prove API response:', proveResult);
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
      console.log('link: ', link);
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

  public async getInstantLinkResult(vfp: string): Promise<InstantLinkResult> {
    const requestId = this.getRequestId();
    try {
      const creds = this.getCreds();
      const instantLinkResult: ProveInstantLinkResponse = await this.apiPost(
        `fortified/2015/06/01/instantLinkResult`,
        {
          RequestId: requestId,
          sessionId: 'SubmittedSessionId',
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
    request_id: string,
  ): Promise<ProveVerifyIdentityResponse> {
    try {
      let payload: any = {
        requestId: request_id || uuidv4(),
        consentStatus: 'optedIn',
        firstName: params.firstName,
        lastName: params.lastName,
        dob: params.dob,
        phoneNumber: params.phoneNumber,
        address: params.address,
        city: params.city,
        region: params.region,
        postalCode: params.postalCode,
        details: true,
        knowYourCustomer: true,
      };
      if (params.last4) {
        payload = { ...payload, last4: params.last4 };
      }
      const proveResult: ProveManualEntryKYC = {
        "requestId": "14f3-b0c4-90e0-90b3-11e1-0800200c9a66",
        "status": 0,  
        "description": "Success.",  
        "response": {
            "verified": true,
            "transactionId": "1234567890",
            "phoneNumber": "13039998877",
            "lineType": "mobile",
            "carrier": "AT&T Wireless",
            "countryCode": "US",
            "name": {
              "firstName": 100,
              "lastName": 100,
              "nameScore": 100
          },  
          "knowYourCustomer": {
            "TotalHits": 0
         },
          "address": {
              "streetNumber": 100,
              "street": true,	
              "city": true,
              "region": true,
              "postalCode": true,
              "distance": 0.0,
              "addressScore": 100
          },  
          "identifiers": { 
                "last4": true, 
                "dob": true
            },   
          "reasonCodes": [
              "NA",
              "P9",
              "OL"
        ]
        }
    }
      // const proveResult: ProveManualEntryKYC = await this.apiPost(
      //   `identity/verify/v2`,
      //   payload,
      //   {
      //     type: ProveApiAdminCredentials.PREFILL,
      //     moreHeaders: {
      //       'Consent-Status': 'optedIn',
      //     },
      //   },
      // );
      console.log('Prove Result', proveResult);
      if (proveResult.status === 0) {
        const { verified, errorReasons } = this.validateIdentity(proveResult);
        if (verified) {
          return {
            verified: true,
            proveResult: proveResult.response,
          } as ProveVerifyIdentityResponse;
        } else {
          return {
            verified: false,
            proveResult: proveResult.response,
            errorReasons,
          } as ProveVerifyIdentityResponse;
        }
      } else {
        return {
          status: proveResult.status,
          verified: false,
          proveResult: proveResult.response,
        } as ProveVerifyIdentityResponse;
      }
    } catch (e) {
      return {
        verified: false,
        proveResult: null,
      } as ProveVerifyIdentityResponse;
    }
  }
  private validateIdentity(proveResult: ProveManualEntryKYC) {
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
    requestId?: string,
  ): Promise<ProvePrefillResult> {
    try {
      const iRequestId = requestId || uuidv4();
      const proveResult = await this.executeIdentityRequest(phoneNumber, iRequestId, dob, last4,);

      if (proveResult.status !== 0) {
        //NO CRM DATA AVAILALBE (allow user to manual entry)
        if(proveResult.status === 1012) {
          return { verified: true, manualEntryRequired: true };
        } else {
          return { verified: false };
        }
      }

      return this.processProveResult(proveResult);
    } catch (error) {
      console.error('Error in identity verification:', error);
      return { verified: false };
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

    if (last4) payload = { ...payload, last4 };
    if (dob) payload = { ...payload, dob };

    // return {
    //   "requestId": "123-request-d819a97a-509c-42be-92a3-866cc0fb8c0b",
    //   "status": 1012,
    //   "description": "No CRM data available",
    //   "additionalInfo": ""
    // }

    return {
      "requestId": "7f83-b0c4-90e0-90b3-11e10800200c9a66",
      "status": 0,
      "description": "Success.",
      "response": {
        "transactionId": "163657716",
        "phoneNumber": "13478035027",
        "lineType": "Mobile",
        "carrier": "Verizon",
        "countryCode": "US",
        "reasonCodes": [
          "PT"
        ],
        "individual": {
          "firstName": "Jack",
          "lastName": "Frost",
          "addresses": [
            {
              "address": "123 Main Street",
              "extendedAddress": "Apt. 2B",
              "city": "San Francisco",
              "region": "CA",
              "postalCode": "94015-2645",
              "firstSeen": "2017-01-20",
              "lastSeen": "2019-12-16"
            },
            {
              "address": "4801 E Washington St",
              "city": "Phoenix",
              "region": "AZ",
              "postalCode": "85034-2004",
              "firstSeen": "2019-01-23",
              "lastSeen": "2020-02-15"
            },
            {
              "address": "123 Main Street",
              "extendedAddress": "",
              "city": "South Falls",
              "region": "NY",
              "postalCode": "80231",
              "firstSeen": "2022-11-07",
              "lastSeen": "2023-03-05"
            }
          ],
          "emailAddresses": [
            "mlongok@amazonaws.com"
          ],
          "dob": "1981-06-27"
        }
      }
    }
    //TODO: readd this api call 
    //return await this.apiPost(`identity/v2`, payload, { type: this.authCredentialsType });
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
      const redirectUrl = `${PROVE_UI_URL}/?vfp=${vfp}`;
      return redirectUrl;
    } else {
      return null;
    }
  }

  private getFinalTargetUrl(userAuthGuid: string): string {
    const finalTargetUrl: string = `${PROVE_UI_URL}/redirect/${userAuthGuid}`;
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
    const requestId = `session-${this.sessionID}-request-${uuidv4()}`;
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
    let headers = {
      ...DEFAULT_REQUEST_HEADERS,
      ...(options?.moreHeaders || {}),
    }; // clone default headers
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
        headers = {
          ...DEFAULT_REQUEST_HEADERS,
          ...(options?.moreHeaders || {}),
        }; // clone default headers
        await this.tokenProvider.refreshAdminTokens(options.type);
        const token = this.useOAuthURL(path) ? await this.tokenProvider.getCurrentToken(options.type) : '';
        if (!!token) config!.headers!.Authorization = `Bearer ${token}`;
        const response = await api(config);
        return response.data;
      }
      throw err;
    }
  }
}

