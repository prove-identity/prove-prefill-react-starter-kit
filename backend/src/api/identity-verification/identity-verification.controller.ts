//package import
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
//module import
import { asyncMiddleware } from '@src/api/api.middleware';
import {
  createInitialPrefillRecords,
  getRecords,
} from '@src/data-repositories/prefill.repository';
import PossessionOrchestratorService from '@src/services/possesion/possesion-orchestrator.service';

export const getEchoEndpoint = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction, err: any) => {
    try {
      const prefillParams: any = {
        callbackUrl: 'http://www.google.com/',
        stateCounter: 1,
        state: 'initial',
        requestId: '7f83-b0c4-90e0-90b3-11e10800200c9a66',
        sessionId: '1234567890abcdef',
        mobileNumber: '+17203607324',
        parentState: 'initial',
        sourceIp: '2607:fb91:111f:9d15:858:feca:d107:62ce',
      };
      // const result = await createInitialPrefillRecords(prefillParams);
      // console.log(result);
      const prefillOrchestrator = new PossessionOrchestratorService(2);
      prefillOrchestrator.execute();
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
