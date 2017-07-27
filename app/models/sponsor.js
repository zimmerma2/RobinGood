var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SponsorSchema = Schema({
  name: {type: String, required: true, max:20},
  // logo: {data: Buffer, contentType: String, required: true}, // filepath to an image?
  website: {type: String, required:true, max:20},
  address: {type: String, required:true},
  phone_number: {type: String, required: true},
  representative_first_name: {type: String, required: true},
  representative_second_name: {type: String, required: true},
  representative_email: {type:String, required: true},
  representative_phone_number: {type: String, required: true},
  password: {type: String, required:true, min: 6, max: 32},
  total_donation: {type: Number, required: true},
  average_per_view: {type: Number, required: true},
  // view_history ??
  account_creation_date: {type: Date, required: true},
  story_title: [{type: Schema.ObjectId, ref: 'Story', required: true}]
});

// Virtual for stpry's URL
SponsorSchema
.virtual('url')
.get(function () {
  return '/catalog/sponsor/' + this._id;
});

//Export model
module.exports = mongoose.model('Story', SponsorSchema);
