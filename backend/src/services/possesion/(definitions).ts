export interface InstantLinkRunArgs {
  vfp: string;
}

export type SuccessSendSMSResponse = {
    client_id: string;
    client_context: string;
    app: string;
    ew_sid: string;
    reply_to: string;
    timestamp_iso8601: string;
    status_code: string;
    status_text: string;
  };
  
  export type InstantLinkResponse = {
    phone_match: 'true' | 'false' | 'indeterminate';
    ip_address_match: boolean;
    link_clicked: boolean;
    phone_number: string;
    transaction_id: string;
    carrier: string;
    line_type: 'Mobile' | 'Landline' | 'FixedVoIP' | 'NonFixedVoIP';
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