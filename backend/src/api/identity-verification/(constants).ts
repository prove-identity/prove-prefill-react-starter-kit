export interface CreateRecordsParams {
  userId: string;
  sessionId: string;
}

export interface GetRecordsParams {
  phoneNumber: string;
  sourceIP: string;
  id: number;
}