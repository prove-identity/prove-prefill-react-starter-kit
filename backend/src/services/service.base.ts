import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import PrefillWithoutMnoConsent from '@src/models/prefill-without-mno-consent';
import RequestDetail from '@src/models/request-detail';
import ResponseDetail from '@src/models/response-detail';
import { PrefillResultsExtended } from './ownership/(definitions)';
import { Prove } from '@src/integrations/prove';

export default abstract class PrefillServiceBase {
    protected prefillResult: Partial<PrefillColatedRecord>;
    protected prefillRecord: PrefillWithoutMnoConsent;
    protected requestDetail: RequestDetail;
    protected responseDetail: ResponseDetail;
    protected ProveService: Prove;

    constructor(args: Partial<PrefillColatedRecord | PrefillResultsExtended>) {
        this.prefillResult = args;
        this.prefillRecord = this?.prefillResult?.prefillRecord as PrefillWithoutMnoConsent;
        this.requestDetail = this?.prefillResult?.requestDetail as RequestDetail;
        this.responseDetail = this?.prefillResult?.responseDetails as ResponseDetail;
        if (!this.prefillRecord || !this.requestDetail || !this.responseDetail) {
          throw new Error('PrefillRecord, RequestDetail, and ResponseDetails are required for init.')
        }
        this.ProveService = new Prove(); 
    }
}