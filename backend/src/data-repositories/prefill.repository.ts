import PrefillWithoutMnoConsent from '@src/models/PrefillWithoutMnoConsent';
import RequestDetail from '@src/models/RequestDetail';
import ResponseDetail from '@src/models/ResponseDetail';

interface CreateRecordsParams {
  callbackUrl: string;
  stateCounter: number;
  state: string;
  requestId: string;
  sessionId: string;
  mobileNumber: string;
  parentState: string;
  sourceIp: string;
}

export async function createInitialPrefillRecords(
  params: CreateRecordsParams,
): Promise<void> {
  try {
    const {
      callbackUrl,
      stateCounter,
      state,
      requestId,
      sessionId,
      mobileNumber,
      parentState,
      sourceIp,
    } = params;
    // Create PrefillWithoutMnoConsent record
    const prefillRecord = await PrefillWithoutMnoConsent.create({
      callback_url: callbackUrl,
      state_counter: stateCounter,
      state,
    });

    // Create RequestDetail record associated with PrefillWithoutMnoConsent
    const requestDetailRecord = await RequestDetail.create(
      {
        request_id: requestId,
        session_id: sessionId,
        payload: {
          MobileNumber: mobileNumber,
          SourceIp: sourceIp,
        },
        prefill_without_mno_consent_id: prefillRecord.id,
        state: state,
      },
      {
        validate: false,
      },
    );

    const responseDetailRecord = await ResponseDetail.create({
      payload: {},
      parent_state: parentState,
      prefill_without_mno_consent_id: prefillRecord.id,
    });

    console.log('Records created successfully!');
  } catch (error) {
    console.error('Error creating records:', error);
  }
}

export async function getRecords(id: number) {
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
    const mergedRecord: any = {
      prefillRecord: prefillRecord,
      requestDetail: requestDetailRecord,
      responseDetails: responseDetailRecord,
    };
    return mergedRecord;
  } catch (error) {
    console.error('Error getting records:', error);
  }
}

// Example usage with parameters
// const params: CreateRecordsParams = {
//   callbackUrl: 'YOUR_CALLBACK_URL',
//   stateCounter: 1,
//   state: 'YOUR_STATE',
//   partnerId: 1, // Replace with the actual partner ID
//   requestId: 'YOUR_REQUEST_ID',
//   sessionId: 'YOUR_SESSION_ID',
//   mobileNumber: 'YOUR_MOBILE_NUMBER',
//   aasmState: 'YOUR_AASM_STATE',
//   parentState: 'YOUR_PARENT_STATE',
//   // Add other necessary params
// };
//
// // Call the function with provided parameters
// createRecords(params);
