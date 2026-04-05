const { Schema, model } = require('mongoose');

const CompetitorSchema = new Schema({
  userId: { type: String, required: true },
  analysisId: { type: String, default: null },
  name: { type: String, required: true },
  website: { type: String, default: '' },
  notes: { type: String, default: '' },
  lastReport: { type: Object, default: null },
  lastReportAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Competitor', CompetitorSchema);
