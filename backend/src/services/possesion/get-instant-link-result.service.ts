import { Prove } from '@src/integrations/prove/index';
import { AuthState } from '@src/integrations/prove/(constants)';
import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import PrefillServiceBase from '@src/services/service.base';

export default class GetInstantLinkResultService extends PrefillServiceBase {
  private vfp!: string;

  constructor(args: Partial<PrefillColatedRecord>) {
    super(args);
  }

  public async run(vfp: string): Promise<boolean> {
    this.vfp = vfp;
    
    try {
      const response = await this.ProveService.getInstantLinkResult(this.vfp);
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