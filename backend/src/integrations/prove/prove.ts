import {
  API_PREFILL_CLIENT_ID,
  API_PREFILL_SUB_CLIENT_ID,
} from './prove.constants';

export class ProveIdentity {
  private apiClientId: string;
  private apiSubClientId: string;
  static getCreds(opts?: { clientType: '' }): {
    apiClientId: string;
    apiSubClientId: string;
  } {
    let apiClientId: string, apiSubClientId: string;
    switch (opts?.clientType) {
      //add more clientTypes here per your own spec
      default:
        apiClientId = API_PREFILL_CLIENT_ID || '';
        apiSubClientId = API_PREFILL_SUB_CLIENT_ID || '';
        break;
    }
    return { apiClientId, apiSubClientId };
  }

  public async getEchoEndpoint() {
    return { message: 'ok' };
  }
  private validateConfig() {
    if (!this.apiClientId || !this.apiSubClientId) {
      throw new Error('Missing Credentials for init of ProveIdentity');
    }
  }
  constructor(opts?: { clientType: '' }) {
    const { apiClientId, apiSubClientId } = ProveIdentity.getCreds(opts);
    this.apiClientId = apiClientId;
    this.apiSubClientId = apiSubClientId;
    this.validateConfig();
  }
}
