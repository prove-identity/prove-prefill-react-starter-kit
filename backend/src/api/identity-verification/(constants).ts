export interface CreateRecordsParams {
  userId: string;
  sessionId: string;
  isMobile?: boolean; 
}

export interface GetRecordsParams {
  phoneNumber: string;
  sourceIP: string;
  id: number;
}