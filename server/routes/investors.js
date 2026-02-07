const express = require('express');
const router = express.Router();
const investorController = require('../controllers/investorController');

// GET /api/investors - list investors (optional query filters)
router.get('/', investorController.list);

// POST /api/investors/match - match investors to startup criteria
router.post('/match', investorController.match);

module.exports = router;
