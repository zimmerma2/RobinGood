var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StorySchema = Schema({
  title: {type: String, required: true, min:10, max:80},
  description: {type:String, required:true, max:1000},
  target_donation: {type: Number, required:true},
  closing_date: {type: Date, required: true}
  // category: {type: String}
  // image: {data: Buffer, contentType: String, required: true} // filepath to an image?
  //verification_media
  // [{type: Schema.ObjectId, ref: 'Genre'}]
  // user: {type: Schema.ObjectId, ref: 'User', required: true},
  // completion_status: {type: Number, required: true}, // simple yes/no (0 or 1)
  // total_views: {type: Number, required: true},
  // current_donation_status: {type: Number, required: true},
  // company: [{type: Schema.ObjectId, ref: 'Company', required: true}]
});

// Virtual for stpry's URL
StorySchema
.virtual('url')
.get(function () {
  return '/catalog/story/' + this._id;
});

//Export model
module.exports = mongoose.model('Story', StorySchema);
