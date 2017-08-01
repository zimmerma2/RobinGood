var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
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

var upload = multer({
  dest: 'temp/',
  limits: {fileSize: 1000000, files:1}
  // fileFilter: imageFilter
});

/* GET New Project page. */
router.get('/newstory', function(req, res) {
  res.render('newstory.jade', { title: 'Create a New Story' });
});

/* POST to Add Project Service */
router.post('/addstory', upload.single('thumbnail'), function(req, res) {
  var uploadDir = 'app/public/thumbnails/'

  // Get our form values. These rely on the "name" attributes
  var storyTitle = req.body.storyTitle;
  var storyDescription = req.body.storyDescription;
  var fundGoal = req.body.fundGoal;
  var endDate = req.body.endDate;

  var newStory = new Story();
  newStory.title = storyTitle;
  newStory.description = storyDescription;
  newStory.target_donation = fundGoal;
  newStory.closing_date = endDate;
  newStory.opening_date = new Date();
  newStory.thumbnail = newStory._id + '.jpg';

  console.log(newStory.thumbnail);

  newStory.save(function(err) {
		if (err){
      console.log('\nError making new story.');
      // req.flash('Error','Error making new story.');
      throw err;
      fs.unlink(req.file.path, function(err) {
        if (err) throw err;
        console.log("\nDeleted thumbnail.");
      })
    } else {
      var uploadPath = uploadDir + newStory.thumbnail;
      fs.rename(req.file.path, uploadPath, function(err) {
        if (err) throw err;
        console.log("\nMoved thumbnail to:", uploadPath);
      })
    }
});

  console.log("\nDocument inserted!\n\tID: ",newStory._id);
  res.redirect('/stories');
});

module.exports = router;
