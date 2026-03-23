const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const requireAuth = require('../middleware/requireAuth');

// POST /api/share - Create a shareable link for an analysis (requires auth)
router.post('/', requireAuth, shareController.createShareLink);

// GET /api/share/:token - Get analysis data via share token (public, no auth)
router.get('/:token', shareController.getSharedAnalysis);

module.exports = router;
