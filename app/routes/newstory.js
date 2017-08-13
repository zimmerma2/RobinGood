var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var marked = require('marked');
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
  res.render('newstory.pug', { title: 'Create a New Story' });
});

/* POST to Add Project Service */
router.post('/addstory', upload.single('thumbnail'), function(req, res, next) {
  var uploadDir = 'app/public/'

  // Validate form entries
  req.checkBody('title','Story title is required.').notEmpty();
  req.checkBody('description','Story description is required.').notEmpty();
  req.checkBody('targetDonation','Target donation must be specified.').notEmpty();
  req.checkBody('endDate','Valid closing date is required.').isDate();
  req.checkBody('storyBody','Story body is required.').notEmpty();
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
  req.sanitize('storyBody').escape();
  req.sanitize('storyBody').trim();

  // Run the validators
  var errors = req.validationErrors();

  //Create a story object with escaped and trimmed data.
  var newStory = new Story();
  newStory.title = req.body.title;
  newStory.description = req.body.description;
  newStory.targetDonation = req.body.targetDonation;
  newStory.closingDate = req.body.endDate;


  console.log("\n\nStory Body:", req.body.storyBody, "\n\n");


  if (errors) {
    //If there are errors render the form again, passing the previously entered values and errors
    deleteUploaded(req.file.path);
    res.render('newstory.pug', { title: 'Create a New Story', story: newStory, errors: errors});
    return;
  } else {
    // Form data is valid, continue with processing
    newStory.openingDate = new Date();

    var fileExtension = req.file.originalname.split('.').pop();
    newStory.thumbnail = newStory._id + '.' + fileExtension;
    newStory.body_md = newStory._id + '.md';
    newStory.body_html = newStory._id + '.html';

    newStory.save(function(err) {
      if (err){
        console.log('\nError making new story.');
        // Delete uploaded file
        deleteUploaded(req.file.path);
        return next(err);
      } else {
        // Created story, save related files
        var thumbPath = uploadDir + 'thumbnails/' + newStory.thumbnail;
        var bodyPath_md = uploadDir + 'stories/markdown/' + newStory.body_md;
        var bodyPath_html = uploadDir + 'stories/html/' + newStory.body_html;

        // Move thumbnail
        fs.rename(req.file.path, thumbPath, function(err) {
          if (err) {return next(err)};
          console.log("\nStory created!\nID: ",newStory._id);
          console.log("Moved thumbnail to: ", thumbPath);
        });

        // Save story body - markdown
        fs.writeFile(bodyPath_md, req.body.storyBody, function (err) {
          if (err) {
            console.log('\nError writing file: ', bodyPath_md);
            // Delete uploaded file
            deleteUploaded(thumbPath);
            return next(err);
          }
          console.log('Wrote story body markdown to: ', bodyPath_md)
        });

        // Save story body - html
        var body_html = marked(req.body.storyBody);
        fs.writeFile(bodyPath_html, body_html, function (err) {
          if (err) {
            console.log('\nError writing file: ', bodyPath_html);
            // Delete uploaded files
            deleteUploaded(thumbPath);
            deleteUploaded(bodyPath_md);
            return next(err);
          }
          console.log('Wrote story body html to: ', bodyPath_html)
        });

        // Story succesfully created, redirect user to new page
        res.redirect('/story/' + newStory._id);
      }
    });
  }
});

module.exports = router;
