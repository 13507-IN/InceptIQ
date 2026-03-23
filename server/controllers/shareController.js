const crypto = require('crypto');
const SharedLink = require('../models/sharedLink');
const User = require('../models/user');

const shareController = {
  /**
   * POST /api/share
   * Creates a shareable link for an analysis.
   * Requires authentication.
   */
  async createShareLink(req, res) {
    try {
      const { analysisId } = req.body;

      if (!analysisId) {
        return res.status(400).json({
          success: false,
          error: 'Missing analysisId',
          message: 'Please provide the analysis ID to share.'
        });
      }

      const userId = req.user.id;

      // Verify the analysis exists in the user's DB record
      const user = await User.findById(userId).lean();
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'Your user record was not found.'
        });
      }

      const request = user.requests?.find(r => r.id === analysisId);
      if (!request || !request.analysis) {
        return res.status(404).json({
          success: false,
          error: 'Analysis not found',
          message: 'No analysis found with this ID in your account.'
        });
      }

      // Check if a share link already exists for this analysis by this user
      const existing = await SharedLink.findOne({ analysisId, userId }).lean();
      if (existing) {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        return res.status(200).json({
          success: true,
          token: existing.token,
          shareUrl: `${clientUrl}/share/${existing.token}`,
          expiresAt: existing.expiresAt,
          message: 'Share link already exists.'
        });
      }

      // Generate a secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const sharedLink = new SharedLink({
        token,
        analysisId,
        userId,
        expiresAt
      });

      await sharedLink.save();

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

      console.log(`🔗 Share link created for analysis ${analysisId} by user ${userId}`);

      res.status(201).json({
        success: true,
        token,
        shareUrl: `${clientUrl}/share/${token}`,
        expiresAt,
        message: 'Share link created successfully.'
      });

    } catch (error) {
      console.error('❌ Failed to create share link:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to create share link',
        message: error.message
      });
    }
  },

  /**
   * GET /api/share/:token
   * Retrieves analysis data via a share token.
   * No authentication required.
   */
  async getSharedAnalysis(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Missing token',
          message: 'Share token is required.'
        });
      }

      // Find the shared link
      const sharedLink = await SharedLink.findOne({ token }).lean();
      if (!sharedLink) {
        return res.status(404).json({
          success: false,
          error: 'Link not found',
          message: 'This share link does not exist or has expired.'
        });
      }

      // Check expiry (belt-and-suspenders — TTL should handle this, but just in case)
      if (new Date() > new Date(sharedLink.expiresAt)) {
        return res.status(410).json({
          success: false,
          error: 'Link expired',
          message: 'This share link has expired.'
        });
      }

      // Fetch the live analysis from the owner's DB record
      const user = await User.findById(sharedLink.userId).lean();
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Analysis unavailable',
          message: 'The analysis owner\'s account was not found.'
        });
      }

      const request = user.requests?.find(r => r.id === sharedLink.analysisId);
      if (!request || !request.analysis) {
        return res.status(404).json({
          success: false,
          error: 'Analysis deleted',
          message: 'This analysis has been deleted by the owner and is no longer available.'
        });
      }

      console.log(`📊 Shared analysis accessed: ${sharedLink.analysisId} via token ${token.substring(0, 8)}...`);

      res.status(200).json({
        success: true,
        data: request.analysis,
        input: request.input || null,
        sharedAt: sharedLink.createdAt,
        expiresAt: sharedLink.expiresAt,
        source: 'shared'
      });

    } catch (error) {
      console.error('❌ Failed to retrieve shared analysis:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve shared analysis',
        message: error.message
      });
    }
  }
};

module.exports = shareController;
