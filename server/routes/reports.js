const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// GET /api/reports/:id - Download PDF report for analysis
router.get('/:id', reportsController.downloadReport);

module.exports = router;
