export type SuccessTrustResponse = {
    verified?: boolean;
    transaction_id: string;
    payfone_alias: string;
    phone_number: string;
    line_type: string;
    carrier: string;
    country_code: string;
    status_index: string;
    is_baselined: boolean;
    trust_score: number;
    reason_codes: string[];
    carrier_status: string;
    phone_number_velocity: number;
    port_velocity: number;
    sim_velocity: number;
    device_velocity: number;
    payfone_tenure: PayfoneTenure;
    carrier_tenure: PayfoneTenure;
    phone_number_tenure: PayfoneTenure;
    sim_tenure: PayfoneTenure;
    device_tenure: PayfoneTenure;
    ported_date: PayfoneTenure;
  };
  
  type PayfoneTenure = {
    minimumDate: string;
    maximumDate?: string;
  };