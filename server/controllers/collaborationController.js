const User = require('../models/user');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MAX_INVITES = 20;

const normalizeEmailList = (payload) => {
  const raw = Array.isArray(payload)
    ? payload
    : (typeof payload === 'string' ? [payload] : []);

  const split = raw
    .flatMap((entry) => String(entry).split(/[,\s]+/))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(split));
};

const buildSharedBy = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name || null
});

const buildCollaborator = (user, role) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name || null,
  role: role || 'viewer',
  addedAt: new Date().toISOString()
});

const collaborationController = {
  async getCollaboration(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Missing analysis ID' });
      }

      const user = await User.findById(req.user.id).lean();
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const request = (user.requests || []).find(r => r.id === id);
      if (!request) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      if (request.shared) {
        return res.status(200).json({
          success: true,
          analysisId: id,
          role: 'collaborator',
          sharedBy: request.sharedBy || null,
          sharedAt: request.sharedAt || null,
          collaborators: []
        });
      }

      return res.status(200).json({
        success: true,
        analysisId: id,
        role: 'owner',
        collaborators: (request.collaborators || []).map(c => ({
          id: c.id,
          email: c.email,
          name: c.name || null,
          role: c.role || 'viewer',
          addedAt: c.addedAt
        }))
      });
    } catch (error) {
      console.error('Failed to load collaboration info:', error);
      res.status(500).json({
        error: 'Failed to load collaboration info',
        message: error.message
      });
    }
  },

  async inviteCollaborators(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Missing analysis ID' });
      }

      const role = req.body?.role || 'viewer';
      const emails = normalizeEmailList(req.body?.emails || req.body?.email);

      if (emails.length === 0) {
        return res.status(400).json({ error: 'No emails provided' });
      }

      if (emails.length > MAX_INVITES) {
        return res.status(400).json({ error: `Too many emails. Max ${MAX_INVITES} at a time.` });
      }

      const owner = await User.findById(req.user.id);
      if (!owner) {
        return res.status(404).json({ error: 'User not found' });
      }

      const request = (owner.requests || []).find(r => r.id === id);
      if (!request) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      if (request.shared) {
        return res.status(403).json({ error: 'Only owners can invite collaborators' });
      }

      if (!request.collaborators) request.collaborators = [];

      const added = [];
      const skipped = [];
      const errors = [];

      for (const email of emails) {
        if (!EMAIL_REGEX.test(email)) {
          errors.push({ email, reason: 'Invalid email format' });
          continue;
        }

        if (email === owner.email) {
          skipped.push({ email, reason: 'Owner cannot be added as collaborator' });
          continue;
        }

        const alreadyAdded = request.collaborators.find(c => c.email === email);
        if (alreadyAdded) {
          skipped.push({ email, reason: 'Already a collaborator' });
          continue;
        }

        const collaboratorUser = await User.findOne({ email });
        if (!collaboratorUser) {
          errors.push({ email, reason: 'User not found. Ask them to sign up first.' });
          continue;
        }

        const collaboratorEntry = buildCollaborator(collaboratorUser, role);
        request.collaborators.push(collaboratorEntry);
        added.push(collaboratorEntry);

        if (!collaboratorUser.requests) collaboratorUser.requests = [];

        const sharedBy = buildSharedBy(owner);
        const existingRequest = collaboratorUser.requests.find(r => r.id === id);
        if (existingRequest) {
          existingRequest.shared = true;
          existingRequest.sharedBy = sharedBy;
          existingRequest.sharedAt = new Date().toISOString();
          if (!existingRequest.analysis && request.analysis) existingRequest.analysis = request.analysis;
          if (!existingRequest.input && request.input) existingRequest.input = request.input;
          if (!existingRequest.createdAt && request.createdAt) existingRequest.createdAt = request.createdAt;
        } else {
          collaboratorUser.requests.push({
            id,
            input: request.input,
            analysis: request.analysis,
            createdAt: request.createdAt,
            shared: true,
            sharedBy,
            sharedAt: new Date().toISOString()
          });
        }

        await collaboratorUser.save();
      }

      await owner.save();

      res.status(200).json({
        success: true,
        analysisId: id,
        invited: added,
        skipped,
        errors,
        collaborators: request.collaborators || []
      });
    } catch (error) {
      console.error('Failed to invite collaborators:', error);
      res.status(500).json({
        error: 'Failed to invite collaborators',
        message: error.message
      });
    }
  }
};

module.exports = collaborationController;
