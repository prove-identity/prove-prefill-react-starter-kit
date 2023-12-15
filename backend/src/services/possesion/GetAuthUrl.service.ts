import { Prove } from '@src/integrations/prove';
import { AppEnvSelect } from '@src/_global';

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
  requestDetail: RequestDetail;
  responseDetails: any;
}

export default class GetAuthUrlService {
  private object: ObjectArgs;
  private requestDetail: RequestDetail;
  private responseDetail: any;

  constructor(args: ObjectArgs) {
    this.object = args;
    this.requestDetail = this.object.requestDetail;
    this.responseDetail = this.object.responseDetails;
  }

  public async run(): Promise<boolean> {
    const path = '/fortified/2015/06/01/getAuthUrl';
    const payload = this.buildPayload();
    const proveService = new Prove(AppEnvSelect.SANDBOX);

    try {
      const { userAuthGuid } = await Prove.generateUserAuthGuid();
      // await proveService.updateSuccessfulReputationCheck(
      //   userAuthGuid,
      //   phoneNumber,
      // );
      const response = await proveService.getAuthUrl(
        payload.SourceIp,
        payload.MobileNumber,
        userAuthGuid,
      );
      console.log('Prove API response:', response);
      // Write TO DB
      await this.updateResponse(response);
      return true;
    } catch (error) {
      console.error('Error calling Prove API from GetAuthUrl:', error);
      return false;
    }
  }

  private async updateResponse(response: any): Promise<void> {
    const currentPayload = this.responseDetail.payload || {};
    const updatedPayload = {
      ...currentPayload,
      authentication_url: 'YOUR_AUTH_URL_HERE',
    };

    // Update the payload attribute of the record with the new data
    await this.responseDetail.update({ payload: updatedPayload });
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
