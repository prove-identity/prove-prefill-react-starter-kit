import { v4 as uuidv4 } from 'uuid';
import PrefillWithoutMnoConsent from '@src/models/prefill-without-mno-consent';
import RequestDetail from '@src/models/request-detail';
import ResponseDetail from '@src/models/response-detail';
import { CreateRecordsParams, GetRecordsParams } from '@src/api/identity-verification/(constants)';
import { AuthState } from '@src/integrations/prove/(constants)';

export interface PrefillColatedRecord {
  prefillRecord: PrefillWithoutMnoConsent;
  requestDetail: RequestDetail;
  responseDetails: ResponseDetail;
}

export async function createInitialPrefillRecords(
  params: CreateRecordsParams
): Promise<{ prefillRecordId: number }> {
  try {
    const { userId, sessionId, isMobile = false, } = params;

    const prefillRecord = await createPrefillRecord(userId, sessionId, isMobile);
    await createRequestDetailRecord(prefillRecord);
    await createResponseDetailRecord(prefillRecord);

    console.log('Records created successfully!');
    return { prefillRecordId: prefillRecord.id };
  } catch (error: any) {
    console.error('Error creating records:', error.message);
    throw new Error('Error creating records');
  }
}

async function createPrefillRecord(userId: string, sessionId: string, isMobile: boolean = false): Promise<PrefillWithoutMnoConsent> {
  const [prefillRecord] = await PrefillWithoutMnoConsent.findOrCreate({
    where: {
      session_id: sessionId,
      user_id: userId,
      is_mobile: isMobile,
    },
    //@ts-ignore
    defaults: {
      state_counter: 1,
      state: AuthState.INITIAL,
    },
  });
  return prefillRecord;
}

async function createRequestDetailRecord(prefillRecord: PrefillWithoutMnoConsent): Promise<RequestDetail> {
  const requestId: string = generateRequestId(prefillRecord.session_id as string);
  const [requestDetailRecord] = await RequestDetail.findOrCreate({
    where: {
      prefill_without_mno_consent_id: prefillRecord.id,
    },
    defaults: {
      request_id: requestId,
      prefill_without_mno_consent_id: prefillRecord.id,
      state: AuthState.INITIAL,
    },
  });
  return requestDetailRecord;
}

async function createResponseDetailRecord(prefillRecord: PrefillWithoutMnoConsent): Promise<ResponseDetail> {
  const [responseDetailRecord] = await ResponseDetail.findOrCreate({
    where: {
      prefill_without_mno_consent_id: prefillRecord.id,
    },
    defaults: {
      payload: {},
      parent_state: AuthState.INITIAL,
      prefill_without_mno_consent_id: prefillRecord.id,
    },
  });
  return responseDetailRecord;
}

export async function updateInitialPrefillRecords(
  params: GetRecordsParams
): Promise<{ prefillRecordId: number | null }> {
  try {
    const { phoneNumber, sourceIP, id } = params;

    const prefillRecord = await PrefillWithoutMnoConsent.findOne({
      where: {
        id,
      },
    });

    if (prefillRecord) {
      await updatePrefillAndRequestDetails(prefillRecord.id, phoneNumber, sourceIP);

      console.log('Records updated successfully!');
    }
    return { prefillRecordId: prefillRecord?.id || null };
  } catch (error: any) {
    console.error('Error updating records:', error.message);
    throw new Error('Error updating records');
  }
}

// Function to update PrefillWithoutMnoConsent and RequestDetail records
async function updatePrefillAndRequestDetails(
  prefillRecordId: number,
  phoneNumber: string,
  sourceIP: string
) {
  const requestDetailRecord = await RequestDetail.findOne({
    where: {
      prefill_without_mno_consent_id: prefillRecordId,
    },
  });

  if (requestDetailRecord) {
    requestDetailRecord.payload = {
      MobileNumber: phoneNumber,
      SourceIp: sourceIP,
    };
    await requestDetailRecord.save();
  }
}

// Function to retrieve PrefillWithoutMnoConsent, RequestDetail, and ResponseDetail records
async function retrievePrefillRecords({ id, userId, userAuthGuid, sessionId }: { id?: number, userAuthGuid?: string; userId?: string, sessionId?: string }): Promise<PrefillColatedRecord> {
  const options: any = {};
  if(id) options.id = id; 
  else if(userAuthGuid) options.user_auth_guid = userAuthGuid; 
  else {
    options.user_id = userId; 
    options.session_id = sessionId; 
  }
  const prefillRecord = await PrefillWithoutMnoConsent.findOne({
    where: { ...options },
  });

  if (!prefillRecord) {
    throw new Error('Could not find records.');
  }

  const requestDetailRecord = await RequestDetail.findOne({
    where: { prefill_without_mno_consent_id: prefillRecord.id },
  });

  const responseDetailRecord = await ResponseDetail.findOne({
    where: { prefill_without_mno_consent_id: prefillRecord.id },
  });

  if (!requestDetailRecord || !responseDetailRecord) {
    throw new Error('Could not find related records.');
  }

  return {
    prefillRecord: prefillRecord,
    requestDetail: requestDetailRecord,
    responseDetails: responseDetailRecord,
  };
}

export async function getRecords({ id, userAuthGuid, userId, sessionId }: { id?: number, userAuthGuid?: string; userId?: string, sessionId?: string }): Promise<PrefillColatedRecord> {
  try {
    return retrievePrefillRecords({ id, userAuthGuid, userId, sessionId});
  } catch (error: any) {
    console.error('Error getting records:', error.message);
    throw new Error('Error getting records');
  }
}

const generateRequestId = (sessionId: string): string => {
  return `session-${sessionId}-request-${uuidv4()}`;
};
