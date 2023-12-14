//package import
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
//module import
import { asyncMiddleware } from '@src/api/api.middleware';
import { createInitialPrefillRecords } from '@src/decorators/prefill.decorator';

export const getEchoEndpoint = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction, err: any) => {
    try {
      const prefillParams: any = {
        callbackUrl: 'YOUR_CALLBACK_URL',
        stateCounter: 1,
        state: 'YOUR_STATE',
        partnerId: 1, // Replace with the actual partner ID
        requestId: 'YOUR_REQUEST_ID',
        sessionId: 'YOUR_SESSION_ID',
        mobileNumber: 'YOUR_MOBILE_NUMBER',
        aasmState: 'YOUR_AASM_STATE',
        parentState: 'YOUR_PARENT_STATE',
      };
      const result = await createInitialPrefillRecords(prefillParams);
      console.log(result);
      // After this we need to call Posession Orchestrator Service
      // we should pass the Id of the prefill record
      // Posession Orchestrator Service will call the services Internally and update the prefill record
      return res.status(StatusCodes.OK).json({
        message: 'ok',
        success: true,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);
