import CheckEligibilityService from '@src/services/reputation/check-eligibility.service';
import { getRecords } from '@src/data-repositories/prefill.repository';
import { PROVE_TRUST_SCORE_CUTOFF_DEFAULT } from '@src/integrations/prove/(constants)';

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


export default class ReputationOrchestratorService {
  private checkEligibilityService!: CheckEligibilityService;
  private prefillRecord!: any;
  private prefillRecordId!: number;

  constructor(prefillRecordId: number) {
    this.prefillRecordId = prefillRecordId;
  }

  private async getPrefillRecord() {
    this.prefillRecord = await getRecords({ id: this.prefillRecordId });
  }

  public async execute(): Promise<boolean> {
    try {
      await this.getPrefillRecord();
      this.checkEligibilityService = new CheckEligibilityService(
        this.prefillRecord,
      );
      const checkEligibilitySuccess = await this.checkEligibilityService.run();
      if (checkEligibilitySuccess) {
        const minTrustScore = PROVE_TRUST_SCORE_CUTOFF_DEFAULT;
        await this.getPrefillRecord();
        const trustScore =
          this?.prefillRecord?.responseDetails?.payload?.success_trust_response
            ?.trust_score;
        if (trustScore && trustScore >= minTrustScore) {
          //Trust Score Verified 
          return true;
        } else {
          //Could add logic here to save low trust score flag and do a step up to manual entry on frontend
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error executing services:', error);
      return false;
    }
  }
}
