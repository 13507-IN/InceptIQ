const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/community - List community posts
router.get('/', communityController.listPosts);

// POST /api/community - Publish idea from form data
router.post('/',authMiddleware, communityController.createPost);

// POST /api/community/publish/:id - Publish idea from analysis
router.post('/publish/:id', communityController.publishFromAnalysis);

module.exports = router;
