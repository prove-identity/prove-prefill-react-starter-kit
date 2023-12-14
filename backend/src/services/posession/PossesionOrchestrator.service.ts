import GetAuthPathService from './GetAuthPath.service';
import GetAuthUrlService from './GetAuthUrl.service';
import SendSMSService from './SendSMS.service';

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
  private getAuthPathService: GetAuthPathService;
  private getAuthUrlService: GetAuthUrlService;
  private sendSMSService: SendSMSService;
  private prefillRecord!: any;
  private prefillRecordId!: string;

  constructor(prefillRecordId: string) {
    this.prefillRecordId = prefillRecordId;
    // this.prefillRecord = PrefillWithoutMnoConsent.get(this.prefillRecordId);
    this.getAuthPathService = new GetAuthPathService(this.prefillRecord);
    this.getAuthUrlService = new GetAuthUrlService(this.prefillRecord);
    this.sendSMSService = new SendSMSService(this.prefillRecord);
  }

  public async execute(): Promise<void> {
    try {
      const getAuthUrlSuccess = await this.getAuthUrlService.run();
      if (getAuthUrlSuccess) {
        const getAuthPathSuccess = await this.getAuthPathService.run();
        if (getAuthPathSuccess) {
          await this.sendSMSService.run();
          console.log('All services executed successfully.');
        } else {
          console.error('GetAuthPathService failed.');
        }
      } else {
        console.error('GetAuthUrlService failed.');
      }
    } catch (error) {
      console.error('Error executing services:', error);
    }
  }
}

// Usage example:
// const orchestrator = new PossessionOrchestratorService();
// orchestrator.execute();
