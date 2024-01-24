import IdentityVerifyService from '@src/services/ownership/identity-verify.service';
import IdentityConfirmationService from '@src/services/ownership/identity-confirmation.service';
import { getRecords } from '@src/data-repositories/prefill.repository';
import { PrefillResultsExtended, SuccessIdentityResponse, SuccessIdentityConfirmationResponse } from '@src/services/ownership/(definitions)';

const NAME_SCORE_THRESHOLD = 70;
const ADDRESS_SCORE_THRESHOLD = 100;

export default class OwnershipOrchestratorService {
  private prefillResult!: PrefillResultsExtended;
  private prefillRecordId!: number;
  private identityVerifyService!: IdentityVerifyService;
  private identityConfirmationService!: IdentityConfirmationService;

  constructor(prefillRecordId: number) {
    this.prefillRecordId = prefillRecordId;
  }

  private async getPrefillResult() {
    this.prefillResult = await getRecords({ id: this.prefillRecordId });
  }

  public async execute({ last4, dob }: { last4?: string; dob?: string; }): Promise<boolean> {
    try {
        await this.getPrefillResult();

        // Initialize identity verification service
        this.identityVerifyService = new IdentityVerifyService(this.prefillResult);

        // Run identity verification
        const identityVerifySuccess = await this.identityVerifyService.run({ last4, dob });

        if (!identityVerifySuccess) {
            console.error('Identity verification service failed.');
            return false;
        }

        await this.getPrefillResult();
        const identityResponse = this.prefillResult.responseDetails.payload.success_identity_response as SuccessIdentityResponse;

        if (!identityResponse.verified) {
            console.error('Identity could not be verified.');
            return false; 
        }

        return identityResponse.verified;
    } catch (error) {
        console.error('Error during execution:', error);
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
    }): Promise<{ 
      verified: boolean, 
      ownershipCapReached?: boolean; 
    }> {
    try {
      await this.getPrefillResult();
  
      // Directly return if prefill result is already verified or not
      if (this.prefillResult.prefillRecord.verified != null) {
        return {
          verified: this.prefillResult.prefillRecord.verified,
          ownershipCapReached: true
        };
      }
  
      // Update user PII data
      this.prefillResult.user_pii_data = piiData;
  
      // Initialize identity confirmation service
      this.identityConfirmationService = new IdentityConfirmationService(this.prefillResult);
  
      // Run identity confirmation
      const identityConfirmationResult = await this.identityConfirmationService.run();
  
      // Handle result of identity confirmation
      if (identityConfirmationResult?.verified) {
        await this.getPrefillResult();
  
        const isIdentityConfirmed = this.identityConfirmationCriteria();
        console.log(isIdentityConfirmed ? 'Identity verified.' : 'Identity could not be confirmed.');
  
        return {
          verified: isIdentityConfirmed,
          ownershipCapReached: identityConfirmationResult.ownershipCapReached || false
        };
      } else {
        console.error('Identity Confirm Service failed.');
        return {
          verified: false,
          ownershipCapReached: identityConfirmationResult?.ownershipCapReached || false
        };
      }
    } catch (error) {
      console.error('Error executing services:', error);
      return { verified: false };
    }
  }

  private identityConfirmationCriteria(): boolean {
    // Extract the identity confirmation response
    const identityConfirmationResponse = this.prefillResult.responseDetails.payload.success_identity_confirmation_response as SuccessIdentityConfirmationResponse;
  
    console.log('identityConfirmationResponse: ', identityConfirmationResponse);
  
    // Return false immediately if response is not available
    if (!identityConfirmationResponse) return false;
  
    // Check if identity is verified and scores meet the threshold
    const isVerified = identityConfirmationResponse?.verified === true;
    const firstNameScore = (identityConfirmationResponse.prove_result?.name?.firstName ?? 0) >= NAME_SCORE_THRESHOLD;
    const lastNameScore = (identityConfirmationResponse.prove_result?.name?.lastName ?? 0) >= NAME_SCORE_THRESHOLD;
    const addressScore = (identityConfirmationResponse.prove_result?.address?.addressScore ?? 0) >= ADDRESS_SCORE_THRESHOLD;
  
    return isVerified && firstNameScore && lastNameScore && addressScore;
  }
}
