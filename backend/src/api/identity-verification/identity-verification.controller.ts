//package import
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
//module import
import { asyncMiddleware } from '@src/api/api.middleware';
import { ProveIdentity } from '@src/integrations/prove/prove';

export const getEchoEndpoint = asyncMiddleware(
    async (req: Request, res: Response, next: NextFunction, err: any) => {
        try {
            const proveIdentity = new ProveIdentity(); 
            const response = await proveIdentity.getEchoEndpoint(); 
            console.log(response);
            return res.status(StatusCodes.OK).json({
                message: "ok", 
                success: true
            });
        } catch (error) {
            console.log(error);
            throw error; 
        }
    },
);