const { v4: uuidv4 } = require('uuid');
const { mongoose } = require('../db');
const Notification = require('../models/notification');
const { notificationStorage } = require('../utils/storage');

const isDbConnected = () => mongoose?.connection?.readyState === 1;

class NotificationService {
  async create(userId, type, title, body = '', data = {}) {
    const record = {
      id: uuidv4(),
      userId,
      type,
      title,
      body,
      data,
      read: false,
      createdAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      const doc = await Notification.create({
        userId,
        type,
        title,
        body,
        data,
        read: false,
        createdAt: new Date()
      });
      return {
        ...record,
        id: doc._id.toString(),
        createdAt: doc.createdAt.toISOString()
      };
    }

    notificationStorage.add(record);
    return record;
  }

  async list(userId, limit = 50) {
    if (isDbConnected()) {
      const docs = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      return docs.map(d => ({
        id: d._id.toString(),
        userId: d.userId,
        type: d.type,
        title: d.title,
        body: d.body,
        data: d.data,
        read: d.read,
        createdAt: d.createdAt.toISOString()
      }));
    }

    return notificationStorage.list().filter(n => n.userId === userId).slice(0, limit);
  }

  async getUnreadCount(userId) {
    if (isDbConnected()) {
      return Notification.countDocuments({ userId, read: false });
    }

    return notificationStorage.list().filter(n => n.userId === userId && !n.read).length;
  }

  async markAsRead(notificationId, userId) {
    if (isDbConnected()) {
      const result = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true },
        { new: true }
      ).lean();
      return !!result;
    }

    return notificationStorage.markRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    if (isDbConnected()) {
      const result = await Notification.updateMany(
        { userId, read: false },
        { read: true }
      );
      return result.modifiedCount;
    }

    return notificationStorage.markAllRead(userId);
  }
}

module.exports = new NotificationService();
