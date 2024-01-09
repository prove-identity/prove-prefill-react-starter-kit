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
  updateInitialPrefillRecords,
} from '@src/data-repositories/prefill.repository';
import PossessionOrchestratorService from '@src/services/possesion/possesion-orchestrator.service';
import ReputationOrchestratorService from '@src/services/reputation/reputation-orchestrator.service';
import OwnershipOrchestratorService from '@src/services/ownership/ownership-orchestrator.service';
import { CreateRecordsParams, GetRecordsParams } from './(constants)';
import { JWT } from '@src/helpers/jwt.helper';

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

export const createInitialPrefillToken = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction, err: any) => {
    try {
      const { userId, sessionId } = req.body;
      // Validate phoneNumber and sourceIP
      if (!userId || !sessionId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'userId and sessionId are required.',
        });
      }

      // Create prefill records
      const prefillParams: CreateRecordsParams = {
        userId: userId as string,
        sessionId: sessionId as string,
      };
      const result = await createInitialPrefillRecords(prefillParams);
      console.log('result is: ', result);

      if (!result) {
        throw new Error('invalid config');
      }
      const accessToken = JWT.sign({ subject: sessionId }, { userId });

      return res.status(StatusCodes.OK).json({
        access_token: accessToken,
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
      if (!phoneNumber) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Phone number is required.',
        });
      }

      const isPhoneNumberValid = validatePhoneNumber(phoneNumber);
      const isSourceIPValid = validateSourceIP(sourceIP || '127.0.0.1');

      if (!isPhoneNumberValid || !isSourceIPValid) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Invalid phone number or source IP.',
        });
      }

      // Update prefill records
      const prefillParams: GetRecordsParams = {
        phoneNumber: phoneNumber,
        sourceIP: sourceIP,
        id: req.prefillRecordId,
      };
      await updateInitialPrefillRecords(prefillParams);

      const prefillOrchestrator = new PossessionOrchestratorService(
        req.prefillRecordId,
      );
      await prefillOrchestrator.execute();
      console.log('PrefillOrchestrator executed successfully.');

      return res.status(StatusCodes.OK).json({
        message: 'ok',
        verified: true,
        redirectUrl: '',
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);

export const verifyInstantLink = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction, err: any) => {
    try {
      const { vfp, userAuthGuid } = req.query;
      // Checking if vfp or userAuthGuid is empty or undefined
      if (!vfp || !userAuthGuid) {
        throw new Error('Both vfp and userAuthGuid are required.');
      }

      const prefillResult: any = await getRecords({ id: req.prefillRecordId });
      if (prefillResult && prefillResult.prefillRecord) {
        const prefillOrchestrator = new PossessionOrchestratorService(
          prefillResult.prefillRecord.id,
        );
        await prefillOrchestrator.finalize(vfp as string);
        console.log('PrefillOrchestrator finalized successfully.');
      } else {
        console.error('PrefillOrchestrator failed.');
        throw new Error('PrefillOrchestrator failed.');
      }

      return res.status(StatusCodes.OK).json({
        message: 'ok',
        verified: true,
        redirectUrl: '',
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);

export const getVerifyStatus = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction, err: any) => {
    try {
      const { prefillRecord } = await getRecords({
        id: req.prefillRecordId,
      });
      const { state } = prefillRecord;
      return res.status(StatusCodes.OK).json({ state });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);

export const checkEligibility = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction, err: any) => {
    try {
      const prefillRecordId: any = req.prefillRecordId;
      if (!prefillRecordId) {
        throw new Error('prefill record id is required.');
      }

      const prefillResult: any = await getRecords({ id: prefillRecordId });
      if (prefillResult && prefillResult.prefillRecord) {
        console.log('Prefill record found.', prefillResult.prefillRecord);
        const reputationOrchestrator = new ReputationOrchestratorService(
          prefillResult.prefillRecord.id,
        );
        const result = await reputationOrchestrator.execute();
        if (result) {
          console.log('Reputation Orchestrator service successfully run!');
        } else {
          console.error('ReputationOrchestrator failed!');
          throw new Error('ReputationOrchestrator failed!');
        }
      } else {
        throw new Error('Prefill record not found!');
      }

      const responseObject = IdentityResponseBuilder.create()
        .setData({
          message: 'ok',
          verified: true,
        })
        .setName('Check Eligibility')
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

export const getIdentity = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction, err: any) => {
    try {
      const prefillRecordId: any = req.prefillRecordId;
      if (!prefillRecordId) {
        throw new Error('prefill record id is required.');
      }
      const prefillResult: any = await getRecords({ id: prefillRecordId });
      if (prefillResult && prefillResult.prefillRecord) {
        const trustScore =
          prefillResult.responseDetails.payload.success_trust_response
            .trust_score;
        if (!trustScore) {
          throw new Error('Eligibility Check is required.');
        }
        const ownerOrchestrator = new OwnershipOrchestratorService(
          prefillResult.prefillRecord.id,
        );
        await ownerOrchestrator.execute();
        console.log('OwnershipOrchestratorService successfully run.');
      } else {
        console.error('OwnershipOrchestratorService failed.');
        throw new Error('OwnershipOrchestratorService failed.');
      }
      const record: any = await getRecords({ id: prefillRecordId });
      let responseObject;
      if (!record.responseDetails.payload.success_identity_response) {
        responseObject = IdentityResponseBuilder.create()
          .setData({
            message: 'ok',
            verified: false,
            manualEntryRequired: true,
            prefillData: null,
          })
          .setName('Identity Verify')
          .setStatus(200)
          .setStatusText('OK')
          .setHeaders({})
          .setConfig({})
          .build();
      } else {
        responseObject = IdentityResponseBuilder.create()
          .setData({
            message: 'ok',
            verified: true,
            manualEntryRequired: false,
            prefillData:
              record.responseDetails.payload.success_identity_response,
          })
          .setName('Identity Verify')
          .setStatus(200)
          .setStatusText('OK')
          .setHeaders({})
          .setConfig({})
          .build();
      }
      return res.status(StatusCodes.OK).json(responseObject);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);

export const confirmIdentity = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction, err: any) => {
    try {
      const prefillRecordId: any = req.prefillRecordId;
      if (!prefillRecordId) {
        throw new Error('prefill record id is required.');
      }
      const prefillResult: any = await getRecords({ id: prefillRecordId });
      if (prefillResult && prefillResult.prefillRecord) {
        const ownerOrchestrator = new OwnershipOrchestratorService(
          prefillResult.prefillRecord.id,
        );
        const proveResult: boolean = await ownerOrchestrator.finalize(
          req.body.pii_data,
        );
        if (proveResult) {
          console.log('OwnershipOrchestratorService successfully run.');
          const responseObject = IdentityResponseBuilder.create()
            .setData({
              message: 'ok',
              verified: true,
            })
            .setName('Identity Confirmation')
            .setStatus(200)
            .setStatusText('OK')
            .setHeaders({})
            .setConfig({})
            .build();
          return res.status(StatusCodes.OK).json(responseObject);
        } else {
          throw new Error('OwnershipOrchestratorService failed.');
        }
      } else {
        console.error('OwnershipOrchestratorService failed.');
        throw new Error('OwnershipOrchestratorService failed.');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);
