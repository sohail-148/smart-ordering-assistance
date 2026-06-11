import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';
import { validateChatMessage } from '../middleware/validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateChatMessage, ChatController.sendMessage);
router.get('/history', ChatController.getHistory);

export default router;
