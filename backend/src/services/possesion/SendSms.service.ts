import { Prove } from '@src/integrations/prove/index';
import { AppEnvSelect } from '@src/_global';

interface ApiResponse {
  body: any;
  status: number;
  success: boolean;
}

interface ResponseDetail {
  payload: {
    redirect_url: string;
    mobile_number: string;
  };
}

interface ObjectArgs {
  requestDetail: {
    request_id: string;
    payload: {
      MobileNumber: string;
    };
  };
  responseDetails: any;
}

export default class SendSmsService {
  private object: ObjectArgs;
  private requestDetail: ObjectArgs['requestDetail'];
  private responseDetail: ResponseDetail | undefined;
  private redirectUrl: string;
  private mobileNumber: string;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.requestDetail;
    this.responseDetail = this.object.responseDetails;
    this.redirectUrl =
      this.responseDetail?.payload?.redirect_url || '';
    this.mobileNumber = this.requestDetail.payload.MobileNumber || '';
  }

  public async run(): Promise<boolean> {
    if (this.redirectUrl && this.mobileNumber) {
      const payload = this.buildPayload();
      const proveService = new Prove(AppEnvSelect.SANDBOX);
      const response = await proveService.sendSMS(
        this.mobileNumber,
        payload.message,
      );
      console.log('Prove API response:', response);
      // Write TO DB
      return true;
    } else {
      console.error('AuthenticationUrl or MobileNumber is not present!');
      return false;
    }
  }

  private buildPayload(): any {
    return {
      message: this.redirectUrl,
    };
  }
}

// Usage example:
// const objectArgs: ObjectArgs = {
//   // Populate with your object arguments
// };
//
// const sendSmsService = new SendSmsService(objectArgs);
// sendSmsService.run().then((result) => {
//   console.log('Service Result:', result);
// });
