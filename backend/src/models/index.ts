import Client, { modelConfig as clientConfig } from '@src/models/client';
import PrefillWithoutMnoConsent, { modelConfig as prefillWithoutMnoConsentConfig } from '@src/models/prefill-without-mno-consent';
import ProveAdminAuth, { modelConfig as proveAdminAuthConfig } from '@src/models/prove-admin-auth';
import ProveAdminAuthUser, { modelConfig as proveAdminAuthUserConfig } from '@src/models/prove-admin-auth-user';
import RequestDetail, { modelConfig as requestDetailConfig } from '@src/models/request-detail';
import ResponseDetail, { modelConfig as responseDetailConfig } from '@src/models/response-detail';

export const models = { 
    Client,
    PrefillWithoutMnoConsent,
    ProveAdminAuth,
    ProveAdminAuthUser,
    RequestDetail,
    ResponseDetail
};

export const modelConfigs = {
    clientConfig,
    prefillWithoutMnoConsentConfig,
    proveAdminAuthConfig,
    proveAdminAuthUserConfig,
    requestDetailConfig,
    responseDetailConfig
};