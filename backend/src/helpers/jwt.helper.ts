import { Algorithm, JwtPayload, verify, sign } from 'jsonwebtoken';

export type InternalJwtPayload = {
  audience: string;
  issuer: string;
  algorithm: Algorithm;
  subject?: string;
};

export type BaseJwtPayload = {
  issuer: string;
  algorithm: Algorithm;
  audience: string;
};

export const BASE_JWT_PAYLOAD: BaseJwtPayload = {
  issuer: 'https://prove.com',
  algorithm: 'HS256',
  audience: 'prove/prefill',
};

// TODO: Replace with UUID
export const SECRET_KEY = process.env.PROVE_JWT_SECRET || '123456';

export class JWT {
  static validateToken(token: string): JwtPayload {
    const sanitizedToken: string = JWT.verifyAuthorizationFormat(token);
    const jwtPayload: InternalJwtPayload = BASE_JWT_PAYLOAD;
    return verify(sanitizedToken, SECRET_KEY, {
      ...jwtPayload,
      clockTolerance: 30, // Allow 30 seconds of clock-drift for jwt validation
    }) as JwtPayload;
  }

  static verifyAuthorizationFormat(accessToken: string): string {
    if (!accessToken || !accessToken.startsWith('Bearer ')) {
      throw new Error('Invalid format');
    }
    const token: string = accessToken.split('Bearer ')[1].trim();
    return token;
  }

  static sign(
    { subject, expiresIn = '1d' }: any,
    data: any,
    key: string = SECRET_KEY,
  ): string {
    const { issuer, algorithm }: BaseJwtPayload = BASE_JWT_PAYLOAD;
    return sign(data, key, {
      header: { alg: algorithm, typ: 'JWT' },
      ...BASE_JWT_PAYLOAD,
      issuer,
      algorithm,
      expiresIn,
      subject,
    });
  }
}
