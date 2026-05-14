import express from 'express';
import { getRiders, getOnlineRiders, getRider, updateRiderStatus, updateRiderLocation } from '../controllers/riderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getRiders);
router.get('/online', getOnlineRiders);
router.get('/:id', getRider);
router.put('/:id/status', authenticate, authorize('rider'), updateRiderStatus);
router.put('/:id/location', authenticate, authorize('rider'), updateRiderLocation);

export default router;
