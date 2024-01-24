import { convertObjectKeysToSnakeCase } from '@src/helpers/validation.helper';
import { AuthState } from '@src/integrations/prove/(constants)';
import { TrustResponse } from '@src/integrations/prove/(definitions)';
import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import PrefillServiceBase from '@src/services/service.base';
import { ResponseDetailPayload } from '@src/models/response-detail';
import { ServiceType } from '@src/services/(definitions)';

export default class CheckEligibilityService extends PrefillServiceBase {
  private mobileNumber: string | undefined;

  constructor(args: Partial<PrefillColatedRecord>) {
    super(ServiceType.CHECK_ELIGIBILITY, args);
    this.mobileNumber = this.requestDetail.payload?.MobileNumber as string || '';
  }

  public async run(): Promise<boolean> {
    if (this.mobileNumber) {
      const response: Partial<TrustResponse> = await this.ProveService.checkTrust(
        this.mobileNumber,
        this?.requestDetail?.request_id as string,
      );
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

  protected async updateResponse(response: Partial<TrustResponse>): Promise<void> {
    const currentPayload = this?.responseDetail?.payload || {} as ResponseDetailPayload;
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

  protected async updateRequest() {
    throw new Error('not implemented for this service');
  }

  protected buildRequestPayload() {
    throw new Error('not implemented for this service');
  }

}
