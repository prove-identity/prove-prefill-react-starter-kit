import {
  convertObjectKeysToSnakeCase,
} from '@src/helpers/validation.helper';
import { ProveVerifyIdentityResponse, } from '@src/integrations/prove/(definitions)';
import { AuthState } from '@src/integrations/prove/(constants)';
import { PrefillResultsExtended, SuccessIdentityResponse, ProtectedUserData, IdentityServiceResponse, IdentityConfirmRequestPayload } from '@src/services/ownership/(definitions)';
import PrefillServiceBase from '@src/services/service.base';
import { ServiceType } from '@src/services/(definitions)';

const OWNERSHIP_CHECK_COUNT_CAP = 3;

export default class IdentityConfirmationService extends PrefillServiceBase {
  private requestPayload?: IdentityConfirmRequestPayload;
  private mobileNumber: string;
  private piiData?: ProtectedUserData;

  constructor(args: PrefillResultsExtended) {
    super(ServiceType.IDENTITY_CONFIRMATION, args);
    this.mobileNumber = this?.requestDetail?.payload?.MobileNumber as string || ''
    this.piiData = args?.user_pii_data;
  }

  public async run(): Promise<IdentityServiceResponse> {
    this.buildRequestPayload();

    if (!this.requestPayload) {
      console.error('request payload is not present!');
      return { verified: false };
    }

    const ownershipCheckCount = (this?.prefillRecord?.ownership_check_count || 0) + 1;
    if (ownershipCheckCount > OWNERSHIP_CHECK_COUNT_CAP) {
      // Hit cap for identity checks
      return { verified: false, ownershipCapReached: true };
    }

    const response = await this.ProveService.verifyIdentity(this.requestPayload, this.requestDetail.request_id);

    let updateIdentityPayload: {
      state: AuthState,
      ownership_check_count: number;
      verified?: boolean;
    } = {
      state: AuthState.IDENTITY_CONFIRMATION,
      ownership_check_count: ownershipCheckCount,
      verified: response.verified
    };

    this.prefillRecord.update(updateIdentityPayload);

    if (response.verified) {
      await this.updateResponse(response);
      await this.updateRequest();
      return { verified: true };
    }

    return {
      verified: false,
      ownershipCapReached: ownershipCheckCount === OWNERSHIP_CHECK_COUNT_CAP
    };
  }

  protected async updateResponse(response: ProveVerifyIdentityResponse): Promise<void> {
    const currentPayload = this.responseDetail.payload || {};
    const updatedPayload = {
      ...currentPayload,
      success_identity_confirmation_response:
        convertObjectKeysToSnakeCase(response),
    };
    // Update the payload attribute of the record with the new data
    await this.responseDetail.update({
      parent_state: AuthState.IDENTITY_CONFIRMATION,
      payload: updatedPayload,
    });
  }

  protected async updateRequest(): Promise<void> {
    const currentPayload = this.requestDetail.payload || {};
    const updatedPayload = {
      ...currentPayload,
      pii_data: this.piiData,
    };
    // Update the payload attribute of the record with the new data
    await this.requestDetail.update({
      payload: updatedPayload,
      state: AuthState.IDENTITY_CONFIRMATION,
    });
  }

  protected buildRequestPayload(): void {
    const payload = this?.responseDetail?.payload?.success_identity_response as Partial<SuccessIdentityResponse>;
    this.requestPayload = {
      firstName: this.piiData?.first_name || payload.first_name,
      lastName: this.piiData?.last_name || payload.last_name,
      address: this.piiData?.address || payload.address,
      city: this.piiData?.city || payload.city,
      region: this.piiData?.region || payload.region,
      postalCode: this.piiData?.postal_code || payload.postal_code,
      phoneNumber: this.mobileNumber,
      dob: this.piiData?.dob,
    } as IdentityConfirmRequestPayload;
    if (this.piiData?.extended_address) {
      this.requestPayload = {
        ...this.requestPayload,
        extendedAddress: this.piiData?.extended_address,
      }
    }
  }
}
