//package import
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
//module import
import { asyncMiddleware } from '@src/api/api.middleware';
import {
  validatePhoneNumber,
  validateSourceIP,
} from '@src/lib/validators/common-validators';
import { IdentityResponseBuilder } from '@src/serializers/identity-verfication.serializer';
import {
  createInitialPrefillRecords,
  getRecords,
} from '@src/data-repositories/prefill.repository';
import PossessionOrchestratorService from '@src/services/possesion/possesion-orchestrator.service';
import { CreateRecordsParams } from './(constants)';
export const getEchoEndpoint = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction, err: any) => {
    try {
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

export const postAuthUrl = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction, err: any) => {
    try {
      const phoneNumber: string = req.body.phoneNumber;
      const sourceIP: string = req.body.sourceIP;

      // Validate phoneNumber and sourceIP
      if (!phoneNumber || !sourceIP) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Phone number and source IP are required.',
        });
      }

      const isPhoneNumberValid = validatePhoneNumber(phoneNumber);
      const isSourceIPValid = validateSourceIP(sourceIP);

      if (!isPhoneNumberValid || !isSourceIPValid) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Invalid phone number or source IP.',
        });
      }

      // Create prefill records
      const prefillParams: CreateRecordsParams = {
        phoneNumber: phoneNumber,
        sourceIP: sourceIP,
      };
      const result: any = await createInitialPrefillRecords(prefillParams);
      console.log('result is: ', result);

      const prefillResult: any = await getRecords(result.prefillRecordId);
      console.log('prefillResult: ', prefillResult);

      // Assuming createInitialPrefillRecords returns an object with prefillRecord
      if (prefillResult && prefillResult.prefillRecord) {
        const prefillOrchestrator = new PossessionOrchestratorService(
          prefillResult.prefillRecord.id,
        );
        await prefillOrchestrator.execute();
        console.log('PrefillOrchestrator executed successfully.');
      } else {
        console.error('PrefillOrchestrator failed.');
        throw new Error('PrefillOrchestrator failed.');
      }

      const responseObject = IdentityResponseBuilder.create()
        .setData({
          message: 'ok',
          verified: true,
          redirectUrl: '',
        })
        .setName('')
        .setStack('')
        .setStatus(200)
        .setStatusText('OK')
        .setHeaders({})
        .setConfig({})
        .build();

      return res.status(StatusCodes.OK).json(responseObject);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);

export const verifyInstantLink = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction, err: any) => {
    try {
      const { vfp, userAuthGuid } = req.params;
      const headerRequestId: any = req.headers['request-id'];
      // Checking if vfp or userAuthGuid is empty or undefined
      if (!vfp || !userAuthGuid || !headerRequestId) {
        throw new Error('Both vfp, request id and userAuthGuid are required.');
      }

      const requestId: number = headerRequestId.parseInt();
      const prefillResult: any = await getRecords(requestId);
      if (prefillResult && prefillResult.prefillRecord) {
        const prefillOrchestrator = new PossessionOrchestratorService(
          prefillResult.prefillRecord.id,
        );
        await prefillOrchestrator.finalize(vfp);
        console.log('PrefillOrchestrator finalized successfully.');
      } else {
        console.error('PrefillOrchestrator failed.');
        throw new Error('PrefillOrchestrator failed.');
      }
      const responseObject = IdentityResponseBuilder.create()
        .setData({
          message: 'ok',
          verified: true,
          redirectUrl: '',
        })
        .setName('')
        .setStack('')
        .setStatus(200)
        .setStatusText('OK')
        .setHeaders({})
        .setConfig({})
        .build();

      return res.status(StatusCodes.OK).json(responseObject);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);
