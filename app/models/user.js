var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var Token = require('../models/token');


var UserSchema = Schema({
    email: {type: String, unique: true, max: 35},
    password: {type: String, required: true, min:6, max: 100},
    // user_photo: {data: Buffer, contentType: String, required: true}, // filepath to an image?
    // activity_status: {type: String, required: true},
    nickname: {type: String, min:3, max:32},
    // total_donation: {type: Number, required: true},
    //view_history
    // account_creation_date: {type: Date, required: true},
    isVerified: { type: Boolean, default: false },
    verification_token: { type: Schema.ObjectId, ref: 'Token'},
    date_of_birth: {type: Date},
    nationality: {type: String},
    address: {type: String},
    phone_number: {type: String},
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type: Date}
});


// UserSchema.pre('save', function(next) {
//   var user = this;
//   var SALT_FACTOR = 8;
//
//   if (!user.isModified('password')) return next();
//
//   bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
//     if (err) return next(err);
//
//     bcrypt.hash(user.password, salt, null, function(err, hash) {
//       if (err) return next(err);
//       user.password = hash;
//       next();
//     });
//   });
// });


UserSchema
.virtual('url')
.get(function () {
  return '/catalog/user/' + this._id;
});

//generate hash function
//======================
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

//Export model
module.exports = mongoose.model('User', UserSchema);
