import express from 'express';
import { upload, uploadKYCDocument } from '../controllers/kycController.js';

const router = express.Router();

// Middleware placeholder for Authentication
// import { verifyToken } from '../middleware/auth.js';

// Route for uploading a KYC document
router.post('/upload', upload.single('document'), uploadKYCDocument);

export default router;
