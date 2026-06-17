import multer from 'multer';
import path from 'path';
import { Rider } from '../models/index.js';

// Configure Multer for local uploads (mocking S3 for now)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Requires an "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Upload a KYC Document
 */
export const uploadKYCDocument = async (req, res) => {
  try {
    const { documentType } = req.body;
    const riderId = req.user?.id; // Assuming auth middleware sets req.user

    if (!req.file) {
      return res.status(400).json({ error: 'Document file is required' });
    }

    if (!['license', 'id_card', 'insurance'].includes(documentType)) {
      return res.status(400).json({ error: 'Invalid documentType' });
    }

    if (!riderId) {
      // In a real app, you'd look up the rider by ID. For testing:
      return res.status(400).json({ error: 'Rider ID missing from token' });
    }

    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    // Mock updating the DB flag
    if (documentType === 'license') rider.isLicenseValid = true;
    if (documentType === 'id_card') rider.isIdentityVerified = true;
    if (documentType === 'insurance') rider.hasInsurance = true;

    await rider.save();

    return res.status(200).json({
      message: `${documentType} uploaded and verified successfully`,
      fileUrl: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('KYC Upload Error:', error);
    res.status(500).json({ error: 'Failed to process document upload' });
  }
};
