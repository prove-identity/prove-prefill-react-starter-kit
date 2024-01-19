import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TokenExpiredError } from 'jsonwebtoken';
import { JWT } from '@src/helpers/jwt.helper';
import { getRecords } from '@src/data-repositories/prefill.repository';

function handleTokenError(error: Error, res: Response) {
  if (error instanceof TokenExpiredError) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ error: 'TokenExpiredError' });
  } else {
    console.error(error); // Consider what to log in production
    return res.status(StatusCodes.FORBIDDEN).json({ error: error.message });
  }
}

export async function validateJWTMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'AccessTokenMissing' });
  }
  
  try {
    const payload = JWT.validateToken(accessToken);
    if (!payload) throw new Error('InvalidTokenPayload');
    
    const { prefillRecord } = await getRecords({
      userId: payload.sub,
      sessionId: payload.jti,
    });
    
    if (!prefillRecord.id) throw new Error('RecordNotFound');
    req.prefillRecordId = prefillRecord.id;
    next();
  } catch (error: any) {
    handleTokenError(error, res);
  }
}

export async function validateUserAuthGuid(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userAuthGuid = req.query.userAuthGuid as string;
  if (!userAuthGuid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'UserAuthGuidMissing' });
  }

  try {
    const { prefillRecord } = await getRecords({ userAuthGuid });
    
    if (!prefillRecord.id) throw new Error('RecordNotFound');
    req.prefillRecordId = prefillRecord.id;
    next();
  } catch (error: any) {
    handleTokenError(error, res);
  }
}
