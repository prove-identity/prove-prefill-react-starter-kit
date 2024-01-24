import { PrefillColatedRecord } from "@src/data-repositories/prefill.repository";

export interface SuccessIdentityResponse {
    verified?: boolean; 
    manual_entry_required?: boolean; 
    first_name?: string; 
    last_name?: string; 
    dob?: string; 
    last4?: string; 
    address?: string; 
    extended_address?: string; 
    city?: string; 
    region?: string; 
    postal_code?: string; 
  }
  
  export interface SuccessIdentityConfirmationResponse {
    verified?: boolean;
    prove_result: {
      "request_id": string,
      "status": number;
      "description": string,
      "verified": true,
      "transactionId": string,
      "phoneNumber": string
      "lineType": string,
      "carrier": string;
      "countryCode": string;
      "name": {
        "firstName": number;
        "lastName": number;
        "nameScore": number;
      },
      "knowYourCustomer": {
        "TotalHits": number;
      },
      "address": {
        "streetNumber": number;
        "street": boolean;
        "city": boolean;
        "region": boolean;
        "postalCode": boolean;
        "distance": number;
        "addressScore": number;
      },
      "identifiers": {
        "last4": boolean;
        "dob": boolean;
      },
      "reasonCodes": string[];
    }
  }
  
  export interface ProtectedUserData {
    first_name?: string;
    last_name?: string;
    address?: string;
    extended_address?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    dob?: string;
  }
  
  export interface PrefillResultsExtended extends PrefillColatedRecord {
    user_pii_data?: ProtectedUserData;
  }