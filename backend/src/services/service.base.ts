import { Prove } from '@src/integrations/prove';
import { PrefillColatedRecord } from '@src/data-repositories/prefill.repository';
import PrefillWithoutMnoConsent from '@src/models/prefill-without-mno-consent';
import RequestDetail from '@src/models/request-detail';
import ResponseDetail from '@src/models/response-detail';
import { IdentityServiceResponse, IdentityVerifyRunArgs, PrefillResultsExtended } from '@src/services/ownership/(definitions)';
import { InstantLinkRunArgs } from '@src/services/possesion/(definitions)';
import { AuthUrlResponse, ProveInstantLinkResult, ProvePrefillResult, ProveSendSMSResponse, ProveVerifyIdentityResponse, TrustResponse } from '@src/integrations/prove/(definitions)';
import { ServiceType } from '@src/services/(definitions)';

export default abstract class PrefillServiceBase {
    protected prefillResult: Partial<PrefillColatedRecord>;
    protected prefillRecord: PrefillWithoutMnoConsent;
    protected requestDetail: RequestDetail;
    protected responseDetail: ResponseDetail;
    protected ProveService: Prove;
    protected serviceType: ServiceType;

    constructor(serviceType: ServiceType, args: Partial<PrefillColatedRecord | PrefillResultsExtended>, ) {
        this.serviceType = serviceType; 
        this.prefillResult = args;
        this.prefillRecord = this?.prefillResult?.prefillRecord as PrefillWithoutMnoConsent;
        this.requestDetail = this?.prefillResult?.requestDetail as RequestDetail;
        this.responseDetail = this?.prefillResult?.responseDetails as ResponseDetail;
        if (!this.prefillRecord || !this.requestDetail || !this.responseDetail) {
          throw new Error(`Error during init of ${serviceType} service class: PrefillRecord, RequestDetail, and ResponseDetails are required.`)
        }
        this.ProveService = new Prove(); 
    }
    /**
     * Method to run the service.
     */
    protected abstract run(args?: IdentityVerifyRunArgs | InstantLinkRunArgs): Promise<IdentityServiceResponse | boolean>;
    /**
     * Method to update the response details.
     */
    protected abstract updateResponse?(response: ProveInstantLinkResult | ProveVerifyIdentityResponse | AuthUrlResponse | ProvePrefillResult | ProveSendSMSResponse | Partial<TrustResponse>): Promise<void>;
    /**
     * Method to update the request details.
     */
    protected abstract updateRequest?(response: any): Promise<void>;

    /**
     * Method to build the request payload.
     */
    protected abstract buildRequestPayload?(): void; 
}