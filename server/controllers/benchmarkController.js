const User = require('../models/user');
const geminiService = require('../services/geminiService');
const pushNotificationService = require('../services/pushNotificationService');

const benchmarkController = {
  async getBenchmark(req, res) {
    try {
      const { industry } = req.params;
      const { userId, overallScore, ideaTitle } = req.query;

      if (!industry) {
        return res.status(400).json({ success: false, error: 'Industry is required.' });
      }

      const user = await User.findById(req.user.id);
      
      const benchmarkData = await geminiService.generateIndustryBenchmark(
        industry, 
        overallScore ? parseInt(overallScore) : null,
        ideaTitle
      );

      // Send notification
      if (user) {
        await pushNotificationService.sendActionNotification(
          user,
          '📊 Industry Benchmark Ready',
          `Your benchmark report for the ${industry} industry is ready to view.`,
          '/founder'
        );
      }

      return res.status(200).json({ success: true, data: benchmarkData });
    } catch (error) {
      console.error('[Benchmark] Fetch failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch benchmark.' });
    }
  }
};

module.exports = benchmarkController;
