// import libraries
import { v4 as uuidv4 } from 'uuid';
// import modules
import PrefillWithoutMnoConsent from '@src/models/PrefillWithoutMnoConsent';
import RequestDetail from '@src/models/RequestDetail';
import ResponseDetail from '@src/models/ResponseDetail';
import { CreateRecordsParams } from '@src/api/identity-verification/(constants)';

interface PrefillColatedRecord {
  prefillRecord: PrefillWithoutMnoConsent;
  requestDetail: RequestDetail;
  responseDetails: ResponseDetail;
}
export async function createInitialPrefillRecords(
  params: CreateRecordsParams,
): Promise<any> {
  try {
    const { phoneNumber, sourceIP } = params;
    // Create PrefillWithoutMnoConsent record
    const prefillRecord = await PrefillWithoutMnoConsent.create({
      state_counter: 1,
      state: 'initial',
    });
    const sessionId: string = generateSessionId();

    // Create RequestDetail record associated with PrefillWithoutMnoConsent
    const requestDetailRecord = await RequestDetail.create(
      {
        request_id: generateRequestId(sessionId),
        session_id: sessionId,
        payload: {
          MobileNumber: phoneNumber,
          SourceIp: sourceIP,
        },
        prefill_without_mno_consent_id: prefillRecord.id,
        state: 'initial',
      },
      {
        validate: false,
      },
    );

    const responseDetailRecord = await ResponseDetail.create({
      payload: {},
      parent_state: 'initial',
      prefill_without_mno_consent_id: prefillRecord.id,
    });

    console.log('Records created successfully!');
    return { prefillRecordId: prefillRecord.id };
  } catch (error) {
    console.error('Error creating records:', error);
    throw new Error('Error creating records');
  }
}

export async function getRecords(id: number): Promise<PrefillColatedRecord> {
  try {
    const prefillRecord = await PrefillWithoutMnoConsent.findOne({
      where: { id: id },
    });
    const requestDetailRecord = await RequestDetail.findOne({
      where: { prefill_without_mno_consent_id: prefillRecord?.id },
    });
    const responseDetailRecord = await ResponseDetail.findOne({
      where: { prefill_without_mno_consent_id: prefillRecord?.id },
    });
    if (!prefillRecord || !requestDetailRecord || !responseDetailRecord) {
      throw new Error('Could not find records.');
    }
    const mergedRecord: any = {
      prefillRecord: prefillRecord,
      requestDetail: requestDetailRecord,
      responseDetails: responseDetailRecord,
    };
    return mergedRecord;
  } catch (error: any) {
    console.error('Error getting records:', error);
    return error;
  }
}

const generateSessionId = (): string => {
  return uuidv4();
};

const generateRequestId = (sessionId: string): string => {
  return `session-${sessionId}-request-${uuidv4()}`;
};

// Example usage with parameters
// const params: CreateRecordsParams = {
//   phoneNumber: 'YOUR_MOBILE_NUMBER',
//   sourceIP: "YOUR_SOURCE_IP",
// };
//
// // Call the function with provided parameters
// createRecords(params);
