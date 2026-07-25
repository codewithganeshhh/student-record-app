const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'DEVELOPER'], required: true }
});

module.exports = mongoose.model('User', userSchema);
