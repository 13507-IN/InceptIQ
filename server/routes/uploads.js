const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { isCloudinaryConfigured, uploadBuffer } = require('../services/cloudinaryService');

const router = express.Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type. Please upload a PNG, JPG, WEBP, or SVG.'));
    }
    return cb(null, true);
  }
});

router.post('/images', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary is not configured',
        message: 'Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
      });
    }

    const logoFile = req.files?.logo?.[0];
    const coverFile = req.files?.cover?.[0];

    if (!logoFile && !coverFile) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
        message: 'Please attach a logo or cover image.'
      });
    }

    const result = {};

    if (logoFile) {
      const uploadResult = await uploadBuffer(logoFile.buffer, {
        folder: 'inceptiq/analysis',
        public_id: `logo-${uuidv4()}`,
        overwrite: false
      });
      result.logoUrl = uploadResult.secure_url;
    }

    if (coverFile) {
      const uploadResult = await uploadBuffer(coverFile.buffer, {
        folder: 'inceptiq/analysis',
        public_id: `cover-${uuidv4()}`,
        overwrite: false
      });
      result.coverImageUrl = uploadResult.secure_url;
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Image upload failed',
      message: error.message
    });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: 'Upload error',
      message: err.message
    });
  }

  if (err && err.message && err.message.includes('Unsupported file type')) {
    return res.status(400).json({
      success: false,
      error: 'Upload error',
      message: err.message
    });
  }

  return next(err);
});

module.exports = router;
