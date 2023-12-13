import moment, { Moment } from "moment";
import axios, { AxiosResponse } from 'axios';
import { sleep } from "../util/helpers";

const API_BASE = process.env.REACT_APP_BASE_API_URL;

export interface ErrorResult {
    message?: string;
    error_code?: string;
}

export interface CheckTrustResult extends ErrorResult {
    message: 'success';
    verified: boolean;
    redirectUrl?: string;
}

export const checkTrust = async (env: 'sandbox' | 'production', phoneNumber: string, accessToken: string): Promise<AxiosResponse<CheckTrustResult>> => {
    if(API_BASE) {
        return axios.post(`${API_BASE}/v1/identity-verification/${env}/identity-check/auth-url`, {
            phoneNumber,
        }, {
            headers: {
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
    reputationCheck: boolean;
    possessionCheck: boolean;
    proceedToEligibility: boolean;
    eligibilityCheck: boolean;
    ownershipCheck: boolean;
    ownershipCheckCapReached: boolean;
    identityVerified: boolean;
}

export const getVerifyStatus = async (env: 'sandbox' | 'production', accessToken: string): Promise<AxiosResponse<VerifyStatusResult>> => {
    if(API_BASE){
        return axios.get(`${API_BASE}/v1/identity-verification/${env}/identity-check/verify-status`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
    } else {
        await sleep(2);
        return {
            data: {
                "reputationCheck" : true,
                "possessionCheck" : true,
                "proceedToEligibility" : true,
                "eligibilityCheck" : true,
                "ownershipCheck" : true,
                "ownershipCheckCapReached" : true,
                "identityVerified" : true,
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


export const resendAuthSMS = async (env: 'sandbox' | 'production', accessToken: string): Promise<AxiosResponse<ErrorResult>> => {
    if(API_BASE) {
        return axios.post(`${API_BASE}/v1/identity-verification/${env}/identity-check/auth-url/resend`,
        {},
        {
            headers: {
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

export const getInstantAuthResult = async (env: 'sandbox' | 'production', vfp: string, userAuthGuid: string):
    Promise<AxiosResponse<InstantAuthResult>> => {
        if(API_BASE) {
            return axios.get(`${API_BASE}/v1/identity-verification/${env}/identity-check/instant-link`, {
                params: {
                    vfp,
                    userAuthGuid
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

export const identity = async (env: 'sandbox' | 'production', dob: string, accessToken: string): Promise<AxiosResponse<IdentityResult & ErrorResult>> => {
    if(API_BASE) {
        return axios.post(`${API_BASE}/v1/identity-verification/${env}/identity-check/identity`, {
            dob: moment(dob).format("YYYY-MM-DD"),
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
        );
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

export const eligibility = async (env: 'sandbox' | 'production', accessToken: string): Promise<AxiosResponse<EligibilityResult>> => {
    if(API_BASE) {
        return axios.post(`${API_BASE}/v1/identity-verification/${env}/identity-check/eligibility`,
        {},
        {
            headers: {
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
    env: 'sandbox' | 'production',
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
    if(API_BASE) {
        return axios.post(`${API_BASE}/v1/identity-verification/${env}/identity-check/verify-identity`, {
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
