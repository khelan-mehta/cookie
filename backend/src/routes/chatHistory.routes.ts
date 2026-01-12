import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getSimilarQueries,
  getChatHistory,
  addChatMessage,
} from '../controllers/chatHistory.controller';

const router = Router();

router.use(authMiddleware);

router.get('/similar', getSimilarQueries);
router.get('/', getChatHistory);
router.post('/', addChatMessage);

export default router;
