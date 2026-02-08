const fs = require('fs');
const User = require('../models/user');
const pitchDeckService = require('../services/pitchDeckService');
const { analysisStorage } = require('../utils/storage');

const getAnalysisRecord = async (id, req) => {
  const analysis = analysisStorage.get(id);
  if (analysis) return { analysis, source: 'memory' };

  if (req?.user?.id) {
    const user = await User.findById(req.user.id).lean();
    if (user?.requests) {
      const request = user.requests.find((r) => r.id === id);
      if (request?.analysis) {
        return { analysis: request.analysis, source: 'database' };
      }
    }
  }

  return { analysis: null, source: 'none' };
};

const pitchDeckController = {
  async downloadDeck(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: 'Missing analysis ID',
          message: 'Analysis ID is required to generate a pitch deck'
        });
      }

      const { analysis } = await getAnalysisRecord(id, req);

      if (!analysis) {
        if (pitchDeckService.pitchDeckExists(id)) {
          const filePath = pitchDeckService.getPitchDeckPath(id);
          const fileStats = fs.statSync(filePath);
          res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          );
          res.setHeader('Content-Disposition', `attachment; filename="pitch-deck-${id}.pptx"`);
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Content-Length', fileStats.size);
          return fs.createReadStream(filePath).pipe(res);
        }

        return res.status(404).json({
          error: 'Analysis not found',
          message: `No analysis found with ID: ${id}`
        });
      }

      if (!pitchDeckService.pitchDeckExists(id)) {
        await pitchDeckService.generatePitchDeck(analysis, id);
      }

      const filePath = pitchDeckService.getPitchDeckPath(id);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Pitch deck file not found at path: ${filePath}`);
      }

      const fileStats = fs.statSync(filePath);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      );
      res.setHeader('Content-Disposition', `attachment; filename="pitch-deck-${id}.pptx"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Content-Length', fileStats.size);

      return fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      console.error('Pitch deck generation failed:', error);
      return res.status(500).json({
        error: 'Pitch deck generation failed',
        message: error.message
      });
    }
  }
};

module.exports = pitchDeckController;
