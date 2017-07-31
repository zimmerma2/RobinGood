var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var Story = require('../models/story');

var router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

//TODO place this in a better location
//Only accept images
// const imageFilter = function (req, file, cb) {
//     // accept image only
//     if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
//         return cb(new Error('Only image files are allowed!'), false);
//     }
//     cb(null, true);
// };

var uploading = multer({
  dest: __dirname + '../public/thumbnails/',
  limits: {fileSize: 1000000, files:1}
  // fileFilter: imageFilter
});

/* GET New Project page. */
router.get('/newstory', function(req, res) {
  res.render('newstory.jade', { title: 'Create a New Story' });
});

/* POST to Add Project Service */
// router.post('/addstory', uploading, function(req, res) {
router.post('/addstory', function(req, res) {

  // Set our internal DB variable
  // var db = req.db;

  // Get our form values. These rely on the "name" attributes
  var storyTitle = req.body.storyTitle;
  var storyDescription = req.body.storyDescription;
  var fundGoal = req.body.fundGoal;
  var endDate = req.body.endDate;

  // Set our collection
  // var collection = db.get('stories');

  // Get current date
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();


  var newStory = new Story();
  newStory.title = storyTitle;
  newStory.description = storyDescription;
  newStory.target_donation = fundGoal;
  newStory.closing_date = endDate;

  var inserted = newStory.save(function(err, result) {
		if (err) throw err;
    else
      // res.redirect('/stories');
});

  console.log("\nDocument inserted!\n\tID: ",inserted._id);
});

module.exports = router;
