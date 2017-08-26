var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');

var TokenSchema = Schema({
  _userId: { type: Schema.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 600 }
});

module.exports = mongoose.model('Token', TokenSchema);
