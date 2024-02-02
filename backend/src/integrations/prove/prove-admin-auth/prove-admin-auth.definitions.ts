export type RefreshAdminTokens = {
    access_token: string;
    id_token: string;
    session_state: string;
};

export type AdminUsernamePassword = {
    username: string;
    password: string;
};

export type ProveApiCredentialTypes = 'prefill';

export const enum ProveAuthStep {
    PREFILL = 'prefill',
}

export const enum ProveApiAdminCredentials {
    PREFILL = 'prefill',
}

export type IOAuthTokensEncrypted = {
    accessTokenHash: string;
    idTokenHash?: string;
};

export type AdminAccessTokens = {
    ['accessToken']: string;
    ['idToken']: string;
    ['sessionState']: string;
};

export type AdminAccessToken = Map<ProveApiCredentialTypes, string>;

export type AdminTokens = Map<ProveApiCredentialTypes, AdminAccessTokens>;

export type IProveAdmin = {
    id?: string;
    name?: string;
    accessTokens?: AdminTokens;
    createdAt?: string;
    updatedAt?: string;
};

// export const ProveAdminSchema = new Schema<IProveAdmin>({
//     _id: { type: Schema.Types.ObjectId, required: true },
//     name: { type: String, required: true },
//     accessTokens: {
//         [ProveApiAdminCredentials.PREFILL]: {
//             accessToken: String,
//             idToken: String,
//             sessionState: String,
//         },
//     }
// }, { timestamps: true, _id: false });
