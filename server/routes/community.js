const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

// GET /api/community - List community posts
router.get('/', communityController.listPosts);

// POST /api/community/publish/:id - Publish idea from analysis
router.post('/publish/:id', communityController.publishFromAnalysis);

module.exports = router;
