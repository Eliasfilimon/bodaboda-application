import express from 'express';
import { getNotifications, markRead, markOneRead, deleteNotification } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.get('/', authenticate, getNotifications);
router.put('/read-all', authenticate, markRead);
router.put('/:id/read', authenticate, markOneRead);
router.delete('/:id', authenticate, deleteNotification);
export default router;
