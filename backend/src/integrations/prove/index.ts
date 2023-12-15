//package import
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import axiosRetry from 'axios-retry';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
//import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
//module import
import {
  API_BASE_URL,
  OAPI_BASE_URL,
  DEFAULT_REQUEST_HEADERS,
  PROVE_CLIENT_SECRET,
  SMS_API_URL,
  SMS_CLIENTID,
  PROVE_UI_URL,
  Products,
  MAX_RETRIES,
  //OWNERSHIP_CHECK_ATTEMPT_CAP,
} from './prove.constants';
import {
  AuthUrlResponse,
  EligibilityResponse,
  EligibilityResult,
  InstantLinkResponse,
  InstantLinkResult,
  //KycStatus,
  ProveAuthApiResponse,
  ProveAuthResponse,
  ProveAuthUrlApiResponse,
  ProveInstantLinkResponse,
  ProveManualEntryKYC,
  ProvePrefillResponse,
  ProveSendSMSReponse,
  ProveVerifyIdentityResponse,
  UserAuthGuidPayload,
  VerifyIdentityPayload,
  VerifyIdentityResponse,
} from './prove.definitions';
import { ProveAdminAuth } from './prove_admin_auth/prove_admin_auth';
import { ProveApiAdminCredentials } from './prove_admin_auth/prove_admin_auth.definitions';
import {
  ADMIN_PREFILL_CLIENT_IDS,
  ADMIN_PREFILL_CREDENTIALS,
} from './prove_admin_auth/prove_admin_auth.constants';
import { AppEnvSelect } from '@src/_global/index';

export class Prove {
  private tokenProvider: ProveAdminAuth;
  private authCredentialsType?: any;

  constructor(
    private env: AppEnvSelect,
    public user: Partial<any> = {},
    private product: Products | undefined = undefined,
    private identityDataId: number | undefined = undefined,
    private sessionID: string | undefined = undefined,
  ) {
    this.env = env;
    this.authCredentialsType = product;
    this.tokenProvider = new ProveAdminAuth(env as AppEnvSelect);
    this.sessionID = sessionID || uuidv4(); 
    console.log(this.env);
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
    switch (opts?.clientType) {
      default:
        apiClientId =
          ADMIN_PREFILL_CLIENT_IDS[this.env as AppEnvSelect].clientId || '';
        apiSubClientId =
          ADMIN_PREFILL_CLIENT_IDS[this.env as AppEnvSelect].subClientId || '';
        username = ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].username;
        password = ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].password;
        break;
    }
    return { apiClientId, apiSubClientId, username, password };
  }

  static async generateUserAuthGuid(): Promise<UserAuthGuidPayload> {
    const userAuthGuid = uuidv4();
    const response = await Prove.encryptUserAuthGuid(userAuthGuid);
    return response;
  }

  static async encryptUserAuthGuid(
    userAuthGuid: string,
  ): Promise<UserAuthGuidPayload> {
    const iv = randomBytes(16); // Generate a random IV (Initialization Vector)
    const cipher = createCipheriv(
      'aes-256-ctr',
      Buffer.from(PROVE_CLIENT_SECRET!, 'hex'),
      iv,
    );
    let encryptedGuid = cipher.update(userAuthGuid, 'utf8', 'hex');
    encryptedGuid += cipher.final('hex');

    return { userAuthGuid, encryptedGuid, iv: iv.toString('hex') };
  }

  static async decryptUserAuthGuid(userAuthGuid: string, ivHex: string) {
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = createDecipheriv(
        'aes-256-ctr',
        Buffer.from(PROVE_CLIENT_SECRET!),
        iv,
      );
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
    consentStatus: string = 'optedIn',
  ): Promise<ProveAuthResponse> {
    const requestId = this.getRequestId();
    try {
      const requestBody = {
        requestId: requestId,
        consentStatus,
        phoneNumber: phone.replace(/[\+,\s]+/gi, ''),
        details: true,
      };
      const proveResult: ProveAuthApiResponse = await this.apiPost(
        'trust/v2',
        requestBody,
        {
          type: this.authCredentialsType,
        },
      );
      await this.updateTrustScoreResults(proveResult.response);
      return proveResult.response as ProveAuthResponse;
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
  ): Promise<ProveSendSMSReponse> {
    const requestId = this.getRequestId();
    try {
      const requestBody = {
        message: `Verify your phone number with Prove Zero Knowledge technology. No personal information is shared with ${clientName}. Tap to continue: ${link}`,
      };

      const proveResult = await this.apiPost(
        SMS_API_URL,
        JSON.stringify(requestBody),
        {
          type: this.authCredentialsType,
          moreHeaders: {
            'Request-Id': requestId,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        },
      );

      return proveResult.Response as ProveSendSMSReponse;
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
  public async eligibility(
    phoneNumber: string,
    productTrustScoreToleranceLimit: number,
  ): Promise<EligibilityResult> {
    const creds = this.getCreds();
    const proveResult: EligibilityResponse = await this.apiPost(
      `identity/eligibility/v2`,
      {
        requestId: uuidv4(),
        phoneNumber,
        ApiClientId: creds.apiClientId,
        SubClientId: creds.apiSubClientId,
        minTrustScore: productTrustScoreToleranceLimit,
      },
      { type: this.authCredentialsType },
    );
    return {
      eligibility: proveResult.response.eligibility || false,
      payfoneAlias:
        proveResult.response.payfoneAlias ||
        `payfonealias:${proveResult?.response?.carrier || ''}`,
    };
  }
  public async verifyIdentity(
    params: VerifyIdentityPayload,
  ): Promise<ProveVerifyIdentityResponse> {
    try {
      let payload: any = {
        requestId: uuidv4(),
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
      const proveResult: ProveManualEntryKYC = await this.apiPost(
        `identity/verify/v2`,
        payload,
        {
          type: ProveApiAdminCredentials.PREFILL,
          moreHeaders: {
            'Consent-Status': 'optedIn',
          },
        },
      );
      if (proveResult.status === 0) {
        const { verified, errorReasons } = this.validateIdentity(proveResult);
        if (!!verified) {
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
    // const addressScore: IFieldToleranceLimitValues = _.find(configurableFieldsLimits, { field: ConfigurableFields.ADDRESS, });
    // const nameScore: IFieldToleranceLimitValues = _.find(configurableFieldsLimits, { field: ConfigurableFields.NAME, });
    let errorReasons = [];
    if (!proveResult.response.identifiers)
      errorReasons.push('identifiers condition failed');
    if (!proveResult.response.verified)
      errorReasons.push('verified condition failed');
    if (!proveResult.response?.identifiers?.dob)
      errorReasons.push('dob condition failed');
    //if (!proveResult?.response?.name?.nameScore || proveResult?.response?.name?.nameScore <= nameScore.value) errorReasons.push('nameScore condition failed');
    //if (!proveResult?.response?.address?.addressScore || proveResult?.response?.address?.addressScore <= addressScore.value) errorReasons.push('addressScore condition failed');
    if (errorReasons && errorReasons.length) {
      return { verified: false, errorReasons };
    } else {
      return { verified: true, errorReasons };
    }
  }

  public async identity(
    phoneNumber: string,
    dob: string,
    last4: string,
  ): Promise<any> {
    try {
      var proveResult: ProvePrefillResponse;
      if (last4 != '') {
        proveResult = await this.apiPost(
          `identity/v2`,
          {
            requestId: uuidv4(),
            phoneNumber,
            dob,
            last4,
            ApiClientId:
              ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].username,
            SubClientId:
              ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].password,
          },
          {
            type: this.authCredentialsType,
          },
        );
      } else {
        // used by the superAdminEnd
        proveResult = await this.apiPost(
          `identity/v2`,
          {
            requestId: uuidv4(),
            phoneNumber,
            dob,
            ApiClientId:
              ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].username,
            SubClientId:
              ADMIN_PREFILL_CREDENTIALS[this.env as AppEnvSelect].password,
          },
          {
            type: this.authCredentialsType,
          },
        );
      }
      if (proveResult.status !== 0) {
        return { verified: false };
      }
      if (proveResult.response && proveResult.response.individual) {
        const { individual } = proveResult.response;
        return {
          verified: true,
          firstName: individual.firstName,
          lastName: individual.lastName,
          dob: individual.dob,
          last4: individual.ssn.slice(-4).toString(),
          address: individual.addresses[0].address,
          extendedAddress: individual.addresses[0].extendedAddress,
          city: individual.addresses[0].city,
          region: individual.addresses[0].region,
          postalCode: individual.addresses[0].postalCode,
        };
      }
      return { verified: false };
    } catch (e) {
      return { verified: false };
    }
  }
  // public async getUserKycStatus() {
  //   //: Promise<KycStatus> {
  //   // let doc = await EndUserIdentityData.findOne({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // })
  //   //     .lean(true)
  //   //     .exec();
  //   // return {
  //   //     reputationCheck: doc?.identityFlags?.reputationCheck || false,
  //   //     possessionCheck: doc?.identityFlags?.possessionCheck || false,
  //   //     proceedToEligibility: doc?.authorizationFlow === Products.PREFILL && !!(doc?.identityFlags?.possessionCheck) ? true : false,
  //   //     eligibilityCheck: doc?.identityFlags?.eligibilityCheck || false,
  //   //     ownershipCheck: doc?.identityFlags?.ownershipCheck || false,
  //   //     ownershipCheckCapReached: doc?.identityFlags?.ownershipCheckCount === OWNERSHIP_CHECK_ATTEMPT_CAP ? true : false,
  //   //     identityVerified: doc?.identityFlags?.identityVerified || false,
  //   //     product: this.product as Products,
  //   // };
  // }
  // async updateInstantLinkResults(
  //   instantLinkResult: InstantLinkResponse,
  //   verified: boolean,
  // ): Promise<void> {
  //   // await EndUserIdentityData.findOneAndUpdate({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // }, {
  //   //     $set: {
  //   //         'authorizationData.authGuidClaimed': true,
  //   //         'authorizationData.authGuidClaimedDate': DateTime.utc().toISO(),
  //   //         'instantLinkData.phoneNumber': instantLinkResult.PhoneNumber,
  //   //         'instantLinkData.phoneMatch': instantLinkResult.PhoneMatch,
  //   //         'instantLinkData.ipAddressMatch': instantLinkResult.IpAddressMatch,
  //   //         'instantLinkData.linkClicked': instantLinkResult.LinkClicked,
  //   //         'instantLinkData.carrier': instantLinkResult.Carrier,
  //   //         'instantLinkData.lineType': instantLinkResult.LineType,
  //   //         'instantLinkData.countryCode': instantLinkResult.CountryCode,
  //   //         'instantLinkData.transactionId': instantLinkResult.TransactionId,
  //   //         'identityFlags.possessionCheck': verified,
  //   //         'identityFlags.possessionCheckDate': DateTime.utc().toISO(),
  //   //     }
  //   // });
  // }
  // public async updateEligibilityResult(
  //   result: ProveAuthResponse,
  // ): Promise<void> {
  //   // await EndUserIdentityData.findOneAndUpdate({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // }, {
  //   //     $set: {
  //   //         'eligibilityData.trustScore': result.trustScore,
  //   //         'eligibilityData.lineType': result.lineType,
  //   //         'eligibilityData.countryCode': result.countryCode,
  //   //     }
  //   // });
  // }
  // public async updateEligibilityReputationCheckResult(
  //   eligibility: boolean,
  //   reputationCheck: boolean,
  //   payfoneAlias: string,
  // ): Promise<void> {
  //   // await EndUserIdentityData.findOneAndUpdate({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // }, {
  //   //     $set: {
  //   //         'eligibilityData.payfoneAlias': payfoneAlias,
  //   //         'identityFlags.eligibilityCheck': eligibility,
  //   //         'identityFlags.eligibilityReputationCheck': reputationCheck,
  //   //         'identityFlags.eligibilityReputationCheckDate': DateTime.utc().toISO(),
  //   //     }
  //   // });
  // }
  // public async updateVerifyIdentityResult(
  //   params: any,
  //   result: VerifyIdentityResponse,
  // ): Promise<void> {
  //   // await EndUserIdentityData.findOneAndUpdate({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // }, {
  //   //     $set: {
  //   //         'identityFlags.ownershipCheck': true,
  //   //         'identityFlags.identityVerified': true,
  //   //         'identityFlags.identityVerifiedDate': DateTime.utc().toISO(),
  //   //         'identityVerifyData.firstName': params.firstName,
  //   //         'identityVerifyData.lastName': params.lastName,
  //   //         'identityVerifyData.dateOfBirth': params.dob,
  //   //         'identityVerifyData.address': params.address,
  //   //         'identityVerifyData.city': params.city,
  //   //         'identityVerifyData.region': params.region,
  //   //         'identityVerifyData.postalCode': params.postalCode,
  //   //         'identityVerifyData.countryCode': result.countryCode,
  //   //         'identityVerifyData.addressDistance': result.address.distance,
  //   //         'identityVerifyData.addressScore': result.address.addressScore,
  //   //         'identityVerifyData.streetNumber': result.address.streetNumber,
  //   //         'identityVerifyData.firstNameScore': result.name.firstName,
  //   //         'identityVerifyData.lastNameScore': result.name.lastName,
  //   //         'identityVerifyData.nameScore': result.name.nameScore,
  //   //         'identityVerifyData.reasonCodes': result?.reasonCodes || [],
  //   //         'identityVerifyData.last4': result.identifiers.last4,
  //   //         'identityVerifyData.dob': result.identifiers.dob,
  //   //     }
  //   // });
  // }
  // public async incrementOwnershipCheckAttempt(): Promise<void> {
  //   // await EndUserIdentityData.findOneAndUpdate({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // }, {
  //   //     '$inc': {
  //   //         'identityFlags.ownershipCheckCount': 1,
  //   //     }
  //   // });
  // }
  // public async updateFailedOwnershipCheckResult(): Promise<void> {
  //   // await EndUserIdentityData.findOneAndUpdate({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // }, {
  //   //     $set: {
  //   //         'identityFlags.ownershipCheck': false,
  //   //         'identityFlags.identityVerified': false,
  //   //         'identityFlags.identityVerifiedDate': DateTime.utc().toISO(),
  //   //     }
  //   // });
  // }
  // public async updateFailedPrefillResult(): Promise<void> {
  //   // await EndUserIdentityData.findOneAndUpdate({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // }, {
  //   //     $set: {
  //   //         'identityFlags.identityVerified': false,
  //   //         'identityFlags.identityVerifiedDate': DateTime.utc().toISO(),
  //   //     }
  //   // });
  // }
  // public async updateIdentityResult(
  //   verified: boolean,
  //   trustVerified: boolean,
  // ): Promise<void> {
  //   // await EndUserIdentityData.findOneAndUpdate({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // }, {
  //   //     $set: {
  //   //         'identityFlags.identityCheck': verified,
  //   //         'identityFlags.identityCheckDate': DateTime.utc().toISO(),
  //   //         'identityFlags.identityTrustVerified': trustVerified,
  //   //     }
  //   // });
  // }
  // public async updateIdentityReputationCheckResult(
  //   result: ProveAuthResponse,
  // ): Promise<void> {
  //   // await EndUserIdentityData.findOneAndUpdate({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // }, {
  //   //     $set: {
  //   //         'identityVerifyData.trustScore': result.trustScore,
  //   //     }
  //   // });
  // }
  // async updateResendRedirectUrlCredentials(
  //   userAuthGuid: string,
  // ): Promise<void> {
  //   // await EndUserIdentityData.findOneAndUpdate({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // }, {
  //   //     $set: {
  //   //         'authorizationData.authGuid': `${userAuthGuid}`,
  //   //         'authorizationData.authGuidClaimed': false,
  //   //         'authorizationData.authGuidGeneratedDate': DateTime.utc().toISO(),
  //   //         'authorizationData.authGuidClaimedDate': null,
  //   //     }
  //   // });
  // }
  // async updateSuccessfulReputationCheck(
  //   userAuthGuid: string,
  //   phoneNumber: string,
  // ): Promise<void> {
  //   // await EndUserIdentityData.findOneAndUpdate({
  //   //     _id: new Types.ObjectId(this.identityDataId),
  //   //     end_user_id: new Types.ObjectId(this.user._id),
  //   // }, {
  //   //     $set: {
  //   //         'trustData.phoneNumber': phoneNumber,
  //   //         'authorizationData.authGuid': `${userAuthGuid}`,
  //   //         'authorizationData.authGuidClaimed': false,
  //   //         'authorizationData.authGuidGeneratedDate': DateTime.utc().toISO(),
  //   //         'identityFlags.reputationCheck': true,
  //   //         'identityFlags.reputationCheckDate': DateTime.utc().toISO(),
  //   //     }
  //   // });
  // }
  public async updateTrustScoreResults(
    result: ProveAuthResponse,
  ): Promise<void> {
    // await EndUserIdentityData.findOneAndUpdate({
    //     _id: new Types.ObjectId(this.identityDataId),
    //     end_user_id: new Types.ObjectId(this.user._id),
    // }, {
    //     $set: {
    //         'trustData.trustScore': result.trustScore ?? 0,
    //         'trustData.lineType': result.lineType ?? '',
    //         'trustData.countryCode': result.countryCode ?? '',
    //     }
    // });
  }
  private async auditRedirectUrl(
    redirectUrl: string,
    vfp: string,
  ): Promise<void> {
    // await EndUserIdentityData.findOneAndUpdate({
    //     _id: new Types.ObjectId(this.identityDataId),
    //     end_user_id: new Types.ObjectId(this.user._id),
    // }, {
    //     $set: {
    //         'authorizationData.vfp': vfp,
    //         'authorizationData.redirectUrl': redirectUrl,
    //         'authorizationData.redirectUrlCreatedDate': DateTime.utc().toISO(),
    //     }
    // });
  }
  private async getProveRedirectUrl(
    authenticationUrl: string,
  ): Promise<string | null> {
    const url = new URL(authenticationUrl);
    const vfp = url.searchParams.get('vfp');
    if (vfp) {
      const redirectUrl = `${PROVE_UI_URL}/${this.env}?vfp=${vfp}&env=${this.env}`;
      if (!!redirectUrl) await this.auditRedirectUrl(redirectUrl, vfp);
      return redirectUrl;
    } else {
      return null;
    }
  }
  private getFinalTargetUrl(userAuthGuid: string): string {
    const finalTargetUrl: string = `${PROVE_UI_URL}/${this.env}/${userAuthGuid}`;
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
    console.log('env is', this.env);
    const baseURL: string = this.useOAuthURL(path)
      ? OAPI_BASE_URL[this.env as AppEnvSelect] || '' // Use the value from OAPI_BASE_URL if available
      : API_BASE_URL[this.env as AppEnvSelect] || ''; // Use the value from API_BASE_URL if available;
    console.log('baseURL is', baseURL);
    const url = !smsUrlOverride ? `${baseURL}/${path}` : SMS_API_URL;
    console.log('url is', url);
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
    console.log('baseUrl', api.defaults.baseURL);
    const token = await this.tokenProvider.getCurrentToken(options.type);
    console.log('token', token);
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
        const token = await this.tokenProvider.getCurrentToken(options.type);
        if (!!token) config!.headers!.Authorization = `Bearer ${token}`;
        const response = await api(config);
        return response.data;
      }
      throw err;
    }
  }
}
