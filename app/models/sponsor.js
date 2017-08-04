var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var SponsorSchema = Schema({
  company_name: {type: String, required: true, max:20},
  company_id: {type: String, required: true},
  password: {type: String, required:true, min: 6, max: 32},
  // logo: {data: Buffer, contentType: String, required: true}, // filepath to an image?
  // website: {type: String, required:true, max:20},
  // address: {type: String, required:true},
  // phone_number: {type: String, required: true},
  representative_first_name: {type: String, required: true},
  representative_last_name: {type: String, required: true},
  representative_email: {type:String, required: true}
  // representative_phone_number: {type: String, required: true},
  // total_donation: {type: Number, required: true},
  // average_per_view: {type: Number, required: true},
  // view_history ??
  // account_creation_date: {type: Date, required: true},
  // story_title: [{type: Schema.ObjectId, ref: 'Sponsor', required: true}]
});

// Virtual for stpry's URL
SponsorSchema
.virtual('url')
.get(function () {
  return '/catalog/sponsor/' + this._id;
});

//generate hash function
//======================
// generating a hash
SponsorSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
SponsorSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

//Export model
module.exports = mongoose.model('Sponsor', SponsorSchema);
