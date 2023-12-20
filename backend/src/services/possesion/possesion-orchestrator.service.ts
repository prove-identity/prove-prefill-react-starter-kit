import GetInstantLinkResultService from './get-instant-link-result.service';
import GetAuthUrlService from './get-auth-url.service';
import SendSMSService from './send-sms.service';
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
export default class PossessionOrchestratorService {
  private getInstantLinkResult!: GetInstantLinkResultService;
  private getAuthUrlService!: GetAuthUrlService;
  private sendSMSService!: SendSMSService;
  private prefillRecord!: any;
  private prefillRecordId!: number;

  constructor(prefillRecordId: number) {
    this.prefillRecordId = prefillRecordId;
  }

  private async getPrefillRecord() {
    this.prefillRecord = await getRecords({ id: this.prefillRecordId});
  }

  public async execute(): Promise<void> {
    try {
      await this.getPrefillRecord(); // Update prefillRecord
      this.getAuthUrlService = new GetAuthUrlService(this.prefillRecord);
      // Dependency injection thereafter for each service
      //TODO: do we need a manual checkTrust against the phoneNumber
      const getAuthUrlSuccess = await this.getAuthUrlService.run();
      if (getAuthUrlSuccess) {
        await this.getPrefillRecord(); // Update prefillRecord
        this.sendSMSService = new SendSMSService(this.prefillRecord);
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
        this.prefillRecord,
      );
      await this.getInstantLinkResult.run(vfp);
      console.log('Auth Url verified.');
    } catch (error) {
      console.error('Error executing services:', error);
    }
  }
}

// Usage example:
// const orchestrator = new PossessionOrchestratorService();
// orchestrator.execute();
