import { Router } from 'express';
import {
  getEchoEndpoint,
  postAuthUrl,
} from '@src/api/identity-verification/identity-verification.controller';
const router = Router({ mergeParams: true });

router.get('/echo', getEchoEndpoint);
router.post('/identity-check/auth-url', postAuthUrl);

export default router;
