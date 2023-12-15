import { Prove } from '@src/integrations/prove/index';

interface ApiResponse {
  body: any;
  status: number;
  success: boolean;
}

interface ResponseDetail {
  payload: {
    response: {
      authentication_url: string;
    };
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
  private authenticationUrl: string;
  private mobileNumber: string;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.requestDetail;
    this.responseDetail = this.object.responseDetails;
    this.authenticationUrl =
      this.responseDetail?.payload?.response?.authentication_url || '';
    this.mobileNumber = this.requestDetail.payload.MobileNumber || '';
  }

  public async run(): Promise<boolean> {
    if (this.authenticationUrl && this.mobileNumber) {
      const payload = this.buildPayload();
      const apiCall = new Prove();
      const response = await apiCall.sendSMS(
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
      message: this.authenticationUrl,
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
