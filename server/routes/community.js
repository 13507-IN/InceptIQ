const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middleware/auth');
const requireAuth = require('../middleware/requireAuth');

// GET /api/community - List community posts
router.get('/', communityController.listPosts);

// POST /api/community/matches - Find similar founders for an idea
router.post('/matches', requireAuth, communityController.matchFounders);

// POST /api/community - Publish idea from form data
router.post('/',authMiddleware, communityController.createPost);

// POST /api/community/publish/:id - Publish idea from analysis
router.post('/publish/:id', communityController.publishFromAnalysis);

// POST /api/community/:id/vote - Vote on a community post
router.post('/:id/vote', authMiddleware, communityController.voteOnPost);

// DELETE /api/community/:id - Delete a community post (owner only)
router.delete('/:id', authMiddleware, communityController.deletePost);

module.exports = router;
