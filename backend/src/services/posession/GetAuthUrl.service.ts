import ResourceApi from '@src/helpers/ResourceApi';
import { Prove } from '@src/integrations/prove/index';
interface ApiResponse {
  body: any;
  status: number;
  success: boolean;
}

interface RequestDetail {
  request_id: string;
  session_id: string;
  payload: {
    SourceIp: string;
    FinalTargetUrl: string;
    MobileNumber: string;
  };
}

interface ObjectArgs {
  request_detail: RequestDetail;
  partner: {
    api_client_id: string;
  };
}

export default class GetAuthUrlService {
  private object: ObjectArgs;
  private requestDetail: RequestDetail;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.request_detail;
  }

  public async run(): Promise<boolean> {
    const path = '/fortified/2015/06/01/getAuthUrl';
    const payload = this.buildPayload();
    const proveService = new Prove();

    try {
      const response = await proveService.getAuthUrl(
        payload.SourceIp,
        payload.MobileNumber,
        '',
      );
      console.log('Prove API response:', response);
      // Write TO DB
      return true;
    } catch (error) {
      console.error('Error calling Prove API:', error);
      return false;
    }
  }

  private buildPayload(): any {
    const payload = {
      SourceIp: this.requestDetail.payload.SourceIp,
      MobileNumber: this.requestDetail.payload.MobileNumber,
    };
    return payload;
  }
}

// Usage example:
// const requestDetail: RequestDetail = {
//   request_id: 'YOUR_REQUEST_ID',
//   session_id: 'YOUR_SESSION_ID',
//   payload: {
//     SourceIp: 'YOUR_SOURCE_IP',
//     FinalTargetUrl: 'YOUR_FINAL_TARGET_URL',
//     MobileNumber: 'YOUR_MOBILE_NUMBER',
//     // Other payload fields
//   },
//   // Other request detail fields
// };
//
// const objectArgs: ObjectArgs = {
//   request_detail: requestDetail,
//   partner: {
//     api_client_id: 'YOUR_API_CLIENT_ID',
//     // Other partner fields
//   },
//   // Other object arguments
// };
//
// const getAuthUrlService = new GetAuthUrlService(objectArgs);
// getAuthUrlService.run().then((result) => {
//   console.log('Service Result:', result);
// });
