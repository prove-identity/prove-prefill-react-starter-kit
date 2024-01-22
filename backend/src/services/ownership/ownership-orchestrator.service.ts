import IdentityVerifyService from '@src/services/ownership/identity-verify.service';
import IdentityConfirmationService from '@src/services/ownership/identity-confirmation.service';
import { getRecords } from '@src/data-repositories/prefill.repository';

const NAME_SCORE_THRESHOLD = 70;
const ADDRESS_SCORE_THRESHOLD = 100;

export default class OwnershipOrchestratorService {
  private identityVerifyService!: IdentityVerifyService;
  private identityConfirmationService!: IdentityConfirmationService;
  private prefillResult!: any;
  private prefillRecordId!: number;

  constructor(prefillRecordId: number) {
    this.prefillRecordId = prefillRecordId;
  }

  private async getPrefillResult() {
    this.prefillResult = await getRecords({ id: this.prefillRecordId });
  }

  public async execute({ last4, dob }: { last4?: string; dob?: string; }): Promise<any> {
    try {
      await this.getPrefillResult();
      this.identityVerifyService = new IdentityVerifyService(
        this.prefillResult,
      );
      const identityVerifysuccess = await this.identityVerifyService.run({ last4, dob });
      if (identityVerifysuccess) {
        await this.getPrefillResult();
        const identityResponse =
          this.prefillResult.responseDetails.payload.success_identity_response;
        console.log('Identity response:', identityResponse);
        if (identityResponse.verified) {
          console.log('Identity verified.');
          return true;
        } else {
          console.error('Identity could not be verified.');
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
  public async finalize(piiData: 
    {
      first_name: string,
      last_name: string,
      dob?: string,
      last4?: string,
      city: string,
      address: string,
      extended_address?: string,
      region: string,
      postal_code: string,
    }): Promise<boolean> {
    try {
      await this.getPrefillResult();
      this.prefillResult.user_pii_data = piiData;
      this.identityConfirmationService = new IdentityConfirmationService(
        this.prefillResult,
      );
      const identityConfirmationSuccess =
        await this.identityConfirmationService.run();
      if (identityConfirmationSuccess) {
        await this.getPrefillResult();
        if (this.identityConfirmationCriteria()) {
          console.log('Identity verified.');
          return true;
        } else {
          console.error('Identity could not be confirmed.');
          return false;
        }
      } else {
        console.error('Identity Confirm Service failed.');
        return false;
      }
    } catch (error) {
      console.error('Error executing services:', error);
      return false;
    }
  }

  private identityConfirmationCriteria(): boolean {
    return (
      this.prefillResult.responseDetails.payload
        .success_identity_confirmation_response.verified &&
      this.prefillResult.responseDetails.payload
        .success_identity_confirmation_response.prove_result.name.firstName >=
      NAME_SCORE_THRESHOLD &&
      this.prefillResult.responseDetails.payload
        .success_identity_confirmation_response.prove_result.name.lastName >=
      NAME_SCORE_THRESHOLD &&
      this.prefillResult.responseDetails.payload
        .success_identity_confirmation_response.prove_result.address
        .addressScore >= ADDRESS_SCORE_THRESHOLD
    );
  }
}
