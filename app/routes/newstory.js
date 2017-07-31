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

var upload = multer({
  dest: 'app/public/thumbnails/',
  limits: {fileSize: 1000000, files:1}
  // fileFilter: imageFilter
});

/* GET New Project page. */
router.get('/newstory', function(req, res) {
  res.render('newstory.jade', { title: 'Create a New Story' });
});

/* POST to Add Project Service */
router.post('/addstory', upload.single('thumbnail'), function(req, res) {

  // Get our form values. These rely on the "name" attributes
  var storyTitle = req.body.storyTitle;
  var storyDescription = req.body.storyDescription;
  var fundGoal = req.body.fundGoal;
  var endDate = req.body.endDate;

  // Get current date
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();


  var newStory = new Story();
  newStory.title = storyTitle;
  newStory.description = storyDescription;
  newStory.target_donation = fundGoal;
  newStory.closing_date = endDate;

  var inserted = newStory.save(function(err, result) {
		if (err){
      console.log('Error making new story.');
      // req.flash('Error','Error making new story.');
      throw err;
    }
});

  console.log("FILENAME: ", req.file.filename);

  console.log("\nDocument inserted!\n\tID: ",inserted._id);
  res.redirect('/stories');
});

module.exports = router;
