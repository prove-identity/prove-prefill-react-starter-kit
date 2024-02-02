export type SuccessTrustResponse = {
    verified?: boolean;
    payfone_alias: string;
    phone_number: string;
    line_type: string;
    country_code: string;
    trust_score: number;
  };