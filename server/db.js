const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/idea-validator';

async function connect() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🗄️  Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message || err);
    // Do not exit here; let the app try to continue (useful for dev without DB)
  }
}

module.exports = { connect, mongoose };
