const { Schema, model } = require('mongoose');

const IdeaSchema = new Schema({
  ideaTitle: { type: String, default: '' },
  ideaDescription: { type: String, default: '' },
  targetMarket: { type: String, default: '' },
  businessModel: { type: String, default: '' },
  industry: { type: String, default: '' },
  budget: { type: String, default: '' },
  timeline: { type: String, default: '' },
  ideaType: { type: String, default: '' }
}, { _id: false });

const AuthorSchema = new Schema({
  id: { type: String, default: null },
  email: { type: String, default: null },
  name: { type: String, default: null }
}, { _id: false });

const VoteSchema = new Schema({
  up: { type: [String], default: [] },
  down: { type: [String], default: [] },
  like: { type: [String], default: [] }
}, { _id: false });

const CommunityPostSchema = new Schema({
  id: { type: String, required: true, unique: true },
  analysisId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  idea: { type: IdeaSchema, required: true },
  author: { type: AuthorSchema, default: null },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  votes: { type: VoteSchema, default: () => ({}) }
}, { versionKey: false });

CommunityPostSchema.index({ createdAt: -1 });

module.exports = model('CommunityPost', CommunityPostSchema);
