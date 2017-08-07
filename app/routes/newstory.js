var express = require('express');
var fs = require('fs');
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
  dest: 'temp/',
  limits: {fileSize: 1000000, files:1}
  // fileFilter: imageFilter
});

function deleteUploaded(filePath) {
  fs.unlink(filePath, function(err) {
    if (err) throw err;
    console.log("\nDeleted uploaded file at: ", filePath);
  });
}

/* GET New Project page. */
router.get('/newstory', function(req, res) {
  res.render('newstory.jade', { title: 'Create a New Story' });
});

/* POST to Add Project Service */
router.post('/addstory', upload.single('thumbnail'), function(req, res) {
  var uploadDir = 'app/public/thumbnails/'

  // Validate form entries
  req.checkBody('title','Story title is required.').notEmpty();
  req.checkBody('description','Story description is required.').notEmpty();
  req.checkBody('targetDonation','Target donation must be specified.').notEmpty();
  req.checkBody('endDate','Valid closing date is required.').isDate();
  // TODO validate thumbnail

  // Sanitize form entries
  req.sanitize('title').escape();
  req.sanitize('title').trim();
  req.sanitize('description').escape();
  req.sanitize('description').trim();
  req.sanitize('targetDonation').escape();
  req.sanitize('targetDonation').toFloat();
  req.sanitize('endDate').escape();
  req.sanitize('endDate').toDate();

  // Run the validators
  var errors = req.validationErrors();

  //Create a story object with escaped and trimmed data.
  var newStory = new Story();
  newStory.title = req.body.title;
  newStory.description = req.body.description;
  newStory.target_donation = req.body.targetDonation;
  newStory.closing_date = req.body.endDate;


  console.log("\n\nStory Body:", req.body.storyBody, "\n\n");


  if (errors) {
    //If there are errors render the form again, passing the previously entered values and errors
    deleteUploaded(req.file.path);
    res.render('newstory.jade', { title: 'Create a New Story', story: newStory, errors: errors});
    return;
  } else {
    // Form data is valid, continue with processing
    newStory.opening_date = new Date();

    var fileExtension = req.file.originalname.split('.').pop();
    newStory.thumbnail = newStory._id + '.' + fileExtension;

    newStory.save(function(err) {
      if (err){
        console.log('\nError making new story.');
        // Delete uploaded file
        deleteUploaded(req.file.path);
        return next(err);
      } else {
        // Created story, move thumbnail
        var uploadPath = uploadDir + newStory.thumbnail;
        fs.rename(req.file.path, uploadPath, function(err) {
          if (err) {return next(err)};
          console.log("\nStory created!\n\tID: ",newStory._id);
          console.log("\nMoved thumbnail to:", uploadPath);
        })
        res.redirect('/story/' + newStory._id);
      }
    });
  }
});

module.exports = router;
