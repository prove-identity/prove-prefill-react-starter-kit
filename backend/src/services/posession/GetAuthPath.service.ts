import ResourceApi from '@src/helpers/ResourceApi';
interface ApiResponse {
  body: any;
  status: number;
  success: boolean;
}

interface RequestDetail {
  request_id: string;
  payload: {
    VerificationFingerprint: string;
  };
}

interface ObjectArgs {
  request_detail: RequestDetail;
}

interface ResponseBody {
  Status: number;
}

export default class GetAuthPathService {
  private object: ObjectArgs;
  private requestDetail: RequestDetail;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.request_detail;
  }

  public async run(): Promise<boolean> {
    const path = '/fortified/2015/06/01/getAuthPath';
    const payload = this.buildPayload();
    const apiCall = new ResourceApi();

    try {
      const response = await apiCall.post(path, payload);
      if (response.success === true && response.body?.Status === 0) {
        return true;
      } else {
        console.error(response.body);
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private buildPayload(): any {
    const payload = {
      RequestId: this.requestDetail.request_id,
      ApiClientId: '', //this.object.partner.api_client_id,
      VerificationFingerprint:
        this.requestDetail.payload.VerificationFingerprint,
    };
    return payload;
  }
}

// Usage example:
// const requestDetail: RequestDetail = {
//   request_id: 'YOUR_REQUEST_ID',
//   payload: {
//     VerificationFingerprint: 'YOUR_VERIFICATION_FINGERPRINT',
//     // Other payload fields
//   },
//   // Other request detail fields
// };
//
// const objectArgs: ObjectArgs = {
//   request_detail: requestDetail,
//   // Other object arguments
// };
//
// const service = new GetAuthPathService(objectArgs);
// service.run().then((result) => {
//   console.log('Service Result:', result);
// });
