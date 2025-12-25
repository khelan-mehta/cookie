import { Router } from 'express';
import { analyzeDistress, getGuidance } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { aiRateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/analyze-distress', authenticate, aiRateLimit, analyzeDistress);
router.post('/guidance', authenticate, aiRateLimit, getGuidance);

export default router;
