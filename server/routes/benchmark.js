const express = require('express');
const router = express.Router();
const benchmarkController = require('../controllers/benchmarkController');
const requireAuth = require('../middleware/requireAuth');

router.get('/:industry', requireAuth, benchmarkController.getBenchmark);

module.exports = router;
