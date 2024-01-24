import { Prove } from '@src/integrations/prove/index';
import { convertObjectKeysToSnakeCase } from '@src/helpers/validation.helper';
import { AuthState } from '@src/integrations/prove/(constants)';
import { TrustResponse } from '@src/integrations/prove/prove.definitions';
import PrefillWithoutMnoConsent from '@src/models/prefill-without-mno-consent';
import RequestDetail from '@src/models/request-detail';
import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import ResponseDetail from '@src/models/response-detail';

export default class CheckEligibilityService {
  private prefillResult: PrefillColatedRecord;
  private prefillRecord: PrefillWithoutMnoConsent;
  private requestDetail: RequestDetail;
  private responseDetail: ResponseDetail;
  private mobileNumber: string | undefined;

  constructor(args: Partial<PrefillColatedRecord>) {
    this.prefillResult = args as PrefillColatedRecord;
    this.prefillRecord = this?.prefillResult?.prefillRecord as PrefillWithoutMnoConsent;
    this.requestDetail = this?.prefillResult?.requestDetail as RequestDetail;
    this.responseDetail = this?.prefillResult?.responseDetails as ResponseDetail;
    if (!this.requestDetail || !this.responseDetail || !this.prefillRecord) {
      throw new Error('RequestDetail and ResponseDetails are required for init.')
    }
    this.mobileNumber = this.requestDetail.payload?.MobileNumber as string || '';
  }

  public async run(): Promise<boolean> {
    if (this.mobileNumber) {
      const proveService = new Prove();
      const response: Partial<TrustResponse> = await proveService.checkTrust(
        this.mobileNumber,
        this?.requestDetail?.request_id as string,
      );
      console.log('Prove API response from trust score url:', response);
      // Update state inside main prefill record
      await this.prefillRecord.update({
        state: AuthState.CHECK_ELIGIBILITY,
      });
      await this.requestDetail.update({ state: AuthState.CHECK_ELIGIBILITY });
      await this.updateResponse(response);
      if (response.verified) {
        return true;
      } else {
        return false;
      }
    } else {
      console.error('AuthenticationUrl or MobileNumber is not present!');
      return false;
    }
  }

  private async updateResponse(response: Partial<TrustResponse>): Promise<void> {
    const currentPayload = this?.responseDetail?.payload || {};
    const updatedPayload = {
      ...currentPayload,
      success_trust_response: convertObjectKeysToSnakeCase(response),
    };
    // Update the payload attribute of the record with the new data
    await this.responseDetail.update({
      parent_state: AuthState.CHECK_ELIGIBILITY,
      payload: updatedPayload,
    });
  }
}
