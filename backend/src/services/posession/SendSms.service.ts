import ResourceApi from '@src/helpers/ResourceApi';

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
  request_detail: {
    request_id: string;
    payload: {
      MobileNumber: string;
    };
  };
  response_details: ResponseDetail[];
}

export default class SendSmsService {
  private object: ObjectArgs;
  private requestDetail: ObjectArgs['request_detail'];
  private responseDetail: ResponseDetail | undefined;
  private authenticationUrl: string;
  private mobileNumber: string;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.request_detail;
    this.responseDetail = this.object.response_details[0];
    this.authenticationUrl =
      this.responseDetail?.payload.response.authentication_url || '';
    this.mobileNumber = this.requestDetail.payload.MobileNumber || '';
  }

  public async run(): Promise<boolean> {
    if (this.authenticationUrl && this.mobileNumber) {
      const path = `/sendSms/${this.mobileNumber}/v1`;
      const payload = this.buildPayload();
      const headers = this.buildHeaders();
      const apiCall = new ResourceApi();

      const token = await this.findAuthToken();
      headers['Authorization'] = `Bearer ${token}`;

      apiCall.setOAuth(true);
      apiCall.setAuthParams(headers);

      try {
        const response = await apiCall.post(path, payload);
        if (response.success) {
          return true;
        } else {
          console.error(response.body);
          return false;
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    } else {
      console.error('AuthenticationUrl or MobileNumber is not present!');
      return false;
    }
  }

  private buildHeaders(): { [key: string]: string } {
    return {
      'request-id': this.requestDetail.request_id,
    };
  }

  private buildPayload(): any {
    return {
      message: this.authenticationUrl,
    };
  }

  private async findAuthToken(): Promise<string> {
    return 'YOUR_ACCESS_TOKEN';
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
