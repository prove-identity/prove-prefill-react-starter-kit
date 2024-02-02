import { AuthState } from '@src/integrations/prove/(constants)';
import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import PrefillServiceBase from '@src/services/service.base';
import { convertObjectKeysToSnakeCase } from '@src/helpers/validation.helper';
import { ProveInstantLinkResult } from '@src/integrations/prove/(definitions)';
import { InstantLinkRunArgs, } from '@src/services/possession/(definitions)';
import { ServiceType } from '@src/services/(definitions)';
import { ResponseDetailPayload } from '@src/models/response-detail';

export default class GetInstantLinkResultService extends PrefillServiceBase {
  private vfp!: string;

  constructor(args: Partial<PrefillColatedRecord>) {
    super(ServiceType.INSTANT_LINK, args);
  }

  public async run({ vfp }: InstantLinkRunArgs): Promise<boolean> {
    this.vfp = vfp;

    try {
      const response = await this.ProveService.getInstantLinkResult(this.vfp);
      //! criteria for determining possession
      if (response.verified) {
        // Write TO DB
        this.prefillRecord.update({
          state: AuthState.SMS_CLICKED,
        });
        await this.updateResponse(response);
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  protected async updateResponse(response: ProveInstantLinkResult): Promise<void> {
    const currentPayload = this.responseDetail.payload || {} as ResponseDetailPayload;
    const updatedPayload = {
      ...currentPayload,
      success_instant_link_result: {
        phone_match: response.PhoneMatch,
        ip_address_match: response.IpAddressMatch,
        link_clicked: response.LinkClicked,
        phone_number: response.PhoneNumber,
        line_type: response.LineType,
        country_code: response.CountryCode,
      }
    };
    // Update the payload attribute of the record with the new data
    await this.responseDetail.update({
      parent_state: AuthState.SMS_CLICKED,
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