import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TokenExpiredError } from 'jsonwebtoken';
import { JWT } from '@src/helpers/jwt.helper';
import { getRecords } from '@src/data-repositories/prefill.repository';

type RecordIdentifier = {
  userId?: string;
  sessionId?: string;
  userAuthGuid?: string;
};

class RecordNotFoundError extends Error {
  constructor(message: string = 'RecordNotFound') {
    super(message);
    this.name = 'RecordNotFoundError';
  }
}

function handleTokenError(error: Error, res: Response) {
  if (error instanceof TokenExpiredError) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ error: 'TokenExpiredError' });
  } else {
    console.error(error); 
    return res.status(StatusCodes.FORBIDDEN).json({ error: error.message });
  }
}

async function processPrefillResult(req: Request, identifier: RecordIdentifier) {
  const prefillResult = await getRecords(identifier);
  if (!prefillResult) throw new RecordNotFoundError();

  const prefillRecord = prefillResult.prefillRecord;
  if (!prefillRecord?.id) throw new RecordNotFoundError();

  req.prefillRecordId = prefillRecord.id;
  req.isMobile = prefillRecord.is_mobile || false;
  req.prefillRecord = prefillRecord;
  req.requestDetail = prefillResult.requestDetail;
  req.responseDetails = prefillResult.responseDetails;
}

export async function validateJWTMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'AccessTokenMissing' });
  }

  try {
    const payload = JWT.validateToken(accessToken);
    if (!payload) throw new Error('InvalidTokenPayload');

    await processPrefillResult(req, { 
      userId: payload.sub, 
      sessionId: payload.jti 
    });
    next();
  } catch (error: any) {
    handleTokenError(error, res);
  }
}

export async function validateUserAuthGuid(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userAuthGuid = req.query.userAuthGuid as string;
  if (!userAuthGuid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'UserAuthGuidMissing' });
  }

  try {
    await processPrefillResult(req, { userAuthGuid });
    next();
  } catch (error: any) {
    handleTokenError(error, res);
  }
}