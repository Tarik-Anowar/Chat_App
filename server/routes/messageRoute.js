import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { allMessages, broadcastMessage, getAllStatuses, sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.route('/').post(protect,sendMessage);
router.route('/poststatus').post(protect,broadcastMessage);
router.route('/allstatus').get(protect,getAllStatuses);
router.route('/:chatId').get(protect,allMessages);

export default router;