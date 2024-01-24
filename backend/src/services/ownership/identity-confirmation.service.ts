import { Prove } from '@src/integrations/prove/index';
import {
  convertObjectKeysToSnakeCase,
} from '@src/helpers/validation.helper';
import { ProveVerifyIdentityResponse, VerifyIdentityPayload } from '@src/integrations/prove/prove.definitions';
import { AuthState } from '@src/integrations/prove/(constants)';
import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import PrefillWithoutMnoConsent from '@src/models/prefill-without-mno-consent';
import RequestDetail from '@src/models/request-detail';
import ResponseDetail from '@src/models/response-detail';
import { PrefillResultsExtended, SuccessIdentityResponse, ProtectedUserData } from '@src/services/ownership/(definitions)';

interface RequestPayload {
  firstName: string; 
  lastName: string; 
  address: string; 
  extendedAddress?: string; 
  city: string; 
  region: string; 
  postalCode: string; 
  phoneNumber: string; 
  dob: string; 
}

const OWNERSHIP_CHECK_COUNT_CAP = 3; 

export default class IdentityConfirmationService {
  private prefillResult: PrefillColatedRecord;
  private prefillRecord: PrefillWithoutMnoConsent;
  private requestDetail: RequestDetail;
  private responseDetail: ResponseDetail;
  private mobileNumber: string;
  private requestPayload?: RequestPayload;
  private piiData?: ProtectedUserData;

  constructor(args: PrefillResultsExtended) {
    this.prefillResult = args;
    this.prefillRecord = this?.prefillResult?.prefillRecord as PrefillWithoutMnoConsent;
    this.requestDetail = this?.prefillResult?.requestDetail as RequestDetail;
    this.responseDetail = this?.prefillResult?.responseDetails as ResponseDetail;
    if (!this.requestDetail || !this.responseDetail || !this.prefillRecord) {
      throw new Error('RequestDetail and ResponseDetails are required for init.')
    }
    this.mobileNumber = this?.requestDetail?.payload?.MobileNumber as string || ''
    this.piiData = args?.user_pii_data;
  }

  public async run(): Promise<{ verified: boolean, ownershipCapReached?: boolean; }> {
    this.buildRequestPayload();

    if (!this.requestPayload) {
      console.error('request payload is not present!');
      return { verified: false };
    }

    const ownershipCheckCount = (this?.prefillRecord?.ownership_check_count || 0) + 1;
    if (ownershipCheckCount > OWNERSHIP_CHECK_COUNT_CAP) {
      // Hit cap for identity checks
      return { verified: false, ownershipCapReached: true };
    }

    const proveService = new Prove();
    const response = await proveService.verifyIdentity(this.requestPayload, this.requestDetail.request_id);

    let updateIdentityPayload: {
      state: AuthState,
      ownership_check_count: number;
      verified?: boolean;
    } = {
      state: AuthState.IDENTITY_CONFIRMATION,
      ownership_check_count: ownershipCheckCount,
      verified: response.verified
    };

    this.prefillRecord.update(updateIdentityPayload);

    if (response.verified) {
      await this.updateResponse(response);
      await this.updateRequestData();
      return { verified: true };
    }

    return {
      verified: false,
      ownershipCapReached: ownershipCheckCount === OWNERSHIP_CHECK_COUNT_CAP
    };
}


  private async updateResponse(response: ProveVerifyIdentityResponse): Promise<void> {
    const currentPayload = this.responseDetail.payload || {};
    const updatedPayload = {
      ...currentPayload,
      success_identity_confirmation_response:
        convertObjectKeysToSnakeCase(response),
    };
    // Update the payload attribute of the record with the new data
    await this.responseDetail.update({
      parent_state: AuthState.IDENTITY_CONFIRMATION,
      payload: updatedPayload,
    });
  }

  private async updateRequestData(): Promise<void> {
    const currentPayload = this.requestDetail.payload || {};
    const updatedPayload = {
      ...currentPayload,
      pii_data: this.piiData,
    };
    // Update the payload attribute of the record with the new data
    await this.requestDetail.update({
      payload: updatedPayload,
      state: AuthState.IDENTITY_CONFIRMATION,
    });
  }

  private buildRequestPayload(): void {
    const payload = this?.responseDetail?.payload?.success_identity_response as Partial<SuccessIdentityResponse>;
    this.requestPayload = {
      firstName: this.piiData?.first_name || payload.first_name,
      lastName: this.piiData?.last_name || payload.last_name,
      address: this.piiData?.address || payload.address,
      city: this.piiData?.city || payload.city,
      region: this.piiData?.region || payload.region,
      postalCode: this.piiData?.postal_code || payload.postal_code,
      phoneNumber: this.mobileNumber,
      dob: this.piiData?.dob,
    } as RequestPayload;
    if (this.piiData?.extended_address) {
      this.requestPayload = {
        ...this.requestPayload,
        extendedAddress: this.piiData?.extended_address,
      }
    }
  }
}
