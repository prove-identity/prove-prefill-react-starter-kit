import { convertObjectKeysToSnakeCase } from '@src/helpers/validation.helper';
import { Prove } from '@src/integrations/prove';
import { AuthState } from '@src/integrations/prove/(constants)';
import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import PrefillServiceBase from '../service.base';

interface AuthUrlResponse {
  AuthenticationUrl: string;
  MobileOperatorName: string;
  redirectUrl?: string | undefined;
}

export default class GetAuthUrlService extends PrefillServiceBase {
  constructor(args: Partial<PrefillColatedRecord>) {
    super(args);
  }

  public async run(): Promise<boolean> {
    const payload = this.buildPayload();

    try {
      const { userAuthGuid } = await Prove.generateUserAuthGuid();
      const response = await this.ProveService.getAuthUrl(
        payload.SourceIp,
        payload.MobileNumber,
        userAuthGuid,
      );
      console.log('Prove API response from getAuthURL Service:', response);
      // Write TO DB
      this.prefillRecord.update({
        state: AuthState.GET_AUTH_URL,
        callback_url: response.redirectUrl,
        user_auth_guid: userAuthGuid,
      });
      await this.updateRequestData(response as AuthUrlResponse);
      await this.updateResponse(response as AuthUrlResponse);
      return true;
    } catch (error) {
      console.error('Error calling Prove API from GetAuthUrl:', error);
      return false;
    }
  }

  private async updateRequestData(response: AuthUrlResponse): Promise<void> {
      const currentPayload = this.requestDetail.payload || {};

      const updatedPayload = {
        ...currentPayload,
        ...convertObjectKeysToSnakeCase(response),
      };
  
      // Update the payload attribute of the record with the new data
      await this?.requestDetail?.update({ payload: updatedPayload });
  }

  private async updateResponse(response: AuthUrlResponse): Promise<void> {
      const currentPayload = this.responseDetail.payload || {};

      const updatedPayload = {
        ...currentPayload,
        ...convertObjectKeysToSnakeCase(response),
      };

      // Update the payload attribute of the record with the new data
      await this.responseDetail.update({
        parent_state: AuthState.GET_AUTH_URL,
        payload: updatedPayload,
      });
  }

  private buildPayload(): { SourceIp: string; MobileNumber: string; } {
    const payload = {
      SourceIp: this?.requestDetail?.payload?.SourceIp as string,
      MobileNumber: this?.requestDetail?.payload?.MobileNumber as string,
    };
    return payload;
  }
}
