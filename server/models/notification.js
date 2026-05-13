const { Schema, model } = require('mongoose');

const notificationTypes = ['investor_interest', 'founder_match', 'competitor_alert', 'system'];

const NotificationSchema = new Schema({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: notificationTypes, required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

module.exports = model('Notification', NotificationSchema);
