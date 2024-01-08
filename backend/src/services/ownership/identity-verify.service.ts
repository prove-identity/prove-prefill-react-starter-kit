import { Prove } from '@src/integrations/prove/index';
import { AppEnvSelect } from 'src/(global_constants)';
import { convertObjectKeysToSnakeCase } from '@src/helpers/validation.helper';

interface ApiResponse {
  body: any;
  status: number;
  success: boolean;
}

interface ResponseDetail {
  payload: {
    redirect_url: string;
    mobile_number: string;
  };
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

export default class IdentityVerifyService {
  private object: ObjectArgs;
  private requestDetail: any;
  private responseDetail: ResponseDetail;
  private mobileNumber: string;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.requestDetail;
    this.responseDetail = this.object.responseDetails;
    this.mobileNumber = this.requestDetail.payload.MobileNumber || '';
  }

  public async run(): Promise<boolean> {
    if (this.mobileNumber) {
      const proveService = new Prove(AppEnvSelect.SANDBOX);
      const response = await proveService.identity(
        this.mobileNumber,
        '',
        '',
        this.requestDetail.request_id,
      );
      // Write TO DB
      this.object.prefillRecord.update({
        state: 'identity_verify',
      });
      await this.requestDetail.update({ state: 'identity_verify' });
      await this.updateResponse(response);
      return true;
    } else {
      console.error('MobileNumber is not present!');
      return false;
    }
  }

  private async updateResponse(response: any): Promise<void> {
    const currentPayload = this.responseDetail.payload || {};
    const updatedPayload = {
      ...currentPayload,
      success_identity_response: convertObjectKeysToSnakeCase(response),
    };
    // Update the payload attribute of the record with the new data
    await this.responseDetail.update({
      parent_state: 'identity_verify',
      payload: updatedPayload,
    });
  }
}
