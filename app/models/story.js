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
  body_html: {type: String, required: true}
  // category: {type: String}
  //verification_media
  // [{type: Schema.ObjectId, ref: 'Genre'}]
  // user: {type: Schema.ObjectId, ref: 'User', required: true},
  // completion_status: {type: Number, required: true}, // simple yes/no (0 or 1)
  // total_views: {type: Number, required: true},
  // current_donation_status: {type: Number, required: true},
  // company: [{type: Schema.ObjectId, ref: 'Company', required: true}]
});

// Virtual for story's URL
StorySchema
.virtual('url')
.get(function () {
  return '/catalog/story/' + this._id;
});

//Export model
module.exports = mongoose.model('Story', StorySchema);
