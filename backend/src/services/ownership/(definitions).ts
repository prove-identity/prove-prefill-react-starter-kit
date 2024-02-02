import { PrefillColatedRecord } from "@src/data-repositories/prefill.repository";
import { AuthState } from "@src/integrations/prove/(constants)";

export interface IdentityVerifyRunArgs {
  last4?: string;
  dob?: string;
}

export interface IdentityConfirmRequestPayload {
  firstName: string;
  lastName: string;
  address: string;
  extendedAddress?: string;
  city: string;
  region: string;
  postalCode: string;
  phoneNumber: string;
  dob?: string;
  last4?: string;
}

export interface IdentityServiceResponse {
  verified: boolean,
  ownershipCapReached?: boolean;
}

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

export interface UpdateIdentityConfirmationPayload {
  state: AuthState,
  ownership_check_count: number;
  verified?: boolean;
}

export interface SuccessIdentityConfirmationResponse {
  verified?: boolean,
  status?: number;
  proveVerified?: boolean;
  phoneNumber?: string
  lineType?: string,
  countryCode?: string;
  name?: {
    firstName: number;
    lastName: number;
    nameScore: number;
  };
  address?: {
    streetNumber: number;
    street: boolean;
    city: boolean;
    region: boolean;
    postalCode: boolean;
    distance: number;
    addressScore: number;
  };
  identifiers?: {
    last4: boolean;
    dob: boolean;
  };
  errorReasons?: string[]
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
  last4?: string; 
}

export interface PrefillResultsExtended extends PrefillColatedRecord {
  user_pii_data?: ProtectedUserData;
}