import { Prove } from '@src/integrations/prove/index';
import { AppEnvSelect } from 'src/(global_constants)';
import {
  convertObjectKeysToSnakeCase,
  convertObjectKeysToCamelCase,
} from '@src/helpers/validation.helper';
import { VerifyIdentityPayload } from '@src/integrations/prove/prove.definitions';
import { AuthState } from '@src/integrations/prove/(constants)';

interface ApiResponse {
  body: any;
  status: number;
  success: boolean;
}

interface ResponseDetail {
  payload: any;
  update: (payload: any) => Promise<void>;
}

interface ObjectArgs {
  requestDetail: {
    request_id: string;
    payload: {
      MobileNumber: string;
    };
  };
  responseDetails: any;
  prefillRecord: any;
  user_pii_data: ProtectedUserData;
}

interface ProtectedUserData {
  first_name?: string;
  last_name?: string;
  address?: string;
  extended_address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  dob?: string;
}

export default class IdentityConfirmationService {
  private object: ObjectArgs;
  private requestDetail: any;
  private responseDetail: ResponseDetail;
  private mobileNumber: string;
  private requestPayload?: any;
  private piiData?: ProtectedUserData;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.requestDetail;
    this.responseDetail = this.object.responseDetails;
    this.mobileNumber = this.requestDetail.payload.MobileNumber || '';
    this.piiData = this.object.user_pii_data;
  }

  public async run(): Promise<boolean> {
    this.buildRequestPayload();
    if (this.requestPayload) {
      const proveService = new Prove();
      const payloadObj: VerifyIdentityPayload = this.requestPayload;
      const ownershipCheckCount = (this?.object?.prefillRecord?.ownership_check_count || 0) + 1;
      if (ownershipCheckCount > 3) {
        //hit cap for identity checks 
        return false;
      }
      const response = await proveService.verifyIdentity(
        payloadObj,
        this.requestDetail.request_id,
      );
      let updateIdentityPayload: {
        state: AuthState,
        ownership_check_count: number;
        verified?: boolean;
      } = {
        state: AuthState.IDENTITY_CONFIRMATION,
        ownership_check_count: ownershipCheckCount
      }
      if (response.verified) {
        this.object.prefillRecord.update({
          ...updateIdentityPayload,
          verified: true,
        });
        await this.updateResponse(response);
        await this.updateRequestData();
        return true;
      } else {
        if (ownershipCheckCount === 3) {
          updateIdentityPayload = {
            ...updateIdentityPayload,
            verified: false,
          }
        }
        //hit cap for identity checks 
        this.object.prefillRecord.update(updateIdentityPayload);
        return false;
      }
    } else {
      console.error('request payload is not present!');
      return false;
    }
  }

  private async updateResponse(response: any): Promise<void> {
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
    const payload = this.responseDetail.payload.success_identity_response;
    this.requestPayload = {
      firstName: this.piiData?.first_name || payload.first_name,
      lastName: this.piiData?.last_name || payload.last_name,
      address: this.piiData?.address || payload.address,
      city: this.piiData?.city || payload.city,
      region: this.piiData?.region || payload.region,
      postalCode: this.piiData?.postal_code || payload.postal_code,
      phoneNumber: this.mobileNumber,
      dob: this.piiData?.dob,
    };
    if (this.piiData?.extended_address) {
      this.requestPayload = {
        ...this.requestPayload,
        extendedAddress: this.piiData?.extended_address,
      }
    }
  }
}
