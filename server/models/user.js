const { Schema, model } = require('mongoose');

const RequestSchema = new Schema({
  id: { type: String, required: true },
  input: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
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
