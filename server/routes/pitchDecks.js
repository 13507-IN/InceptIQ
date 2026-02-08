const express = require('express');
const router = express.Router();
const pitchDeckController = require('../controllers/pitchDeckController');

// GET /api/pitch-decks/:id - Generate or download pitch deck
router.get('/:id', pitchDeckController.downloadDeck);

module.exports = router;
