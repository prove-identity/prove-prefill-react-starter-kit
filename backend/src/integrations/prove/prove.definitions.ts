import { Products } from './(constants)';

export type UserAuthGuidPayload = {
  userAuthGuid: string;
  encryptedGuid: string;
  iv?: string;
};

export type KycStatus = {
  reputationCheck: boolean;
  possessionCheck: boolean;
  proceedToEligibility: boolean;
  eligibilityCheck: boolean;
  ownershipCheck: boolean;
  ownershipCheckCapReached: boolean;
  identityVerified: boolean;
  product: Products;
};

export type EligibilityResult = {
  eligibility: boolean;
  payfoneAlias: string;
};

export type VerifyIdentityPayload = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  last4?: string;
  dob?: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
};

export type ProveManualEntryKYC = {
  requestId: string;
  status: number;
  description: string;
  response: VerifyIdentityResponse;
};

export type VerifyIdentityResponse = {
  verified: boolean;
  transactionId: string;
  phoneNumber: string;
  lineType: string;
  carrier: string;
  countryCode: string;
  name: Name;
  address?: ProveVerifyAddressResponse;
  identifiers: Identifiers;
  knowYourCustomer: KnowYourCustomer;
  reasonCodes: string[];
};

export type ProveVerifyAddressResponse = {
  streetNumber: number;
  street: Boolean;
  city: Boolean;
  region: Boolean;
  postalCode: Boolean;
  distance: number;
  addressScore: number;
};
interface KnowYourCustomer {
  TotalHits: number;
  AmlTypeLists?: AmlTypeList[];
}

interface AmlTypeList {
  AmlType: string;
  ListHits: number;
  Fields: Field[];
}

interface Field {
  Source: string;
  Name: string;
  Value: string;
}

interface Identifiers {
  dob: boolean;
  last4: boolean;
}

interface Name {
  firstName: number;
  lastName: number;
  nameScore: number;
}

export type ProveInstantLinkResponse = {
  RequestId: string;
  Status: number;
  Description: string;
  Response: InstantLinkResponse;
};

export type InstantLinkResponse = {
  PhoneMatch: 'true' | 'false' | 'indeterminate';
  IpAddressMatch: boolean;
  LinkClicked: boolean;
  PhoneNumber: string;
  TransactionId: string;
  Carrier: string;
  LineType: 'Mobile' | 'Landline' | 'FixedVoIP' | 'NonFixedVoIP';
  CountryCode: string;
};

export type InstantLinkResult = InstantLinkResponse & {
  verified: boolean;
};

export type ProveAuthApiResponse = {
  status: number;
  description: string;
  requestId: string;
  response: AuthResponse;
};

type AuthResponse = {
  transactionId: string;
  payfoneAlias: string;
  phoneNumber: string;
  lineType: string;
  carrier: string;
  countryCode: string;
  statusIndex: string;
  isBaselined: string;
  trustScore: number;
  reasonCodes: string[];
  carrierStatus: string;
  phoneNumberVelocity: number;
  portVelocity: number;
  simVelocity: number;
  deviceVelocity: number;
  payfoneTenure: PayfoneTenure;
  carrierTenure: PayfoneTenure;
  phoneNumberTenure: PayfoneTenure;
  simTenure: PayfoneTenure;
  deviceTenure: PayfoneTenure;
  portedDate: PayfoneTenure;
};

export type ProveAuthByRedirectApiResponse = {
  Status: number;
  Description: string;
  RequestId: string;
  Response: ProveAuthByRedirectResponse;
};

type ProveAuthByRedirectResponse = {
  AuthenticateTransactionId: string;
  RedirectTargetUrl: string;
};

export type ProveAuthByRedirectFinishApiResponse = {
  Status: number;
  Response: ProveAuthByRedirectFinishResponse;
};

type ProveAuthByRedirectFinishResponse = {
  PayfoneAlias: string;
  MobileNumber: string;
};

export type AuthByRedirectResponse = {
  redirectUrl?: string;
};

export type AuthByRedirectFinishResponse = {
  mobileNumber: string;
  payfoneAlias: string;
  Description: string;
  RequestId: string;
  Response: Response;
  Status: number;
};

interface Response {
  AuthenticateFinishTransactionId: string;
  PayfoneAlias: string;
  AuthenticationCode: string;
  AuthenticationExpiration: string;
  MobileNumber: string;
  MobileCountryCode: string;
  MobileOperatorName: string;
}

type PayfoneTenure = {
  minimumDate: string;
  maximumDate: string;
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
  MobileOperatorName: string;
  redirectUrl?: string;
};

export type ProveSendSMSResponse = {
  clientId: string;
  clientContext: string;
  app: string;
  ewSID: string;
  replyTo: string;
  timestampISO8601: string;
  statusCode: string;
  statusText: string;
};

export type ProveVerifyIdentityResponse = {
  verified: boolean;
  proveResult: VerifyIdentityResponse | null;
  failedAmlCheck?: boolean;
  status?: number;
  errorReasons?: string[];
};

export interface ProvePrefillResponse {
  description: string;
  requestId: string;
  response: PrefillResponse;
  status: number;
}

interface PrefillResponse {
  transactionId: string;
  phoneNumber: string;
  lineType: string;
  carrier: string;
  countryCode: string;
  individual: PrefillIndividual;
}

interface PrefillIndividual {
  firstName: string;
  lastName: string;
  addresses: PrefillAddress[];
  emailAddresses: string[];
  dob: string;
  ssn: string;
}

interface PrefillAddress {
  address: string;
  extendedAddress?: string;
  city: string;
  region: string;
  postalCode: string;
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

export type EligibilityResponse = {
  requestId: string;
  status: number;
  description: string;
  response: Response;
};

interface Response {
  transactionId: string;
  phoneNumber: string;
  carrier: string;
  lineType: string;
  countryCode: string;
  eligibility: boolean;
  payfoneAlias?: string;
}
