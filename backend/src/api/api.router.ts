//package import
import { Router } from 'express';
//module import
import identityVerifyRouter from '@src/api/identity-verification/index';

const router = Router({ mergeParams: true });

router.use('/identity-verification', identityVerifyRouter);

export default router;
