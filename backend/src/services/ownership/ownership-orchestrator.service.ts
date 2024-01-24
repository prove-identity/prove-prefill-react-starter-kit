import IdentityVerifyService from '@src/services/ownership/identity-verify.service';
import IdentityConfirmationService from '@src/services/ownership/identity-confirmation.service';
import { PrefillColatedRecord, getRecords } from '@src/data-repositories/prefill.repository';

const NAME_SCORE_THRESHOLD = 70;
const ADDRESS_SCORE_THRESHOLD = 100;

export interface SuccessIdentityPayload {
  verified: boolean; 
  manual_entry_required?: boolean; 
  first_name?: string; 
  last_name?: string; 
  dob?: string; 
  last4?: string; 
  address?: string; 
  extended_address?: string; 
  city?: string; 
  region?: string; 
  postal_code?: string; 
}

export interface SuccessIdentityConfirmation {
  verified: boolean;
  prove_result: {
    "request_id": string,
    "status": number;
    "description": string,
    "verified": true,
    "transactionId": string,
    "phoneNumber": string
    "lineType": string,
    "carrier": string;
    "countryCode": string;
    "name": {
      "firstName": number;
      "lastName": number;
      "nameScore": number;
    },
    "know_your_customer": {
      "TotalHits": number;
    },
    "address": {
      "streetNumber": number;
      "street": boolean;
      "city": boolean;
      "region": boolean;
      "postalCode": boolean;
      "distance": number;
      "addressScore": number;
    },
    "identifiers": {
      "last4": boolean;
      "dob": boolean;
    },
    "reasonCodes": string[];
  }
}

export interface ProtectedUserData {
  first_name?: string;
  last_name?: string;
  address?: string;
  extended_address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  dob?: string;
}

export interface PrefillResultsExtended extends PrefillColatedRecord {
  user_pii_data?: ProtectedUserData;
}

export default class OwnershipOrchestratorService {
  private identityVerifyService!: IdentityVerifyService;
  private identityConfirmationService!: IdentityConfirmationService;
  private prefillResult!: PrefillResultsExtended;
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
          this.prefillResult.responseDetails.payload.success_identity_response as SuccessIdentityPayload;
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
    }): Promise<{ verified: boolean, ownershipCapReached?: boolean; }> {
    try {
      await this.getPrefillResult();
      if(this.prefillResult.prefillRecord.verified === true) {
        return { verified: true, ownershipCapReached: true };
      }
      if(this.prefillResult.prefillRecord.verified === false) {
        return { verified: false, ownershipCapReached: true };
      }
      this.prefillResult.user_pii_data = piiData;
      this.identityConfirmationService = new IdentityConfirmationService(
        this.prefillResult,
      );
      const identityConfirmationResult =
        await this.identityConfirmationService.run();
      if (identityConfirmationResult?.verified === true) {
        await this.getPrefillResult();
        if (this.identityConfirmationCriteria() === true) {
          console.log('Identity verified.');
          return { verified: true };
        } else {
          console.error('Identity could not be confirmed.');
          return { verified: false, ownershipCapReached: identityConfirmationResult?.ownershipCapReached || false };
        }
      } else {
        console.error('Identity Confirm Service failed.');
        return { verified: false, ownershipCapReached: identityConfirmationResult?.ownershipCapReached || false };
      }
    } catch (error) {
      console.error('Error executing services:', error);
      return { verified: false };
    }
  }

  private identityConfirmationCriteria(): boolean {
    const identityConfirmationResponse = 
    this.prefillResult.responseDetails.payload
        .success_identity_confirmation_response as SuccessIdentityConfirmation;
    console.log('identityConfirmationResponse: ', identityConfirmationResponse);
    return (
      identityConfirmationResponse.verified &&
      identityConfirmationResponse.prove_result.name.firstName >=
      NAME_SCORE_THRESHOLD &&
      identityConfirmationResponse.prove_result.name.lastName >=
      NAME_SCORE_THRESHOLD &&
      identityConfirmationResponse.prove_result.address
        .addressScore >= ADDRESS_SCORE_THRESHOLD
    );
  }
}
