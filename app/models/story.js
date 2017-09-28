var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StorySchema = Schema({
  title: {type: String, required: true, min:10, max:80},
  description: {type:String, required:true, max:1000},
  targetDonation: {type: Number, required:true},
  openingDate: {type: Date, required: true},
  closingDate: {type: Date, required: true},
  thumbnail: {type: String, required: true},
  body_md: {type: String, required: true},
  body_html: {type: String, required: true},
  location: {
    streetAddress: {type: String, required: false, max:200},
    city: {type: String, required: true, max:100},
    state: {type: String, required: true, uppercase: true, max: 2},
    zipCode: {type: Number, required: true, validate: /\d{5}/}
  }
  // category: {type: String}
  //verification_media
  // [{type: Schema.ObjectId, ref: 'Genre'}]
  // user: {type: Schema.ObjectId, ref: 'User', required: true},
  // completion_status: {type: Number, required: true}, // simple yes/no (0 or 1)
  // total_views: {type: Number, required: true},
  // current_donation_status: {type: Number, required: true},
  // company: [{type: Schema.ObjectId, ref: 'Company', required: true}]
});

StorySchema.methods.locationString = function() {
  const location = this.location;
  if (location.streetAddress)
    ret = location.streetAddress + '\n';
  else
    ret = ''

  return  ret + location.city + ', ' + location.state + ' ' + location.zipCode;
}

// Virtual for story's URL
StorySchema
.virtual('url')
.get(function () {
  return '/catalog/story/' + this._id;
});

//Export model
module.exports = mongoose.model('Story', StorySchema);
