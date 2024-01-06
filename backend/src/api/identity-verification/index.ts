import { Router } from 'express';
import {
  getEchoEndpoint,
  createInitialPrefillToken,
  postAuthUrl,
  verifyInstantLink,
  getVerifyStatus,
} from '@src/api/identity-verification/(controller)';
import { validateJWTMiddleware, validateUserAuthGuid } from './(middleware)';
const router = Router({ mergeParams: true });

router.get('/echo', getEchoEndpoint);
router.post('/identity-check/token', createInitialPrefillToken);
router.post('/identity-check/auth-url', validateJWTMiddleware, postAuthUrl);
router.get('/identity-check/instant-link', validateUserAuthGuid, verifyInstantLink);
router.get('/identity-check/verify-status', validateJWTMiddleware, getVerifyStatus);

export default router;
