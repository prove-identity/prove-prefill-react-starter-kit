//package import
import { NextFunction, Request, Response, Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as helmet from 'helmet';
import { json, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
//module import

export const setGlobalMiddleware = (app: Express) => {
    app.use(function (req: Request, res: Response, next: NextFunction) {
        app.disable('x-powered-by');
        next();
    });
    app.use(json());
    app.use(urlencoded({ limit: '5mb', extended: true }));
    app.use(cookieParser());
    app.use(cors());
    app.use(helmet.contentSecurityPolicy());
    app.use(helmet.crossOriginEmbedderPolicy());
    app.use(helmet.crossOriginOpenerPolicy());
    app.use(helmet.crossOriginResourcePolicy());
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.frameguard());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.originAgentCluster());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());
};

export const asyncMiddleware =
    (fn: Function) =>
    (req: Request, res: Response, next: NextFunction): Promise<any> =>
        Promise.resolve(fn(req, res, next)).catch(next);

// error handler middleware
export function handleErrors(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (process.env.ERROR_TO_CONSOLE) {
        console.log(err);
    }
    if (err?.response?.data?.message) {
        //@ts-ignore
        err.message = err.response.data.message;
    } else {
        err.message = err.message || '';
    }
    return res
        .status(
            err?.status ||
                err?.cause?.status ||
                StatusCodes.INTERNAL_SERVER_ERROR,
        )
        .json({
            message: err.message,
            error_code:
                err.errorCode || err?.cause?.errorCode || err?.name || '',
        });
}
