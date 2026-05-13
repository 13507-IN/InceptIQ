const Competitor = require('../models/competitor');
const User = require('../models/user');
const aiService = require('../services/aiService');
const pushNotificationService = require('../services/pushNotificationService');

const competitorController = {
  async listCompetitors(req, res) {
    try {
      const competitors = await Competitor.find({ userId: req.user.id }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: competitors });
    } catch (error) {
      console.error('[Competitors] List failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to list competitors.' });
    }
  },

  async addCompetitor(req, res) {
    try {
      const { name, website, notes, analysisId } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, error: 'Competitor name is required.' });
      }

      const competitor = new Competitor({
        userId: req.user.id,
        name,
        website,
        notes,
        analysisId
      });

      await competitor.save();

      const user = await User.findById(req.user.id);
      if (user) {
        await pushNotificationService.sendActionNotification(
          user,
          '👀 Competitor Added',
          `You are now tracking ${name}. Generate a report to see how you compare!`,
          '/competitors'
        );
      }

      return res.status(201).json({ success: true, data: competitor });
    } catch (error) {
      console.error('[Competitors] Add failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to add competitor.' });
    }
  },

  async deleteCompetitor(req, res) {
    try {
      const { id } = req.params;
      const competitor = await Competitor.findOneAndDelete({ _id: id, userId: req.user.id });
      
      if (!competitor) {
        return res.status(404).json({ success: false, error: 'Competitor not found.' });
      }

      return res.status(200).json({ success: true, message: 'Competitor removed.' });
    } catch (error) {
      console.error('[Competitors] Delete failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete competitor.' });
    }
  },

  async generateReport(req, res) {
    try {
      const { id } = req.params;
      const competitor = await Competitor.findOne({ _id: id, userId: req.user.id });
      
      if (!competitor) {
        return res.status(404).json({ success: false, error: 'Competitor not found.' });
      }

      const user = await User.findById(req.user.id);

      // Extract user startup basic details (can use logic if analysisId is tied)
      let userStartup = null;
      if (competitor.analysisId && user) {
        let requestFound = user.requests.id(competitor.analysisId);
        if(!requestFound) {
            requestFound = user.requests.find(r => r.analysisId === competitor.analysisId);
        }
        if (requestFound) {
            userStartup = requestFound.input;
        }
      } else if (user && user.requests && user.requests.length > 0) {
          userStartup = user.requests[0].input;
      }

      const report = await aiService.generateCompetitorReport(competitor, userStartup);

      competitor.lastReport = report;
      competitor.lastReportAt = new Date();
      await competitor.save();

      if (user) {
        await pushNotificationService.sendActionNotification(
          user,
          '🤖 Competitor Intel Ready',
          `New AI intelligence report generated for ${competitor.name}.`,
          '/competitors'
        );
      }

      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error('[Competitors] Generate report failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to generate competitor report.' });
    }
  }
};

module.exports = competitorController;
