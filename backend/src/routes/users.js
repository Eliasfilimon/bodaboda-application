import express from 'express';
import { getUser, updateUser, addPaymentMethod } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', getUser);
router.put('/:id', authenticate, updateUser);
router.post('/:id/payment-methods', authenticate, addPaymentMethod);

export default router;
