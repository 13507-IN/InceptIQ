const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middleware/auth');

// GET /api/community - List community posts
router.get('/', communityController.listPosts);

// POST /api/community - Publish idea from form data
router.post('/',authMiddleware, communityController.createPost);

// POST /api/community/publish/:id - Publish idea from analysis
router.post('/publish/:id', communityController.publishFromAnalysis);

// POST /api/community/:id/vote - Vote on a community post
router.post('/:id/vote', authMiddleware, communityController.voteOnPost);

module.exports = router;
