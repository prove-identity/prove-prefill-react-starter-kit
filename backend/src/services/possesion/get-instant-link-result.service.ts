import { Prove } from '@src/integrations/prove/index';
import { AppEnvSelect } from 'src/(global_constants)';
import ResponseDetail from '@src/models/response-detail';
import { AuthState } from '@src/integrations/prove/(constants)';
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
  prefillRecord: any;
  requestDetail: RequestDetail;
  responseDetails: any;
}

interface ResponseBody {
  Status: number;
}

export default class GetInstantLinkResultService {
  private object: ObjectArgs;
  private requestDetail: RequestDetail;
  private responseDetail: any;
  private vfp!: string;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.requestDetail;
    this.responseDetail = this.object?.responseDetails;
  }

  public async run(vfp: string): Promise<boolean> {
    this.vfp = vfp;
    const proveService = new Prove();

    try {
      const response = await proveService.getInstantLinkResult(this.vfp);
      console.log('Prove API response:', response);
      if (response.LinkClicked === true && response.PhoneMatch !== 'false') {
        // Write TO DB
        this.object.prefillRecord.update({
          state: AuthState.SMS_CLICKED,
        });
        return true;
      } 
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
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
