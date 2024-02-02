import { convertObjectKeysToSnakeCase } from '@src/helpers/validation.helper';
import { Prove } from '@src/integrations/prove';
import { AuthState } from '@src/integrations/prove/(constants)';
import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import PrefillServiceBase from '@src/services/service.base';
import { ServiceType } from '@src/services/(definitions)';
import { AuthUrlResponse, GetAuthUrlRequestPayload } from '@src/services/possession/(definitions)';
import { ResponseDetailPayload } from '@src/models/response-detail';

export default class GetAuthUrlService extends PrefillServiceBase {
  private requestPayload?: GetAuthUrlRequestPayload;

  constructor(args: Partial<PrefillColatedRecord>) {
    super(ServiceType.AUTH_URL, args);
  }

  public async run(): Promise<boolean> {
    this.buildRequestPayload();
    if (!this.requestPayload) {
      return false;
    }

    try {
      const { userAuthGuid } = await Prove.generateUserAuthGuid();
      const response = await this.ProveService.getAuthUrl(
        this.requestPayload.SourceIp,
        this.requestPayload.MobileNumber,
        userAuthGuid,
      ) as AuthUrlResponse;
      console.log('Prove API response from getAuthURL Service:', response);
      // Write TO DB
      this.prefillRecord.update({
        state: AuthState.GET_AUTH_URL,
        callback_url: response.redirectUrl,
        user_auth_guid: userAuthGuid,
      });
      await this.updateRequest(response);
      await this.updateResponse(response);
      return true;
    } catch (error) {
      console.error('Error calling Prove API from GetAuthUrl:', error);
      return false;
    }
  }

  protected async updateRequest(response: AuthUrlResponse): Promise<void> {
      const currentPayload = this.requestDetail.payload || {};

      const updatedPayload = {
        ...currentPayload,
        ...convertObjectKeysToSnakeCase(response),
      };
  
      // Update the payload attribute of the record with the new data
      await this?.requestDetail?.update({ payload: updatedPayload });
  }

  protected async updateResponse(response: AuthUrlResponse): Promise<void> {
      const currentPayload = this.responseDetail.payload || {} as ResponseDetailPayload;

      const updatedPayload = {
        ...currentPayload,
        success_auth_url_response : convertObjectKeysToSnakeCase(response),
      };

      // Update the payload attribute of the record with the new data
      await this.responseDetail.update({
        parent_state: AuthState.GET_AUTH_URL,
        payload: updatedPayload,
      });
  }

  protected buildRequestPayload(): void {
    this.requestPayload = {
      SourceIp: this?.requestDetail?.payload?.SourceIp as string,
      MobileNumber: this?.requestDetail?.payload?.MobileNumber as string,
    } as GetAuthUrlRequestPayload;
  }
}
