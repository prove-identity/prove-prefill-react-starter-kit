import { Router } from 'express';
import { getEchoEndpoint } from '@src/api/identity-verification/identity-verification.controller';
const router = Router({ mergeParams: true });

router.get('/echo', getEchoEndpoint);

export default router;
