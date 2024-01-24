import CheckEligibilityService from '@src/services/reputation/check-eligibility.service';
import { PrefillColatedRecord, getRecords } from '@src/data-repositories/prefill.repository';
import { PROVE_TRUST_SCORE_CUTOFF_DEFAULT } from '@src/integrations/prove/(constants)';

export default class ReputationOrchestratorService {
  private checkEligibilityService!: CheckEligibilityService;
  private prefillResult!: Partial<PrefillColatedRecord>;
  private prefillRecordId!: number;

  constructor(prefillRecordId: number) {
    this.prefillRecordId = prefillRecordId;
  }

  private async getPrefillRecord() {
    this.prefillResult = await getRecords({ id: this.prefillRecordId });
  }

  public async execute(): Promise<boolean> {
    try {
      await this.getPrefillRecord();
      this.checkEligibilityService = new CheckEligibilityService(
        this.prefillResult,
      );
      const checkEligibilitySuccess = await this.checkEligibilityService.run();
      if (checkEligibilitySuccess) {
        const minTrustScore = PROVE_TRUST_SCORE_CUTOFF_DEFAULT;
        await this.getPrefillRecord();
        //@ts-ignore
        const trustScore = this?.prefillResult?.responseDetails?.payload?.success_trust_response?.trust_score;
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
