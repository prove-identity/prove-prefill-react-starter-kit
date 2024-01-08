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
}

export default class IdentityConfirmationService {
  private object: ObjectArgs;
  private requestDetail: any;
  private responseDetail: ResponseDetail;
  private mobileNumber: string;
  private requestPayload?: any;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.requestDetail;
    this.responseDetail = this.object.responseDetails;
    this.mobileNumber = this.requestDetail.payload.MobileNumber || '';
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
      await this.requestDetail.update({ state: 'identity_confirmation' });
      await this.updateResponse(response);
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

  private buildRequestPayload(): void {
    const payload = this.responseDetail.payload.success_identity_response;
    this.requestPayload = {
      firstName: payload.first_name,
      lastName: payload.last_name,
      address: payload.address,
      city: payload.city,
      region: payload.region,
      postalCode: payload.postal_code,
      phoneNumber: this.mobileNumber,
      dob: '1990-01-01',
    };
  }
}
