import moment, { Moment } from "moment";
import axios, { AxiosResponse } from 'axios';
import { sleep } from "../util/helpers";

const API_BASE = import.meta.env.REACT_APP_BASE_API_URL;

const DEFAULT_REQUEST_HEADERS: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

export interface ErrorResult {
    message?: string;
    error_code?: string;
}

export enum AppEnv {
    PRODUCTION = 'production',
    STAGING = 'staging'
};

export type SessionConfig = {
    sessionId: string | null;
    userId: string | null;
};

export interface TokenExchangeResult extends ErrorResult {
    access_token?: string;
}

export const exchangePublicTokenForAccessToken = async (sessionConfig: SessionConfig): Promise<AxiosResponse<TokenExchangeResult>> => {
    if (API_BASE) {
        return axios.post(`${API_BASE}/v1/identity-verification/identity-check/token`, {
            ...sessionConfig
        }, {
            headers: {
               ...DEFAULT_REQUEST_HEADERS
            }
        });
    } else {
        await sleep(2);
        return {
            data: {
                "message": "ok",
                "access_token": "JWT-TOKEN-HERE"
            },
            name: "",
            stack: "",
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as unknown as AxiosResponse<CheckTrustResult>;
    }
}

export interface CheckTrustResult extends ErrorResult {
    message: 'success';
    verified: boolean;
    redirectUrl?: string;
}

export const checkTrust = async (phoneNumber: string, accessToken: string): Promise<AxiosResponse<CheckTrustResult>> => {
    if (API_BASE) {
        return axios.post(`${API_BASE}/v1/identity-verification/identity-check/auth-url`, {
            phoneNumber,
        }, {
            headers: {
                ...DEFAULT_REQUEST_HEADERS,
                Authorization: `Bearer ${accessToken}`
            }
        })
    } else {
        await sleep(2);
        return {
            data: {
                "message": "ok",
                "verified": true,
                "redirectUrl": '',
            },
            name: "",
            stack: "",
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as unknown as AxiosResponse<CheckTrustResult>;
    }
}

export interface VerifyStatusResult extends ErrorResult {
    state: 'sms_clicked'
}

export const getVerifyStatus = async (accessToken: string): Promise<AxiosResponse<VerifyStatusResult>> => {
    if (API_BASE) {
        return axios.get(`${API_BASE}/v1/identity-verification/identity-check/verify-status`, {
            headers: {
                ...DEFAULT_REQUEST_HEADERS,
                Authorization: `Bearer ${accessToken}`
            }
        }) as Promise<AxiosResponse<VerifyStatusResult>>;
    } else {
        await sleep(2);
        return {
            data: {
                state: "sms_clicked"
            },
            name: "",
            stack: "",
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as unknown as AxiosResponse<VerifyStatusResult>;
    }
}

export const resendAuthSMS = async (accessToken: string): Promise<AxiosResponse<ErrorResult>> => {
    if (API_BASE) {
        return axios.post(`${API_BASE}/v1/identity-verification/identity-check/auth-url/resend`,
            {},
            {
                headers: {
                    ...DEFAULT_REQUEST_HEADERS,
                    Authorization: `Bearer ${accessToken}`
                }
            })
    } else {
        await sleep(2);
        return {
            data: {
                "message": "ok",
                "verified": true,
            },
            name: "",
            stack: "",
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as unknown as AxiosResponse<VerifyIdentityResult>;
    }
}

export interface InstantAuthResult extends ErrorResult {
    message: string;
    verified: boolean;
}

export const getInstantAuthResult = async (vfp: string, userAuthGuid: string):
    Promise<AxiosResponse<InstantAuthResult>> => {
    if (API_BASE) {
        return axios.get(`${API_BASE}/v1/identity-verification/identity-check/instant-link`, {
            params: {
                vfp,
                userAuthGuid
            }, 
            headers: {
                ...DEFAULT_REQUEST_HEADERS,
            }
        })
    } else {
        await sleep(2);
        return {
            data: {
                "message": "ok",
                "verified": true,
            },
            name: "",
            stack: "",
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as unknown as AxiosResponse<InstantAuthResult>;
    }
}

export interface IdentityResult extends ErrorResult {
    message: string;
    verified?: boolean;
    manualEntryRequired?: boolean;
    prefillData: {
        firstName?: string;
        lastName?: string;
        dob?: string;
        last4?: string;
        address?: string;
        extendedAddress?: string;
        city?: string;
        region?: string;
        postalCode?: string;
    }
}

export const identity = async (dob: string, accessToken: string): Promise<AxiosResponse<IdentityResult & ErrorResult>> => {
    if (API_BASE) {
        return axios.post(`${API_BASE}/v1/identity-verification/identity-check/identity`, {
            dob: moment(dob).format("YYYY-MM-DD"),
        }, {
            headers: {
                ...DEFAULT_REQUEST_HEADERS,
                Authorization: `Bearer ${accessToken}`
            }
    });
    } else {
        await sleep(2);
        return {
            data: {
                "message": "ok",
                "verified": true,
                "manualEntryRequired": false,
                "prefillData": {
                    "firstName": "Test",
                    "lastName": "User",
                    "dob": "1993-01-01",
                    "last4": "7889",
                    "address": "13 Swift Lane",
                    "extendedAddress": "Apt. 1989",
                    "city": "Nashville",
                    "region": "TN",
                    "postalCode": "198913"
                },
            },
            name: "",
            stack: "",
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as unknown as AxiosResponse<IdentityResult & ErrorResult>;
    }
}

export interface EligibilityResult extends ErrorResult {
    verified?: boolean;
    eligibity?: boolean;
}

export const eligibility = async (accessToken: string): Promise<AxiosResponse<EligibilityResult>> => {
    if (API_BASE) {
        return axios.post(`${API_BASE}/v1/identity-verification/identity-check/eligibility`,
            {},
            {
                headers: {
                    ...DEFAULT_REQUEST_HEADERS,
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
    } else {
        await sleep(2);
        return {
            data: {
                verified: true,
                eligibity: true,
            },
            name: "",
            stack: "",
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as unknown as AxiosResponse<EligibilityResult>;
    }
}

export interface VerifyIdentityResult extends ErrorResult {
    verified: boolean;
    error_message?: string;
}

export const verifyIdentity = async (
    accessToken: string,
    firstName: string,
    lastName: string,
    dob: Moment,
    last4: string,
    city: string,
    address: string,
    region: string,
    postalCode: string
): Promise<AxiosResponse<VerifyIdentityResult>> => {
    if (API_BASE) {
        return axios.post(`${API_BASE}/v1/identity-verification/identity-check/verify-identity`, {
            firstName,
            lastName,
            dob: dob.format("YYYY-MM-DD"),
            last4,
            city,
            address,
            region,
            postalCode
        },
            {
                headers: {
                    ...DEFAULT_REQUEST_HEADERS,
                    Authorization: `Bearer ${accessToken}`
                }
            });
    } else {
        await sleep(2);
        return {
            data: {
                "message": "ok",
                "verified": true,
            },
            name: "",
            stack: "",
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as unknown as AxiosResponse<VerifyIdentityResult>;
    }
}
