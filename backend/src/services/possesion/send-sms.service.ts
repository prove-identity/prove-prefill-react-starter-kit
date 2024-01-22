import { Prove } from '@src/integrations/prove/index';
import { convertObjectKeysToSnakeCase } from '@src/helpers/validation.helper';
import { AuthState } from '@src/integrations/prove/(constants)';
import { DateTime } from 'luxon';
import PrefillWithoutMnoConsent from '@src/models/prefill-without-mno-consent';

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
  prefillRecord: PrefillWithoutMnoConsent;
}

export default class SendSmsService {
  private object: ObjectArgs;
  private requestDetail: any;
  private responseDetail: ResponseDetail;
  private redirectUrl: string;
  private mobileNumber: string;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.requestDetail;
    this.responseDetail = this.object.responseDetails;
    this.redirectUrl = this.responseDetail?.payload?.redirect_url || '';
    this.mobileNumber = this.requestDetail.payload.MobileNumber || '';
  }

  public async run(): Promise<boolean> {
    if (this.redirectUrl && this.mobileNumber) {
      const proveService = new Prove();
      const response = await proveService.sendSMS(
        this.mobileNumber,
        this.redirectUrl,
      );
      console.log('Prove API response from send sms url:', response);
      let smsSendCount = (this.object?.prefillRecord?.sms_sent_count || 0) + 1;
      // Write TO DB
      this.object.prefillRecord.update({
        state: AuthState.SMS_SENT,
        sms_sent_date_time: DateTime.utc().toISO(),
        sms_sent_count: smsSendCount
      });
      await this.requestDetail.update({ state: AuthState.SMS_SENT });
      await this.updateResponse(response);
      return true;
    } else {
      console.error('AuthenticationUrl or MobileNumber is not present!');
      return false;
    }
  }

  private async updateResponse(response: any): Promise<void> {
    const currentPayload = this.responseDetail.payload || {};
    const updatedPayload = {
      ...currentPayload,
      success_sms_response: convertObjectKeysToSnakeCase(response),
    };
    // Update the payload attribute of the record with the new data
    await this.responseDetail.update({
      parent_state: AuthState.SMS_SENT,
      payload: updatedPayload,
    });
  }
}

// Usage example:
// const objectArgs: ObjectArgs = {
//   // Populate with your object arguments
// };
//
// const sendSmsService = new SendSmsService(objectArgs);
// sendSmsService.run().then((result) => {
//   console.log('Service Result:', result);
// });
