import express from 'express';
import {
  getRiders,
  getOnlineRiders,
  getRider,
  updateRiderStatus,
  updateRiderLocation,
} from '../controllers/riderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/',                authenticate,                    getRiders);
router.get('/online',                                           getOnlineRiders);
router.get('/:id',                                              getRider);
router.patch('/:id/status',    authenticate, authorize('rider'), updateRiderStatus);   // online / offline toggle
router.put('/:id/location',    authenticate, authorize('rider'), updateRiderLocation); // live GPS

export default router;
