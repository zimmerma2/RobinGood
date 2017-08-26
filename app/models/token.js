var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');

var TokenSchema = Schema({
  _userId: { type: Schema.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true, default: Date.now() + 3600000}
});

module.exports = mongoose.model('Token', TokenSchema);
