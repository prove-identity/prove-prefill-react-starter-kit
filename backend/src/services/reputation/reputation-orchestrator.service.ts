import CheckEligibilityService from '@src/services/reputation/check-eligibility.service';
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

  public async execute(): Promise<any> {
    try {
      await this.getPrefillRecord();
      this.checkEligibilityService = new CheckEligibilityService(
        this.prefillRecord,
      );
      const checkEligibilitySuccess = await this.checkEligibilityService.run();
      const minTrustScore = 500;
      if (checkEligibilitySuccess) {
        await this.getPrefillRecord();
        const trustScore =
          this.prefillRecord.responseDetails.payload.success_trust_response
            .trust_score;
        if (trustScore && trustScore > minTrustScore) {
          console.log('Trust score verified.');
          return true;
        } else {
          console.error('Trust score is too low.');
          return false;
        }
      } else {
        console.error('Eligibility Service failed.');
        return false;
      }
    } catch (error) {
      console.error('Error executing services:', error);
      return false;
    }
  }
}
