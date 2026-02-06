const { Schema, model } = require('mongoose');

const SharedBySchema = new Schema({
  id: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  name: { type: String, default: null }
}, { _id: false });

const CollaboratorSchema = new Schema({
  id: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  name: { type: String, default: null },
  role: { type: String, default: 'viewer' },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const RequestSchema = new Schema({
  id: { type: String, required: true },
  input: { type: Object, default: {} },
  analysis: { type: Object, default: null }, // Store full analysis data for persistence
  createdAt: { type: Date, default: Date.now },
  shared: { type: Boolean, default: false },
  sharedBy: { type: SharedBySchema, default: null },
  sharedAt: { type: Date, default: null },
  collaborators: { type: [CollaboratorSchema], default: [] }
}, { _id: false });

const UserSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  requests: { type: [RequestSchema], default: [] }
}, { _id: false });

UserSchema.methods.addRequest = async function (summary) {
  this.requests.push(summary);
  // keep max 200
  if (this.requests.length > 200) this.requests = this.requests.slice(-200);
  return this.save();
};

module.exports = model('User', UserSchema);
