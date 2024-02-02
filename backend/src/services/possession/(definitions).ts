export interface InstantLinkRunArgs {
  vfp: string;
}

export type SuccessSendSMSResponse = {
  status_code: string;
  status_text: string;
};

export type InstantLinkResponse = {
  phone_match: string;
  ip_address_match: boolean;
  link_clicked: boolean;
  phone_number: string;
  line_type: string;
  country_code: string;
};

export type SuccessInstantLinkResult = InstantLinkResponse & {
  verified: boolean;
};

export interface AuthUrlResponse {
  AuthenticationUrl: string;
  MobileOperatorName: string;
  redirectUrl?: string | undefined;
}

export interface GetAuthUrlRequestPayload {
  SourceIp: string;
  MobileNumber: string;
}