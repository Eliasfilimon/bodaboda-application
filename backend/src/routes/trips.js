import express from 'express';
import { createTrip, getTrip, getUserTrips, getRiderTrips, acceptTrip, completeTrip, cancelTrip, rateTrip } from '../controllers/tripController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createTrip);
router.get('/user/:userId', authenticate, getUserTrips);
router.get('/rider/:riderId', getRiderTrips);
router.get('/:id', getTrip);
router.put('/:id/accept', authenticate, authorize('rider'), acceptTrip);
router.put('/:id/complete', authenticate, authorize('rider'), completeTrip);
router.put('/:id/cancel', authenticate, cancelTrip);
router.put('/:id/rate', authenticate, rateTrip);

export default router;
