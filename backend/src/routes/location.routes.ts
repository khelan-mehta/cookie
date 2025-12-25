import { Router } from 'express';
import { updateLocation, updateVetLocation } from '../controllers/location.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/update', authenticate, updateLocation);
router.post('/vet-update', authenticate, requireRole('vet'), updateVetLocation);

export default router;
