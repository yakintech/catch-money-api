const mongoose = require('mongoose');

const webuserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  confirmCode: { type: String, required: true }
});

const WebUser = mongoose.model('WebUser', webuserSchema);

module.exports = WebUser;