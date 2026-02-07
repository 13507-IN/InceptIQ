const { listInvestors, matchInvestors } = require('../services/investorService');

const investorController = {
  list(req, res) {
    try {
      const filters = req.query || {};
      const data = listInvestors(filters);
      res.status(200).json({
        success: true,
        data,
        count: data.length
      });
    } catch (error) {
      console.error('Investor list failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load investors',
        message: error.message
      });
    }
  },

  match(req, res) {
    try {
      const criteria = req.body || {};
      const data = matchInvestors(criteria);
      res.status(200).json({
        success: true,
        data,
        count: data.length
      });
    } catch (error) {
      console.error('Investor match failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to match investors',
        message: error.message
      });
    }
  }
};

module.exports = investorController;
