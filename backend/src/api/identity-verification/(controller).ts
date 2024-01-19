//package import
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
//module import
import { asyncMiddleware } from '@src/api/api.middleware';
import {
  validatePhoneNumber,
  validateSourceIP,
} from '@src/lib/validators/common-validators';
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
  async (req: Request, res: Response, _next: NextFunction, _err: any) => {
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
  async (req: Request, res: Response, _next: NextFunction, _err: any) => {
    try {
      const { userId, sessionId, isMobile = false } = req.body;
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
        isMobile,
      };
      const result = await createInitialPrefillRecords(prefillParams);
      console.log('result is: ', result);

      if (!result) {
        throw new Error('invalid config');
      }
      const accessToken = JWT.sign({ subject: sessionId }, { userId });

      return res.status(StatusCodes.OK)
        .json({
          token_type: 'Bearer',
          access_token: accessToken,
        });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);

export const postAuthUrl = asyncMiddleware(
  async (req: Request, res: Response, _next: NextFunction, _err: any) => {
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
  async ({
    query: { vfp = '', userAuthGuid = '' },
    prefillRecordId
  }: Request, res: Response, _next: NextFunction, _err: any) => {
    try {
      // Checking if vfp or userAuthGuid is empty or undefined
      if (!vfp || !userAuthGuid) {
        throw new Error('Both vfp and userAuthGuid are required.');
      }

      const prefillResult: any = await getRecords({ id: prefillRecordId });
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
  async ({
    prefillRecordId
  }: Request, res: Response, _next: NextFunction, _err: any) => {
    try {
      const { prefillRecord } = await getRecords({
        id: prefillRecordId,
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
  async ({
    prefillRecordId
  }: Request, res: Response, next: NextFunction, _err: any) => {
    try {
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
      return res.status(StatusCodes.OK).json({
        message: 'ok',
        verified: true,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.OK).json({
        message: 'ok',
        verified: false,
      });
    }
  },
);

export const getIdentity = asyncMiddleware(
  async ({ prefillRecordId, body: { last4 = '', dob = '' } }: Request, res: Response) => {
    if (!dob) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Date of birth is required.' });
    }

    try {
      const prefillResult = await getRecords({ id: prefillRecordId });

      if (!prefillResult || !prefillResult.prefillRecord) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Prefill record not found.' });
      }

      const { trust_score: trustScore }: any = prefillResult?.responseDetails?.payload?.success_trust_response;
      if (!trustScore) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ error: 'Eligibility check is required.' });
      }

      const ownerOrchestrator = new OwnershipOrchestratorService(prefillResult.prefillRecord.id);
      await ownerOrchestrator.execute({ last4, dob });

      const { success_identity_response: successIdentityResponse } = prefillResult.responseDetails.payload;
      const responseObject = {
        message: 'ok',
        verified: true,
        manualEntryRequired: !successIdentityResponse,
        prefillData: successIdentityResponse || null,
      };

      return res.status(StatusCodes.OK).json(responseObject);
    } catch (error) {
      console.error(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'ok',
        verified: false,
        manualEntryRequired: false,
        prefillData: null,
      });
    }
  },
);

export const confirmIdentity = asyncMiddleware(
  async ({
    prefillRecordId,
    body: {
      firstName,
      lastName,
      dob,
      last4,
      city,
      address,
      region,
      postalCode,
    }
  }: Request, res: Response, _next: NextFunction, _err: any) => {
    try {
      const prefillResult: any = await getRecords({ id: prefillRecordId });
      if (prefillResult && prefillResult.prefillRecord) {
        const ownerOrchestrator = new OwnershipOrchestratorService(
          prefillResult.prefillRecord.id,
        );
        const proveResult: boolean = await ownerOrchestrator.finalize(
          {
            first_name: firstName,
            last_name: lastName,
            dob,
            last4,
            city,
            address,
            region,
            postal_code: postalCode,
          }
        );
        if (proveResult) {
          console.log('OwnershipOrchestratorService successfully run.');
          return res.status(StatusCodes.OK).json({
            message: 'ok',
            verified: true,
          });
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
