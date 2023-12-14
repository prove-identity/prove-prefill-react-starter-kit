import PrefillWithoutMnoConsent from '@src/models/PrefillWithoutMnoConsent';
import RequestDetail from '@src/models/RequestDetail';
import ResponseDetail from '@src/models/ResponseDetail';

interface CreateRecordsParams {
  callbackUrl: string;
  stateCounter: number;
  state: string;
  partnerId: number;
  requestId: string;
  sessionId: string;
  mobileNumber: string;
  aasmState: string;
  parentState: string;
}

export async function createInitialPrefillRecords(
  params: CreateRecordsParams,
): Promise<void> {
  try {
    const {
      callbackUrl,
      stateCounter,
      state,
      partnerId,
      requestId,
      sessionId,
      mobileNumber,
      aasmState,
      parentState,
    } = params;
    const currentDate = new Date();

    // Create PrefillWithoutMnoConsent record
    const prefillRecord = await PrefillWithoutMnoConsent.create({
      callback_url: callbackUrl,
      state_counter: stateCounter,
      state,
      // partner_id: partnerId,
      created_at: currentDate,
      updated_at: currentDate,
    });

    // Create RequestDetail record associated with PrefillWithoutMnoConsent
    // const requestDetailRecord = await RequestDetail.create({
    //   request_id: requestId,
    //   session_id: sessionId,
    //   payload: {
    //     MobileNumber: mobileNumber,
    //   },
    //   prefill_without_mno_consent_id: prefillRecord.id,
    //   state: aasmState,
    //   created_at: currentDate,
    //   updated_at: currentDate,
    // });
    //
    // // Create ResponseDetail record associated with PrefillWithoutMnoConsent
    // const responseDetailRecord = await ResponseDetail.create({
    //   payload: {},
    //   parent_state: parentState,
    //   prefill_without_mno_consent_id: prefillRecord.id,
    //   created_at: currentDate,
    //   updated_at: currentDate,
    // });

    console.log('Records created successfully!');
  } catch (error) {
    console.error('Error creating records:', error);
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
