import IdentityVerifyService from '@src/services/ownership/identity-verify.service';
import IdentityConfirmationService from '@src/services/ownership/identity-confirmation.service';
import { getRecords } from '@src/data-repositories/prefill.repository';

interface objectArgs {
  request_detail: {
    request_id: string;
    session_id: string;
    payload: {
      SourceIp: string;
      FinalTargetUrl: string;
      MobileNumber: string;
    };
  };
  partner: {
    api_client_id: string;
  };
  response_details: [];
}
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

  public async execute(): Promise<any> {
    try {
      await this.getPrefillRecord();
      this.identityVerifyService = new IdentityVerifyService(
        this.prefillRecord,
      );
      const identityVerifysuccess = await this.identityVerifyService.run();
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
  public async finalize(): Promise<any> {
    try {
      await this.getPrefillRecord();
      this.identityConfirmationService = new IdentityConfirmationService(
        this.prefillRecord,
      );
      const identityConfirmationSuccess =
        await this.identityConfirmationService.run();
      if (identityConfirmationSuccess) {
        await this.getPrefillRecord();
        const identityConfirmationResponse =
          this.prefillRecord.responseDetails.payload
            .success_identity_confirmation_response;
        console.log('Identity response:', identityConfirmationResponse);
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
        70 &&
      this.prefillRecord.responseDetails.payload
        .success_identity_confirmation_response.prove_result.name.lastName >=
        70 &&
      this.prefillRecord.responseDetails.payload
        .success_identity_confirmation_response.prove_result.address
        .addressScore >= 100
    );
  }
}
