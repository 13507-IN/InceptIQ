const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middleware/auth');
const requireAuth = require('../middleware/requireAuth');

router.get('/', communityController.listPosts);

router.get('/weekly-spotlight', communityController.getWeeklySpotlight);

router.post('/matches', requireAuth, communityController.matchFounders);

router.post('/', authMiddleware, communityController.createPost);

router.post('/publish/:id', communityController.publishFromAnalysis);

router.post('/:id/interest', requireAuth, communityController.expressInterest);

router.post('/:id/vote', authMiddleware, communityController.voteOnPost);

router.delete('/:id', authMiddleware, communityController.deletePost);

module.exports = router;
