const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const requireAuth = require('../middleware/requireAuth');
const validateAnalysisRequest = require('../middleware/validateAnalysisRequest');

// POST /api/analyze - Submit startup idea for analysis (standard, waits for full result)
router.post('/', requireAuth, validateAnalysisRequest, analysisController.analyzeIdea);

// POST /api/analyze/extract-pdf-fields - Extract form fields from PDF text using AI
// MUST be before /:id route to avoid being caught by wildcard
router.post('/extract-pdf-fields', requireAuth, analysisController.extractFormFieldsFromPdf);

// POST /api/analyze/stream - Submit startup idea for LIVE streaming analysis (SSE)
// Streams Gemini token chunks in real-time via Server-Sent Events.
// Must be before /:id wildcard.
router.post('/stream', requireAuth, validateAnalysisRequest, analysisController.analyzeIdeaStream);

// POST /api/analyze/:id/followup - Generate venture stage follow-up playbook & investor update
router.post('/:id/followup', requireAuth, analysisController.generateVentureFollowUp);

// DELETE /api/analyze/:id - Delete analysis from user's profile
router.delete('/:id', requireAuth, analysisController.deleteAnalysis);

// GET /api/analyze/:id - Get analysis result by ID
router.get('/:id', analysisController.getAnalysis);

module.exports = router;
