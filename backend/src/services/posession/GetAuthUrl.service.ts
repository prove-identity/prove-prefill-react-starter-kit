import ResourceApi from '@src/helpers/ResourceApi';
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
    const apiCall = new ResourceApi();

    try {
      const response = await apiCall.post(path, payload);
      if (response.success === true) {
        // Handle success case
        return true;
      } else {
        // Handle failure case
        console.error(response.body);
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private buildPayload(): any {
    const finalTargetUrl = `${this.requestDetail.payload.FinalTargetUrl}/callbacks/vfp-verification?requestId=${this.requestDetail.request_id}`;

    const payload = {
      RequestId: this.requestDetail.request_id,
      SessionId: this.requestDetail.session_id,
      ApiClientId: this.object.partner.api_client_id,
      SourceIp: this.requestDetail.payload.SourceIp,
      FinalTargetUrl: finalTargetUrl,
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
