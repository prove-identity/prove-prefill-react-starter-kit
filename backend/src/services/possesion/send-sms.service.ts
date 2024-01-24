import { DateTime } from 'luxon';
import { Prove } from '@src/integrations/prove/index';
import { convertObjectKeysToSnakeCase } from '@src/helpers/validation.helper';
import { AuthState } from '@src/integrations/prove/(constants)';
import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import PrefillWithoutMnoConsent from '@src/models/prefill-without-mno-consent';
import RequestDetail from '@src/models/request-detail';
import ResponseDetail from '@src/models/response-detail';
import { ProveSendSMSResponse } from '@src/integrations/prove/prove.definitions';

export default class SendSmsService {
  private prefillResult: Partial<PrefillColatedRecord>;
  private prefillRecord: PrefillWithoutMnoConsent;
  private requestDetail: RequestDetail;
  private responseDetail: ResponseDetail;
  private redirectUrl: string;
  private mobileNumber: string;

  constructor(args: Partial<PrefillColatedRecord>) {
    this.prefillResult = args;
    this.prefillRecord = this?.prefillResult?.prefillRecord as PrefillWithoutMnoConsent;
    this.requestDetail = this?.prefillResult?.requestDetail as RequestDetail;
    this.responseDetail = this?.prefillResult?.responseDetails as ResponseDetail;
    if (!this.requestDetail || !this.responseDetail || !this.prefillRecord) {
      throw new Error('RequestDetail and ResponseDetails are required for init.')
    }
    this.mobileNumber = this?.requestDetail?.payload?.MobileNumber as string || '';
    this.redirectUrl = this.responseDetail?.payload?.redirect_url as string || '';
  }

  public async run(): Promise<boolean> {
    if (this.redirectUrl && this.mobileNumber) {
      const proveService = new Prove();
      const response = await proveService.sendSMS(
        this.mobileNumber,
        this.redirectUrl,
      );
      console.log('Prove API response from send sms url:', response);
      let smsSendCount = (this.prefillRecord?.sms_sent_count || 0) + 1;
      // Update state inside main prefill record
      this.prefillRecord.update({
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

  private async updateResponse(response: ProveSendSMSResponse): Promise<void> {
    const currentPayload = this.responseDetail.payload || {};
    const updatedPayload = {
      ...currentPayload,
      success_sms_response: convertObjectKeysToSnakeCase(response),
    };
    // Update the payload attribute of the record with the new data
    await this?.responseDetail?.update({
      parent_state: AuthState.SMS_SENT,
      payload: updatedPayload,
    });
  }
}