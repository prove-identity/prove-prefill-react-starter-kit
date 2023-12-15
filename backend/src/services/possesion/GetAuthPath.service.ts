import { Prove } from '@src/integrations/prove/index';
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
  requestDetail: RequestDetail;
}

interface ResponseBody {
  Status: number;
}

export default class GetAuthPathService {
  private object: ObjectArgs;
  private requestDetail: RequestDetail;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.requestDetail;
  }

  public async run(): Promise<boolean> {
    const path = '/fortified/2015/06/01/getAuthPath';
    const payload = this.buildPayload();
    const apiCall = new Prove();

    try {
      const response = await apiCall.getInstantLinkResult(
        payload.VerificationFingerprint,
      );
      console.log('Prove API response:', response);
      // Write TO DB
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private buildPayload(): any {
    const payload = {
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
