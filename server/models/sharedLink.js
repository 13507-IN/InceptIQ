const { Schema, model } = require('mongoose');

const SharedLinkSchema = new Schema({
  token: { type: String, required: true, unique: true, index: true },
  analysisId: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }  // TTL index — MongoDB auto-deletes when expired
});

// Default 30-day expiry
SharedLinkSchema.pre('validate', function (next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = model('SharedLink', SharedLinkSchema);
