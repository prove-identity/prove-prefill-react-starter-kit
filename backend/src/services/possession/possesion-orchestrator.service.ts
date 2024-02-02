import GetInstantLinkResultService from '@src/services/possession/get-instant-link-result.service';
import GetAuthUrlService from '@src/services/possession/get-auth-url.service';
import SendSMSService from '@src/services/possession/send-sms.service';
import { PrefillColatedRecord, getRecords } from '@src/data-repositories/prefill.repository';

export default class PossessionOrchestratorService {
  private prefillResult!: Partial<PrefillColatedRecord>;
  private prefillRecordId!: number;
  private getInstantLinkResult!: GetInstantLinkResultService;
  private getAuthUrlService!: GetAuthUrlService;
  private sendSMSService!: SendSMSService;

  constructor(prefillRecordId: number) {
    this.prefillRecordId = prefillRecordId;
  }

  private async getPrefillRecord() {
    this.prefillResult = await getRecords({ id: this.prefillRecordId});
  }

  public async execute(): Promise<void> {
    try {
      await this.getPrefillRecord(); // Update prefillRecord
      this.getAuthUrlService = new GetAuthUrlService(this.prefillResult);
      // Dependency injection thereafter for each service
      const getAuthUrlSuccess = await this.getAuthUrlService.run();
      if (getAuthUrlSuccess) {
        await this.getPrefillRecord(); // Update prefillRecord
        this.sendSMSService = new SendSMSService(this.prefillResult);
        await this.sendSMSService.run();
        console.log('All services executed successfully.');
      } else {
        console.error('GetAuthUrlService failed.');
      }
    } catch (error) {
      console.error('Error executing services:', error);
    }
  }

  public async finalize(vfp: string): Promise<void> {
    try {
      await this.getPrefillRecord();
      this.getInstantLinkResult = new GetInstantLinkResultService(
        this.prefillResult,
      );
      await this.getInstantLinkResult.run({ vfp });
      console.log('Auth Url verified.');
    } catch (error) {
      console.error('Error executing services:', error);
    }
  }
}

// Usage example:
// const orchestrator = new PossessionOrchestratorService();
// orchestrator.execute();
