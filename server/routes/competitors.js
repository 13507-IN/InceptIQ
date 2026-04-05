const express = require('express');
const router = express.Router();
const competitorController = require('../controllers/competitorController');
const requireAuth = require('../middleware/requireAuth');

router.get('/', requireAuth, competitorController.listCompetitors);
router.post('/', requireAuth, competitorController.addCompetitor);
router.delete('/:id', requireAuth, competitorController.deleteCompetitor);
router.post('/:id/report', requireAuth, competitorController.generateReport);

module.exports = router;
