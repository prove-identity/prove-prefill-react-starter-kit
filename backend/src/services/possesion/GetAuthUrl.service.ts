import { convertObjectKeysToSnakeCase } from '@src/helpers/validation.helper';
import { Prove } from '@src/integrations/prove';
import { AppEnvSelect } from '@src/_global';
const _ = require('lodash');

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

interface AuthUrlResponse {
  AuthenticationUrl: string;
  MobileOperatorName: string;
  redirectUrl?: string | undefined;
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
    const payload = this.buildPayload();
    const proveService = new Prove(AppEnvSelect.SANDBOX);

    try {
      const { userAuthGuid } = await Prove.generateUserAuthGuid();
      console.log('User Auth Guid:', userAuthGuid);
      const response = await proveService.getAuthUrl(
        payload.SourceIp,
        payload.MobileNumber,
        userAuthGuid,
      );
      console.log('Prove API response from getAuthURL Service:', response);
      // Write TO DB
      await this.updateResponse(response as AuthUrlResponse);
      return true;
    } catch (error) {
      console.error('Error calling Prove API from GetAuthUrl:', error);
      return false;
    }
  }

  private async updateResponse(response: AuthUrlResponse): Promise<void> {
    const currentPayload = this.responseDetail.payload || {};

    const updatedPayload = {
      ...currentPayload,
      ...convertObjectKeysToSnakeCase(response),
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
