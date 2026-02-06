const express = require('express');
const router = express.Router();
const collaborationController = require('../controllers/collaborationController');

// GET /api/collaboration/:id - Get collaboration info for analysis
router.get('/:id', collaborationController.getCollaboration);

// POST /api/collaboration/:id/invite - Invite collaborators by email
router.post('/:id/invite', collaborationController.inviteCollaborators);

module.exports = router;
