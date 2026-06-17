import express from 'express';
import { registerRider, loginRider, getRiderProfile } from '../controllers/riderAuthController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerRider);
router.post('/login', loginRider);
router.get('/profile', authenticate, authorize('rider'), getRiderProfile);

export default router;
