import { Prove } from '@src/integrations/prove/index';
import { AppEnvSelect } from 'src/(global_constants)';
import {
  convertObjectKeysToSnakeCase,
  convertObjectKeysToCamelCase,
} from '@src/helpers/validation.helper';
import { VerifyIdentityPayload } from '@src/integrations/prove/prove.definitions';

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
  user_pii_data: pii_data_type;
}

interface pii_data_type {
  first_name?: string;
  last_name?: string;
  address?: string;
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
  private piiData?: pii_data_type;

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
      const proveService = new Prove(AppEnvSelect.SANDBOX);
      const payloadObj: VerifyIdentityPayload = this.requestPayload;
      const response = await proveService.verifyIdentity(
        payloadObj,
        this.requestDetail.request_id,
      );
      // Write TO DB
      this.object.prefillRecord.update({
        state: 'identity_confirmation',
      });
      await this.updateResponse(response);
      await this.updateRequestData();
      return true;
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
      parent_state: 'identity_confirmation',
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
      state: 'identity_confirmation',
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
      dob: this.piiData?.dob || '1990-01-01',
    };
  }
}
