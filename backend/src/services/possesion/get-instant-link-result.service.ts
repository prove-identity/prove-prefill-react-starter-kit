import { Prove } from '@src/integrations/prove/index';
import { AuthState } from '@src/integrations/prove/(constants)';
import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import PrefillWithoutMnoConsent from '@src/models/prefill-without-mno-consent';
import RequestDetail from '@src/models/request-detail';
import ResponseDetail from '@src/models/response-detail';

export default class GetInstantLinkResultService {
  private prefillResult: Partial<PrefillColatedRecord>;
  private prefillRecord: PrefillWithoutMnoConsent;
  private requestDetail: RequestDetail;
  private responseDetail: ResponseDetail;
  private vfp!: string;

  constructor(args: Partial<PrefillColatedRecord>) {
    this.prefillResult = args;
    this.prefillRecord = this?.prefillResult?.prefillRecord as PrefillWithoutMnoConsent;
    this.requestDetail = this?.prefillResult?.requestDetail as RequestDetail;
    this.responseDetail = this?.prefillResult?.responseDetails as ResponseDetail;
    if (!this.requestDetail || !this.responseDetail || !this.prefillResult.prefillRecord) {
      throw new Error('RequestDetail and ResponseDetails are required for init.')
    }
  }

  public async run(vfp: string): Promise<boolean> {
    this.vfp = vfp;
    const proveService = new Prove();

    try {
      const response = await proveService.getInstantLinkResult(this.vfp);
      console.log('Prove API response:', response);
      //! criteria for determining possession
      if (response.LinkClicked === true && response.PhoneMatch !== 'false') {
        // Write TO DB
        this.prefillRecord.update({
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