import { Prove } from '@src/integrations/prove/index';
import { convertObjectKeysToSnakeCase } from '@src/helpers/validation.helper';
import { AuthState } from '@src/integrations/prove/(constants)';
import { TrustResponse } from '@src/integrations/prove/prove.definitions';
import RequestDetail from '@src/models/request-detail';
import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import ResponseDetail from '@src/models/response-detail';

export default class CheckEligibilityService {
  private prefillResult: Partial<PrefillColatedRecord>;
  private requestDetail: Partial<RequestDetail> | undefined;
  private responseDetail: Partial<ResponseDetail> | undefined;
  private mobileNumber: string | undefined;

  constructor(args: Partial<PrefillColatedRecord>) {
    this.prefillResult = args;
    this.requestDetail = this?.prefillResult?.requestDetail;
    this.responseDetail = this?.prefillResult?.responseDetails;
    if (!this.requestDetail || !this.responseDetail) {
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
      if (this.prefillResult.prefillRecord) {
        await this.prefillResult.prefillRecord.update({
          state: AuthState.CHECK_ELIGIBILITY,
        });
      }
      if (this.requestDetail) {
        //@ts-ignore
        await this.requestDetail.update({ state: AuthState.CHECK_ELIGIBILITY });
      }
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
    if (this?.responseDetail) {
      const currentPayload = this?.responseDetail?.payload || {};
      const updatedPayload = {
        ...currentPayload,
        success_trust_response: convertObjectKeysToSnakeCase(response),
      };
      // Update the payload attribute of the record with the new data
      //@ts-ignore
      await this?.responseDetail?.update({
        parent_state: AuthState.CHECK_ELIGIBILITY,
        payload: updatedPayload,
      });
    }
  }
}
