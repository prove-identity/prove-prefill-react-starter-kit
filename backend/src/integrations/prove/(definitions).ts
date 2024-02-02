export const enum ConsentStatus {
  OPTED_IN = 'optedIn'
}

export const enum ProveStatusCodes {
  SUCCESS = 0, 
  NO_DATA_AVAILABLE = 1012
}

export type UserAuthGuidPayload = {
  userAuthGuid: string;
  encryptedGuid: string;
  iv?: string;
  key?: string;
};

export type EligibilityResult = {
  eligibility: boolean;
  payfoneAlias: string;
};

export type VerifyIdentityPayload = {
  requestId?: string;
  consentStatus?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  last4?: string;
  dob?: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  details?: boolean;
  knowYourCustomer?: boolean;
};

export type ProveVerifyIdentityResponse = {
  requestId: string;
  status: number;
  description: string;
  response: VerifyIdentityApiResponse;
};

export type VerifyIdentityApiResponse = {
  status?: number;
  verified: boolean;
  transactionId: string;
  phoneNumber: string;
  lineType: string;
  carrier: string;
  countryCode: string;
  name: Name;
  address?: ProveVerifyAddressResponse;
  identifiers: Identifiers;
};

export type ProveVerifyAddressResponse = {
  streetNumber: number;
  street: boolean;
  city: boolean;
  region: boolean;
  postalCode: boolean;
  distance: number;
  addressScore: number;
};

interface Identifiers {
  dob: boolean;
  last4: boolean;
}

interface Name {
  firstName: number;
  lastName: number;
  nameScore: number;
}

export type VerifyIdentityResponse = {
  status?: number;
  requestId?: string;
  proveVerified?: boolean;
  verified?: boolean;
  phoneNumber?: string;
  lineType?: string;
  countryCode?: string;
  dob?: string;
  name?: Name;
  address?: ProveVerifyAddressResponse;
  identifiers?: Identifiers;
  errorReasons?: string[];
};

export type ProveInstantLinkResponse = {
  RequestId: string;
  Status: number;
  Description: string;
  Response: InstantLinkResponseDetails;
};

export type InstantLinkResponseDetails = {
  PhoneMatch: string;
  IpAddressMatch: boolean;
  LinkClicked: boolean;
  PhoneNumber: string;
  LineType: string;
  CountryCode: string;
};

export type ProveInstantLinkResult = InstantLinkResponseDetails & {
  verified: boolean;
};

export type ProveTrustResponse = {
  status: number;
  description: string;
  requestId: string;
  response: TrustResponse;
};

export type TrustResponse = {
  verified?: boolean;
  payfoneAlias: string;
  phoneNumber: string;
  lineType: string;
  countryCode: string;
  trustScore: number;
};

export type ProveAuthResponse = {
  trustScore: number;
  countryCode: string;
  lineType: string;
  phoneNumber: string;
};

export type ProveAuthUrlApiResponse = {
  Description: string;
  RequestId: string;
  Response: AuthUrlResponse;
  Status: number;
};

export type AuthUrlResponse = {
  AuthenticationUrl: string;
  redirectUrl?: string;
};

export type ProveSendSMSResponse = {
  statusCode: string;
  statusText: string;
};


export interface ProvePrefillResponse {
  status: number;
  description: string;
  requestId: string;
  response?: PrefillResponse;
  additionalInfo?: string;
}

interface PrefillResponse {
  transactionId: string;
  phoneNumber: string;
  lineType: string;
  carrier: string;
  countryCode: string;
  reasonCodes: string[];
  individual: PrefillIndividual;
}

interface PrefillIndividual {
  firstName: string;
  lastName: string;
  addresses: PrefillAddress[];
  emailAddresses: string[];
  dob?: string;
  ssn?: string;
}

interface PrefillAddress {
  address: string;
  extendedAddress?: string;
  city: string;
  region: string;
  postalCode: string;
  firstSeen?: string;
  lastSeen?: string;
}

export interface ProvePrefillResult {
  verified: boolean;
  status?: number;
  requestId?: string;
  manualEntryRequired?: boolean;
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

export type AuthResult = {
  'token_type': string;
  'access_token': string;
  'expires_in': number;
  'refresh_token': string;
  'refresh_expires_in': number;
  'not-before-policy': number;
  'id_token': string;
  'session_state': string;
};