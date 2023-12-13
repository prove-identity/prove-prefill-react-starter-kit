//package import
import { ProveLynx as ProveSDK, } from '@prove/lynx';
import { randomUUID } from 'crypto';
//module import 
import { EchoWebResponseModel } from '@prove/lynx/dist/models/components/echowebresponsemodel';
import { ProvePrefill } from './prove.base';
import { API_PREFILL_CLIENT_ID, API_PREFILL_SUB_CLIENT_ID } from './prove.constants';

export class ProveIdentity implements ProvePrefill {
    private proveSDK: ProveSDK;
    private apiClientId: string;
    private apiSubClientId: string;
    static getCreds(opts?: { clientType: '' }): { apiClientId: string, apiSubClientId: string } {
        let apiClientId: string, apiSubClientId: string;
        switch (opts?.clientType) {
            //add more clientTypes here per your own spec
            default:
                apiClientId = API_PREFILL_CLIENT_ID || '';
                apiSubClientId = API_PREFILL_SUB_CLIENT_ID || '';
                break;
        }
        return { apiClientId, apiSubClientId }
    }
    private validateConfig() {
        if (!this.apiClientId || !this.apiSubClientId) {
            throw new Error('Missing Credentials for init of ProveIdentity')
        }
    }
    constructor(opts?: { clientType: '' }) {
        const { apiClientId, apiSubClientId } = ProveIdentity.getCreds(opts);
        this.apiClientId = apiClientId;
        this.apiSubClientId = apiSubClientId;
        this.proveSDK = new ProveSDK();
        this.validateConfig();
    }
    public async getEchoEndpoint(): Promise<EchoWebResponseModel | undefined> {
        try {
            const response = (await this.getEchoEndpointCall()).echoWebResponseModel;
            return response as EchoWebResponseModel;
        } catch (err) {
            console.error("Error in getEchoEndpoint:", err);
            // Handle or rethrow the error as appropriate
        }
    }
    private async getEchoEndpointCall() {
        return this.proveSDK.verifyEchoController.echo({
            message: 'Testing Prove connectivity.',
            requestId: randomUUID()
        },
            this.apiClientId,
            this.apiSubClientId
        );
    }
}