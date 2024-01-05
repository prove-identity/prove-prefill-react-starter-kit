import { getRecords } from '@src/data-repositories/prefill.repository';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TokenExpiredError } from 'jsonwebtoken';
import { JWT } from '@src/helpers/jwt.helper';

export async function validateJWTMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { authorization: accessToken } = req.headers;
  try {
    // Validate the ID token
    const payload = JWT.validateToken(accessToken as string);
    if (!payload) throw new Error();
    const { prefillRecord } = await getRecords({
      userId: payload.userId,
      sessionId: payload.sub,
    });
    if (!prefillRecord.id) throw new Error();
    req.prefillRecordId = prefillRecord.id;
    next();
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: 'TokenExpiredError' });
    } else {
      // Token validation failed
      console.log(error);
      return res.status(StatusCodes.FORBIDDEN).json({ error: error.message });
    }
  }
}

export async function validateUserAuthGuid(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userAuthGuid } = req.query;
     if (!userAuthGuid) throw new Error();
    const { prefillRecord } = await getRecords({
      userAuthGuid: userAuthGuid as string
    });
    if (!prefillRecord.id) throw new Error();
    req.prefillRecordId = prefillRecord.id;
    next();
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: 'TokenExpiredError' });
    } else {
      // Token validation failed
      console.log(error);
      return res.status(StatusCodes.FORBIDDEN).json({ error: error.message });
    }
  }
}

