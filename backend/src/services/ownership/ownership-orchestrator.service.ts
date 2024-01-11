import IdentityVerifyService from '@src/services/ownership/identity-verify.service';
import IdentityConfirmationService from '@src/services/ownership/identity-confirmation.service';
import { getRecords } from '@src/data-repositories/prefill.repository';

// interface objectArgs {
//   request_detail: {
//     request_id: string;
//     session_id: string;
//     payload: {
//       SourceIp: string;
//       FinalTargetUrl: string;
//       MobileNumber: string;
//     };
//   };
//   partner: {
//     api_client_id: string;
//   };
//   response_details: [];
//   user_pii_data: pii_data_type;
// }

interface pii_data_type {
  first_name?: string;
  last_name?: string;
  address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  dob?: string;
}

const NAME_SCORE_THRESHOLD = 70;
const ADDRESS_SCORE_THRESHOLD = 100;

export default class OwnershipOrchestratorService {
  private identityVerifyService!: IdentityVerifyService;
  private identityConfirmationService!: IdentityConfirmationService;
  private prefillRecord!: any;
  private prefillRecordId!: number;

  constructor(prefillRecordId: number) {
    this.prefillRecordId = prefillRecordId;
  }

  private async getPrefillRecord() {
    this.prefillRecord = await getRecords({ id: this.prefillRecordId });
  }

  public async execute({ last4, dob }: { last4?: string; dob?: string; }): Promise<any> {
    try {
      await this.getPrefillRecord();
      this.identityVerifyService = new IdentityVerifyService(
        this.prefillRecord,
      );
      const identityVerifysuccess = await this.identityVerifyService.run({ last4, dob });
      if (identityVerifysuccess) {
        await this.getPrefillRecord();
        const identityResponse =
          this.prefillRecord.responseDetails.payload.success_identity_response;
        console.log('Identity response:', identityResponse);
        if (identityResponse.verified) {
          console.log('Identity verified.');
          return true;
        } else {
          console.error('Identity could not be verified.');
          return false;
        }
      } else {
        console.error('Identity verify Service failed.');
        return false;
      }
    } catch (error) {
      console.error('Error executing services:', error);
      return false;
    }
  }
  public async finalize(pii_data: any): Promise<boolean> {
    try {
      await this.getPrefillRecord();
      this.prefillRecord.user_pii_data = pii_data;
      this.identityConfirmationService = new IdentityConfirmationService(
        this.prefillRecord,
      );
      const identityConfirmationSuccess =
        await this.identityConfirmationService.run();
      if (identityConfirmationSuccess) {
        await this.getPrefillRecord();
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
      this.prefillRecord.responseDetails.payload
        .success_identity_confirmation_response.verified &&
      this.prefillRecord.responseDetails.payload
        .success_identity_confirmation_response.prove_result.name.firstName >=
      NAME_SCORE_THRESHOLD &&
      this.prefillRecord.responseDetails.payload
        .success_identity_confirmation_response.prove_result.name.lastName >=
      NAME_SCORE_THRESHOLD &&
      this.prefillRecord.responseDetails.payload
        .success_identity_confirmation_response.prove_result.address
        .addressScore >= ADDRESS_SCORE_THRESHOLD
    );
  }
}
